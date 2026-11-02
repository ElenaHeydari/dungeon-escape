
import Phaser from "phaser";
import {
  tileToWorld,
  getIsometricDepth,
} from "../maps/isometric";

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
  ) {
    this.tileX = x;
    this.tileY = y;

    const position = tileToWorld(
      x,
      y,
      offsetX,
      offsetY
    );

    this.sprite = scene.add.rectangle(
      position.x,
      position.y,
      22,
      22,
      color
    );

    this.sprite.setDepth(
      getIsometricDepth(x, y, 6)
    );
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

    const target = tileToWorld(
      x,
      y,
      offsetX,
      offsetY
    );

    this.sprite.setDepth(
      getIsometricDepth(x, y, 6)
    );

    this.scene.tweens.add({
      targets: this.sprite,
      x: target.x,
      y: target.y,
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
