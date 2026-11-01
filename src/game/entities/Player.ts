
import Phaser from "phaser";
import { TILE_SIZE } from "../maps/level01";

export class Player {
  private sprite: Phaser.GameObjects.Rectangle;
  private moving = false;

  private tileX: number;
  private tileY: number;
  private readonly offsetX: number;
  private readonly offsetY: number;

  constructor(
    private readonly scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    offsetX: number,
    offsetY: number
  ) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.sprite = scene.add.rectangle(
      this.getWorldX(tileX),
      this.getWorldY(tileY),
      TILE_SIZE * 0.58,
      TILE_SIZE * 0.58,
      0x45d6c5
    );

    this.sprite.setDepth(10);
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

  moveTo(
    targetX: number,
    targetY: number,
    onComplete?: () => void
  ): void {
    if (this.moving) return;

    this.moving = true;

    this.scene.tweens.add({
      targets: this.sprite,
      x: this.getWorldX(targetX),
      y: this.getWorldY(targetY),
      duration: 120,
      ease: "Linear",
      onComplete: () => {
        this.tileX = targetX;
        this.tileY = targetY;
        this.moving = false;
        onComplete?.();
      }
    });
  }

  destroy(): void {
    this.sprite.destroy();
  }

  private getWorldX(tileX: number): number {
    return this.offsetX + tileX * TILE_SIZE + TILE_SIZE / 2;
  }

  private getWorldY(tileY: number): number {
    return this.offsetY + tileY * TILE_SIZE + TILE_SIZE / 2;
  }
}
