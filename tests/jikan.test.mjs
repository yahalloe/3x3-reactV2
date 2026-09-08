import { test } from 'node:test';
import assert from 'node:assert/strict';
import { animeImportFields, getJikanAnime, searchJikanAnime } from '../src/lib/jikan.ts';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
const item = (id, title) => ({ mal_id: id, title, synopsis: ' Full synopsis. ', images: { webp: { large_image_url: 'https://cdn.myanimelist.net/cover.webp' } } });

test('Jikan catalog, caching, search and failure behavior', async (t) => {
  await t.test('pins known titles, deduplicates requests and caches responses', async () => {
    let calls = 0;
    globalThis.fetch = async (url) => {
      calls++;
      assert.equal(url, 'https://api.jikan.moe/v4/anime/12189');
      return Response.json({ data: item(12189, 'Hyouka') });
    };
    const first = getJikanAnime('hyouka', 'Hyouka');
    assert.equal(first, getJikanAnime('hyouka', 'Hyouka'));
    const data = await first;
    assert.equal(data.synopsis, 'Full synopsis.');
    assert.equal(data.imageUrl, 'https://cdn.myanimelist.net/cover.webp');
    assert.deepEqual(await getJikanAnime('hyouka', 'Hyouka'), data);
    assert.equal(calls, 1);
    assert.equal(storage.size, 1);
  });
  await t.test('skips placeholders and empty titles', async () => {
    globalThis.fetch = () => { throw new Error('Unexpected request'); };
    assert.equal(await getJikanAnime('dunno', 'Dunno'), null);
    assert.equal(await getJikanAnime('', ''), null);
  });
  await t.test('matches aliases instead of the first search result', async () => {
    globalThis.fetch = async () => Response.json({ data: [item(2, 'New Show Season 2'), { ...item(3, 'Japanese Title'), titles: [{ title: 'New Show' }] }] });
    assert.equal((await getJikanAnime('new-show', 'New Show')).malId, 3);
  });
  await t.test('does not use an unrelated search result', async () => {
    globalThis.fetch = async () => Response.json({ data: [item(2, 'Unrelated')] });
    assert.equal(await getJikanAnime('unmatched', 'Missing Show'), null);
  });
  await t.test('retries rate limits and accepts missing optional fields', async () => {
    let calls = 0;
    globalThis.fetch = async () => ++calls === 1 ? new Response(null, { status: 429 }) : Response.json({ data: { mal_id: 52991 } });
    assert.deepEqual(await getJikanAnime('frieren', 'Frieren'), { malId: 52991, imageUrl: null, synopsis: null });
    assert.equal(calls, 2);
  });
  await t.test('falls back after network failure and suppresses immediate repeat requests', async () => {
    let calls = 0;
    globalThis.fetch = async () => { calls++; throw new TypeError('Network unavailable'); };
    assert.equal(await getJikanAnime('edgerunner', 'Cyberpunk'), null);
    assert.equal(await getJikanAnime('edgerunner', 'Cyberpunk'), null);
    assert.equal(calls, 1);
  });
  await t.test('works when browser storage is blocked', async () => {
    globalThis.localStorage = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Blocked'); } };
    globalThis.fetch = async () => Response.json({ data: item(5081, 'Bakemonogatari') });
    assert.equal((await getJikanAnime('monogatari', 'Monogatari')).malId, 5081);
  });
});

