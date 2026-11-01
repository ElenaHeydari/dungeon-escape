
export type InventoryItemType = "key" | "potion" | "treasure";

export class Inventory {
  private items: Map<InventoryItemType, number> = new Map();

  add(item: InventoryItemType, amount = 1): void {
    const current = this.getCount(item);
    this.items.set(item, current + amount);
  }

  remove(item: InventoryItemType, amount = 1): boolean {
    const current = this.getCount(item);

    if (current < amount) return false;

    const remaining = current - amount;

    if (remaining === 0) {
      this.items.delete(item);
    } else {
      this.items.set(item, remaining);
    }

    return true;
  }

  getCount(item: InventoryItemType): number {
    return this.items.get(item) ?? 0;
  }

  has(item: InventoryItemType): boolean {
    return this.getCount(item) > 0;
  }

  clear(): void {
    this.items.clear();
  }

  getAll(): Record<InventoryItemType, number> {
    return {
      key: this.getCount("key"),
      potion: this.getCount("potion"),
      treasure: this.getCount("treasure")
    };
  }
}
