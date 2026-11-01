
import Phaser from "phaser";
import { TILE_SIZE } from "../maps/level01";

export type CollectibleType = "key" | "treasure";

export class Collectible {
  private sprite: Phaser.GameObjects.Arc;
  private collected = false;

  constructor(
    scene: Phaser.Scene,
    public readonly type: CollectibleType,
    public readonly tileX: number,
    public readonly tileY: number,
    offsetX: number,
    offsetY: number
  ) {
    const color = type === "key" ? 0xf2b84b : 0xe6a84a;

    this.sprite = scene.add.circle(
      offsetX + tileX * TILE_SIZE + TILE_SIZE / 2,
      offsetY + tileY * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * 0.25,
      color
    );

    this.sprite.setDepth(5);
  }

  collect(): boolean {
    if (this.collected) return false;

    this.collected = true;
    this.sprite.destroy();

    return true;
  }

  get isCollected(): boolean {
    return this.collected;
  }

  
  destroy(): void {
    this.sprite.destroy();
  }

}
