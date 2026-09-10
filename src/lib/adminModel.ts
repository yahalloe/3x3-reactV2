export interface PositionedItem {
  id: string;
  sortOrder: number;
}

// Stored collection order reserves zero for the homepage; shelf boards start at zero.
export function collectionPositions<T extends PositionedItem & { slug: string }>(items: T[]): T[] {
  return items.filter((item) => item.slug !== "favorites").map((item) => ({ ...item, sortOrder: item.sortOrder - 1 }));
}

export function boardPositions<T extends PositionedItem>(items: T[]) {
  const slots = Array.from({ length: 9 }, (_, index) => items.find((item) => item.sortOrder === index));
  // Keep legacy duplicate/out-of-range positions visible until an editor moves them.
  const overflow = items.filter((item) => !slots.includes(item));
  return { slots, overflow };
}

export function firstFreePosition(items: PositionedItem[], currentId?: string): number {
  const occupied = new Set(items.filter((item) => item.id !== currentId).map((item) => item.sortOrder));
  return Array.from({ length: 9 }, (_, index) => index).find((index) => !occupied.has(index)) ?? -1;
}

export function positionIsAvailable(items: PositionedItem[], position: number, currentId?: string): boolean {
  return Number.isInteger(position) && position >= 0 && position < 9 &&
    !items.some((item) => item.id !== currentId && item.sortOrder === position);
}

export function passwordValidation(current: string, next: string, confirmation: string): string | null {
  if (!current) return "Enter your current password.";
  if (next.length < 8) return "Use at least 8 characters for your new password.";
  if (next !== confirmation) return "The new passwords do not match.";
  if (current === next) return "Choose a different password from your current one.";
  return null;
}
