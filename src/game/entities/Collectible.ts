
import Phaser from "phaser";
import {
  tileToWorld,
  getIsometricDepth,
} from "../maps/isometric";

export type CollectibleType = "key" | "treasure" | "potion";

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
    const colors: Record<CollectibleType, number> = {
        key: 0xf2b84b,
        treasure: 0xe6a84a,
        potion: 0xe65b65
    };

    const color = colors[type];

    const position = tileToWorld(
      tileX,
      tileY,
      offsetX,
      offsetY
    );

    this.sprite = scene.add.circle(
      position.x,
      position.y,
      7,
      color
    );

    this.sprite.setDepth(
      getIsometricDepth(tileX, tileY, 4)
    );
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
