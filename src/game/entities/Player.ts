
import Phaser from "phaser";
import {
  tileToWorld,
  getIsometricDepth,
} from "../maps/isometric";

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

    const position = tileToWorld(
      tileX,
      tileY,
      offsetX,
      offsetY
    );

    this.sprite = scene.add.rectangle(
      position.x,
      position.y,
      22,
      22,
      0x45d6c5
    );

    this.sprite.setDepth(
      getIsometricDepth(tileX, tileY, 5)
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
    const target = tileToWorld(
      targetX,
      targetY,
      this.offsetX,
      this.offsetY
    );

    this.scene.tweens.add({
      targets: this.sprite,
      x: target.x,
      y: target.y,
      duration: 120,
      ease: "Linear",
      onComplete: () => {
        this.tileX = targetX;
        this.tileY = targetY;
        this.moving = false;
        onComplete?.();
      }
    });

    this.sprite.setDepth(
      getIsometricDepth(targetX, targetY, 5)
    );
  }


  destroy(): void {
    this.sprite.destroy();
  }


}
