
import Phaser from "phaser";
import {
  tileToWorld,
  getEntityDepth,
} from "../maps/isometric";

export class Trap {
  private sprite: Phaser.GameObjects.Container;

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

    const glow = scene.add.ellipse(
      0, 0, 30, 19, 0xe65b65, 0.16
    );

    const plate = scene.add.ellipse(
      0, 2, 27, 15, 0x3b3039
    ).setStrokeStyle(1, 0xe65b65, 0.9);

    const spike1 = scene.add.triangle(
      -8, -2,
      0, -7,
      -5, 4,
      5, 4,
      0xe65b65
    );

    const spike2 = scene.add.triangle(
      0, -2,
      0, -7,
      -5, 4,
      5, 4,
      0xff8990
    );

    const spike3 = scene.add.triangle(
      8, -2,
      0, -7,
      -5, 4,
      5, 4,
      0xe65b65
    );

    this.sprite = scene.add.container(
      position.x,
      position.y,
      [glow, plate, spike1, spike2, spike3]
    );

    
    scene.tweens.add({
      targets: glow,
      alpha: 0.3,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });


    this.sprite.setDepth(
      getEntityDepth(x, y, 3)
    );
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

