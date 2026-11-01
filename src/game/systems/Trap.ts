
import Phaser from "phaser";
import { TILE_SIZE } from "../maps/level01";

export class Trap {
  private sprite: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    public readonly x: number,
    public readonly y: number,
    offsetX: number,
    offsetY: number
  ) {
    this.sprite = scene.add.rectangle(
      offsetX + x * TILE_SIZE + TILE_SIZE / 2,
      offsetY + y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * 0.7,
      TILE_SIZE * 0.7,
      0xe65b65
    );

    this.sprite.setAlpha(0.7);
    this.sprite.setDepth(4);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
