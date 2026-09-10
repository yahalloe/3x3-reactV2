import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boardPositions, collectionPositions, firstFreePosition, passwordValidation, positionIsAvailable } from '../src/lib/adminModel.ts';

test('collection board excludes homepage and maps the first shelf to top left', () => {
  const stored = ['favorites', 'romcom', 'drama', 'music'].map((slug, sortOrder) => ({id:slug,slug,sortOrder}));
  const shelves = collectionPositions(stored);
  assert.deepEqual(shelves.map(({slug,sortOrder}) => [slug,sortOrder]), [['romcom',0],['drama',1],['music',2]]);
  assert.equal(positionIsAvailable(shelves, 0, 'romcom'), true);
  assert.equal(positionIsAvailable(shelves, 1, 'romcom'), false);
  assert.equal(firstFreePosition(shelves), 3);
  assert.equal(stored[1].sortOrder, 1);
});

test('occupied positions are blocked but an anime can retain its own position', () => {
  const items = [{ id: 'a', sortOrder: 0 }, { id: 'b', sortOrder: 4 }];
  assert.equal(positionIsAvailable(items, 0, 'new'), false);
  assert.equal(positionIsAvailable(items, 0, 'a'), true);
  assert.equal(positionIsAvailable(items, 4, 'a'), false);
  assert.equal(firstFreePosition(items), 1);
  assert.equal(positionIsAvailable(items, -1), false);
  assert.equal(positionIsAvailable(items, 9), false);
  assert.equal(positionIsAvailable(items, 1.5), false);
});

test('a full grid cannot assign another anime', () => {
  const full = Array.from({ length: 9 }, (_, sortOrder) => ({ id: String(sortOrder), sortOrder }));
  assert.equal(firstFreePosition(full), -1);
  assert.equal(firstFreePosition(full, '4'), 4);
  assert.equal(positionIsAvailable(full, 4, 'new'), false);
});

test('the public board fills free cells with legacy duplicate and out-of-range positions', () => {
  const a = { id: 'a', sortOrder: 0 };
  const b = { id: 'b', sortOrder: 8 };
  const duplicate = { id: 'duplicate', sortOrder: 0 };
  const legacy = { id: 'legacy', sortOrder: 12 };
  const { slots, overflow } = boardPositions([a, b, duplicate, legacy]);
  assert.equal(slots.length, 9);
  assert.equal(slots[0], a);
  assert.equal(slots[1], duplicate);
  assert.equal(slots[2], legacy);
  assert.equal(slots[3], undefined);
  assert.equal(slots[8], b);
  assert.deepEqual(overflow, []);
});

test('Drama puts all seven titles inside the board despite three sharing position zero', () => {
  const entries = [0, 0, 0, 1, 2, 3, 4].map((sortOrder, index) => ({ id: String(index), sortOrder }));
  const { slots, overflow } = boardPositions(entries);
  assert.equal(slots.filter(Boolean).length, 7);
  assert.deepEqual(overflow, []);
  assert.equal(slots[1], entries[3]);
  assert.equal(slots[4], entries[6]);
  assert.equal(slots[5], entries[1]);
  assert.equal(slots[6], entries[2]);
  assert.deepEqual(boardPositions([...entries].reverse()), { slots, overflow });
  assert.deepEqual(entries.map((entry) => entry.sortOrder), [0, 0, 0, 1, 2, 3, 4]);
});

test('Romcom preserves an actual missing third entry without replacing editorial content', () => {
  const entries = [0, 1, 3, 4, 5, 6, 7, 8].map((sortOrder) => ({ id: String(sortOrder), sortOrder }));
  const { slots, overflow } = boardPositions(entries);
  assert.equal(slots[2], undefined);
  assert.equal(slots[3], entries[2]);
  assert.deepEqual(overflow, []);
});

test('only titles beyond nine overflow, with no titles lost', () => {
  const entries = Array.from({ length: 11 }, (_, index) => ({ id: String(index), sortOrder: 0 }));
  const { slots, overflow } = boardPositions(entries);
  assert.equal(slots.filter(Boolean).length, 9);
  assert.equal(overflow.length, 2);
  assert.equal(new Set([...slots, ...overflow].map((entry) => entry.id)).size, 11);
  assert.deepEqual(boardPositions([]), { slots: Array(9).fill(undefined), overflow: [] });
});

test('password validation rejects missing, weak, mismatched and unchanged values', () => {
  assert.match(passwordValidation('', 'long-enough', 'long-enough'), /current/);
  assert.match(passwordValidation('old-password', 'short', 'short'), /8/);
  assert.match(passwordValidation('old-password', 'new-password', 'different'), /match/);
  assert.match(passwordValidation('old-password', 'old-password', 'old-password'), /different/);
  assert.equal(passwordValidation('old-password', 'new-password', 'new-password'), null);
});
