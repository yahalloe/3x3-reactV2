import { test } from 'node:test';
import assert from 'node:assert/strict';
import { artworkGallery } from '../src/lib/artworkGallery.ts';

test('gallery combines MAL pictures and verified Kitsu originals, excluding a sequel', async () => {
  globalThis.fetch = async (url) => {
    const address = String(url);
    if (address.includes('kitsu.app/api/edge')) return Response.json({
      data: [
        { id: '124', attributes: { canonicalTitle: 'Hyouka sequel', posterImage: { original: 'wrong.jpg' } } },
        { id: '123', attributes: { canonicalTitle: 'Hyouka', posterImage: { original: 'poster.jpg' }, coverImage: { original: 'banner.jpg' } }, relationships: { mappings: { data: [{ id: 'mapping', type: 'mappings' }] } } },
      ], included: [{ id: 'mapping', type: 'mappings', attributes: { externalSite: 'myanimelist/anime', externalId: '12189' } }],
    });
    if (address.endsWith('/pictures')) return Response.json({ data: [{ jpg: { large_image_url: 'gallery.jpg' } }, { jpg: { large_image_url: 'gallery.jpg' } }] });
    return Response.json({ data: { mal_id: 12189, images: { jpg: { large_image_url: 'main.jpg' } } } });
  };
  const result = await artworkGallery('hyouka', 'Hyouka', new AbortController().signal);
  assert.deepEqual(result.images.map((entry) => entry.url), ['gallery.jpg', 'poster.jpg', 'banner.jpg']);
  assert.equal(result.partial, false);
});

test('one unavailable provider retains the other provider results', async () => {
  globalThis.fetch = async (url) => {
    if (String(url).includes('kitsu.app')) throw new Error('Offline');
    return Response.json({ data: [{ jpg: { large_image_url: 'gallery.jpg' } }] });
  };
  const result = await artworkGallery('hyouka', 'Hyouka', new AbortController().signal);
  assert.equal(result.partial, true);
  assert.equal(result.images.some((entry) => entry.url === 'gallery.jpg'), true);
});

test('cancelled lookup is not returned as an empty gallery', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(artworkGallery('hyouka', 'Hyouka', controller.signal), { name: 'AbortError' });
});
