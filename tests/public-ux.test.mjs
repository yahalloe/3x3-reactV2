import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionPath, activeSection, canonicalSlug } from '../src/lib/publicNavigation.ts';
import { parseSnapshot, saveSnapshot, CONTENT_CACHE_KEY } from '../src/lib/contentCache.ts';

test('navigation resolves explicit collection parents and legacy anime aliases', () => {
  assert.equal(collectionPath('favorites'), '/');
  assert.equal(collectionPath('romcom'), '/romcom');
  assert.equal(collectionPath('new-shelf'), '/collection/new-shelf');
  assert.equal(activeSection('/anime/saekano', 'romcom'), 'romcom');
  assert.equal(activeSection('/collection/drama'), 'drama');
  assert.equal(activeSection('/anime/hyouka', 'favorites'), 'archive');
  assert.equal(activeSection('/music'), 'collections');
  assert.equal(activeSection('/about'), 'about');
  assert.equal(canonicalSlug('bokuyaba'), 'the-dangers-in-my-heart');
});

const settings = {homeTitle:'Archive',archiveLabel:'Archive',aboutTitle:'About',aboutBody:'About',footerText:'Footer'};
const collection = {id:'c',slug:'romcom',title:'Romcom',description:'Shows',eyebrow:'Collection',coverImageUrl:'/cover.jpg',sortOrder:0,isPublished:true};
const anime = {id:'a',slug:'anime',title:'Anime',collectionId:'c',collectionSlug:'romcom',synopsis:'Story',cardImageUrl:'/image.jpg',detailImageUrl:'/image.jpg',editorNote:'',sortOrder:0,isPublished:true,streamingProviders:[]};
test('snapshot rejects malformed cached data and retains valid empty catalogs', () => {
  for (const raw of [null, 'broken', '{}', '{"anime": [null]}']) assert.equal(parseSnapshot(raw), null);
  assert.deepEqual(parseSnapshot(JSON.stringify({anime:[],collections:[],settings})), {anime:[],collections:[],settings});
  assert.ok(parseSnapshot(JSON.stringify({anime:[anime],collections:[collection],settings})));
});
test('offline cache never stores drafts or entries in unpublished collections', () => {
  let saved;
  globalThis.localStorage = {setItem: (key,value) => { assert.equal(key,CONTENT_CACHE_KEY); saved = JSON.parse(value); }};
  saveSnapshot({settings, collections:[collection,{...collection,id:'hidden',isPublished:false}],anime:[anime,{...anime,id:'draft',isPublished:false},{...anime,id:'hidden-child',collectionId:'hidden'}]});
  assert.deepEqual(saved.anime.map(item=>item.id), ['a']);
  assert.deepEqual(saved.collections.map(item=>item.id), ['c']);
  globalThis.localStorage = {setItem: () => {throw new Error('Storage disabled');}};
  assert.doesNotThrow(()=>saveSnapshot({settings,collections:[],anime:[]}));
});
