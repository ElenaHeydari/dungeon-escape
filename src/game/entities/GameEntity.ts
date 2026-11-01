
import Phaser from "phaser";
import { TILE_SIZE } from "../maps/level01";

export abstract class GameEntity {
  protected sprite: Phaser.GameObjects.Rectangle;

  protected tileX: number;
  protected tileY: number;

  protected moving = false;

  constructor(
    protected readonly scene: Phaser.Scene,
    x: number,
    y: number,
    offsetX: number,
    offsetY: number,
    color: number,
    size = 0.65
  ) {
    this.tileX = x;
    this.tileY = y;

    this.sprite = scene.add.rectangle(
      offsetX + x * TILE_SIZE + TILE_SIZE / 2,
      offsetY + y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * size,
      TILE_SIZE * size,
      color
    );

    this.sprite.setDepth(8);
  }

  get x(): number {
    return this.tileX;
  }

  get y(): number {
    return this.tileY;
  }

  get isMoving(): boolean {
    return this.moving;
  }

  protected moveTo(
    x: number,
    y: number,
    offsetX: number,
    offsetY: number,
    duration: number
  ): void {
    if (this.moving) return;

    this.moving = true;

    this.scene.tweens.add({
      targets: this.sprite,
      x: offsetX + x * TILE_SIZE + TILE_SIZE / 2,
      y: offsetY + y * TILE_SIZE + TILE_SIZE / 2,
      duration,
      ease: "Linear",
      onComplete: () => {
        this.tileX = x;
        this.tileY = y;
        this.moving = false;
      }
    });
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.destroy();
  }
}
