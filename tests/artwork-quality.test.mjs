import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sharpestArtwork } from '../src/lib/artworkQuality.ts';

test('a small API poster cannot replace high-resolution saved artwork', () => {
  assert.equal(sharpestArtwork([
    { url: 'saved', width: 1920, height: 1080 },
    { url: 'api', width: 450, height: 640 },
  ]), 'saved');
});
test('a higher-resolution alternative upgrades a small saved thumbnail', () => {
  assert.equal(sharpestArtwork([
    { url: 'thumbnail', width: 120, height: 180 },
    { url: 'original', width: 1000, height: 1500 },
  ]), 'original');
});
test('square crops use the shorter dimension, not total pixel count', () => {
  assert.equal(sharpestArtwork([
    { url: 'panorama', width: 3000, height: 200 },
    { url: 'poster', width: 600, height: 900 },
  ]), 'poster');
});
test('contained artwork accounts for its uncropped display dimensions', () => {
  assert.equal(sharpestArtwork([
    { url: 'landscape', width: 1920, height: 1080 },
    { url: 'poster', width: 600, height: 900 },
  ], 'contain'), 'landscape');
});
test('ties preserve preference and failed images never win', () => {
  assert.equal(sharpestArtwork([{ url: 'saved', width: 600, height: 900 }, { url: 'api', width: 600, height: 900 }]), 'saved');
  assert.equal(sharpestArtwork([{ url: 'broken', width: 0, height: 0 }]), undefined);
  assert.equal(sharpestArtwork([]), undefined);
});
