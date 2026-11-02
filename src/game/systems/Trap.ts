
import Phaser from "phaser";
import {
  tileToWorld,
  getIsometricDepth,
} from "../maps/isometric";

export class Trap {
  private sprite: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    public readonly x: number,
    public readonly y: number,
    offsetX: number,
    offsetY: number
  ) {
    const position = tileToWorld(
      x,
      y,
      offsetX,
      offsetY
    );

    this.sprite = scene.add.rectangle(
      position.x,
      position.y,
      24,
      14,
      0xe65b65
    );

    this.sprite.setAlpha(0.7);
    this.sprite.setDepth(
      getIsometricDepth(x, y, 3)
    );

    this.sprite.setAlpha(0.7);
    this.sprite.setDepth(4);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
