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

test('the public board preserves gaps and never drops legacy duplicate positions', () => {
  const a = { id: 'a', sortOrder: 0 };
  const b = { id: 'b', sortOrder: 8 };
  const duplicate = { id: 'duplicate', sortOrder: 0 };
  const legacy = { id: 'legacy', sortOrder: 12 };
  const { slots, overflow } = boardPositions([a, b, duplicate, legacy]);
  assert.equal(slots.length, 9);
  assert.equal(slots[0], a);
  assert.equal(slots[1], undefined);
  assert.equal(slots[8], b);
  assert.deepEqual(overflow, [duplicate, legacy]);
});

test('password validation rejects missing, weak, mismatched and unchanged values', () => {
  assert.match(passwordValidation('', 'long-enough', 'long-enough'), /current/);
  assert.match(passwordValidation('old-password', 'short', 'short'), /8/);
  assert.match(passwordValidation('old-password', 'new-password', 'different'), /match/);
  assert.match(passwordValidation('old-password', 'old-password', 'old-password'), /different/);
  assert.equal(passwordValidation('old-password', 'new-password', 'new-password'), null);
});