test('editor search and selected anime identity', async (t) => {
  await t.test('search is not blocked by an unfinished cover response', async () => {
    let releaseCover;
    let markCoverStarted;
    const coverStarted = new Promise((resolve) => { markCoverStarted = resolve; });
    const coverResponse = new Promise((resolve) => { releaseCover = resolve; });
    globalThis.fetch = async (url) => {
      if (url.endsWith('/anime/99004')) {
        markCoverStarted();
        return coverResponse;
      }
      return Response.json({ data: [item(99005, 'Queue Test')] });
    };
    const cover = getJikanAnime('mal-99004', 'Slow Cover');
    await coverStarted;
    let timer;
    try {
      const result = await Promise.race([
        searchJikanAnime('Queue Test'),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Search blocked by cover')), 3500); }),
      ]);
      assert.equal(result[0].malId, 99005);
    } finally {
      clearTimeout(timer);
      releaseCover(Response.json({ data: item(99004, 'Slow Cover') }));
      await cover;
    }
  });
  await t.test('maps dropdown data, deduplicates results and caches the query', async () => {
    let calls = 0;
    globalThis.fetch = async (url) => {
      calls++;
      assert.equal(url, 'https://api.jikan.moe/v4/anime?q=Test%20%26%20Show');
      return Response.json({ data: [
        { ...item(99001, 'Japanese Title'), title_english: 'English Title', type: 'TV', year: 2025 },
        item(99001, 'Duplicate'),
        { mal_id: 99002, title: 'A Movie', synopsis: null, images: { jpg: { image_url: 'https://example.com/movie.jpg' } } },
      ] });
    };
    const results = await searchJikanAnime(' Test & Show ');
    assert.equal(results.length, 2);
    assert.deepEqual(results[0], { malId: 99001, title: 'English Title', type: 'TV', year: 2025, synopsis: 'Full synopsis.', imageUrl: 'https://cdn.myanimelist.net/cover.webp' });
    assert.equal(results[1].synopsis, null);
    assert.equal(results[1].imageUrl, 'https://example.com/movie.jpg');
    assert.deepEqual(await searchJikanAnime('test & show'), results);
    assert.equal(calls, 1);
  });
  await t.test('does not request short queries or cancelled searches', async () => {
    globalThis.fetch = () => { throw new Error('Unexpected request'); };
    assert.deepEqual(await searchJikanAnime('a'), []);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(searchJikanAnime('cancelled', controller.signal), { name: 'AbortError' });
  });
  await t.test('exposes API errors to the editor instead of treating them as no results', async () => {
    globalThis.fetch = async () => new Response(null, { status: 400 });
    await assert.rejects(searchJikanAnime('bad request'), /Jikan request failed/);
  });
  await t.test('keeps a selected season tied to its MAL ID on public pages', async () => {
    globalThis.fetch = async (url) => {
      assert.equal(url, 'https://api.jikan.moe/v4/anime/99003');
      return Response.json({ data: item(99003, 'Chosen Season') });
    };
    assert.equal((await getJikanAnime('mal-99003', 'Chosen Season')).malId, 99003);
  });
  await t.test('fills Your Name from Kitsu when Jikan search returns 504', async () => {
    const calls = [];
    globalThis.fetch = async (url) => {
      calls.push(url);
      if (url.startsWith('https://api.jikan.moe/')) return new Response(null, { status: 504 });
      assert.equal(new URL(url).searchParams.get('filter[text]'), 'your name');
      return Response.json({
        data: [{ id: '11614', attributes: {
          canonicalTitle: 'Kimi no Na wa.', titles: { en: 'Your Name.' }, synopsis: 'Mitsuha and Taki switch bodies.',
          subtype: 'movie', startDate: '2016-08-26', posterImage: { large: 'https://media.kitsu.app/your-name.jpg' },
        }, relationships: { mappings: { data: [{ type: 'mappings', id: '895' }] } } }],
        included: [{ type: 'mappings', id: '895', attributes: { externalSite: 'myanimelist/anime', externalId: '32281' } }],
      });
    };
    const [result] = await searchJikanAnime('your name');
    assert.equal(result.source, 'kitsu');
    assert.equal(calls.length, 2);
    assert.deepEqual(animeImportFields(result), {
      slug: 'mal-32281', title: 'Your Name.', synopsis: 'Mitsuha and Taki switch bodies.',
      cardImageUrl: 'https://media.kitsu.app/your-name.jpg', detailImageUrl: 'https://media.kitsu.app/your-name.jpg',
    });
    assert.deepEqual(await searchJikanAnime('your name'), [result]);
    assert.equal(calls.length, 2);
  });
  await t.test('keeps unmapped fallback IDs separate from MAL and preserves imported metadata', async () => {
    globalThis.fetch = async (url) => url.startsWith('https://api.jikan.moe/') ? new Response(null, { status: 503 }) : Response.json({
      data: [{ id: '555', attributes: { canonicalTitle: 'Unmapped', synopsis: 'Saved description' } }],
    });
    const [result] = await searchJikanAnime('unmapped anime');
    assert.equal(result.malId, null);
    assert.equal(animeImportFields(result).slug, 'kitsu-555');
    globalThis.fetch = () => { throw new Error('Must not search MAL for a Kitsu-only ID'); };
    assert.equal(await getJikanAnime('kitsu-555', 'Unmapped'), null);
  });
  await t.test('reports failure if both providers are unavailable', async () => {
    globalThis.fetch = async () => new Response(null, { status: 504 });
    await assert.rejects(searchJikanAnime('both unavailable'), /Both Jikan and the Kitsu fallback/);
  });
  await t.test('aborts before starting fallback when the query has changed', async () => {
    const controller = new AbortController();
    let calls = 0;
    globalThis.fetch = async () => { calls++; controller.abort(); throw new Error('Cancelled'); };
    await assert.rejects(searchJikanAnime('obsolete query', controller.signal), { name: 'AbortError' });
    assert.equal(calls, 1);
  });
});
