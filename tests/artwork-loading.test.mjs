import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('public grid has no provider lookup or image-comparison dependency', () => {
  const grid = readFileSync(new URL('../src/components/MainContainer.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(grid, /useJikanAnime|useArtworkSource|getJikan|artworkGallery/);
  assert.match(grid, /SavedArtwork/);
  assert.match(grid, /priority=\{index === 0\}/);
  assert.match(grid, /lazy=\{index > 2\}/);
});

test('detail images do not wait for optional synopsis requests', () => {
  const page = readFileSync(new URL('../src/components/AnimePage.tsx', import.meta.url), 'utf8');
  const artwork = page.match(/<AnimeArtwork[^>]+\/>/)[0];
  assert.doesNotMatch(artwork, /jikan|ready=/);
});
