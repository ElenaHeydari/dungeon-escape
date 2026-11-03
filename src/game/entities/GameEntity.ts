
import Phaser from "phaser";
import {
  tileToWorld,
  getEntityDepth,
} from "../maps/isometric";

export abstract class GameEntity {
  protected sprite: Phaser.GameObjects.Container;

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

    const shadow = scene.add.ellipse(
      0, 8, 25, 10, 0x000000, 0.4
    );

    const glow = scene.add.circle(
      0, 0, 15, color, 0.13
    );

    const body = scene.add.ellipse(
      0, 0, 23, 19, color
    );

    const highlight = scene.add.ellipse(
      -5, -5, 7, 4, 0xffffff, 0.35
    );

    const leftEye = scene.add.circle(
      -4, -1, 2.2, 0x101820
    );

    const rightEye = scene.add.circle(
      4, -1, 2.2, 0x101820
    );

    this.sprite = scene.add.container(
      position.x,
      position.y,
      [shadow, glow, body, highlight, leftEye, rightEye]
    );

    
    this.scene.tweens.add({
      targets: shadow,
      scaleX: 1.12,
      alpha: 0.28,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });


    this.sprite.setDepth(
      getEntityDepth(x, y, 8)
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
      getEntityDepth(x, y, 8)
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

