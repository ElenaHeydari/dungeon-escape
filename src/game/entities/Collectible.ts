
import Phaser from "phaser";
import {
  tileToWorld,
  getEntityDepth,
} from "../maps/isometric";

export type CollectibleType = "key" | "treasure" | "potion";

export class Collectible {
  private sprite: Phaser.GameObjects.Container;
  private collected = false;

  constructor(
    scene: Phaser.Scene,
    public readonly type: CollectibleType,
    public readonly tileX: number,
    public readonly tileY: number,
    offsetX: number,
    offsetY: number
  ) {
    const position = tileToWorld(
      tileX,
      tileY,
      offsetX,
      offsetY
    );

    const shadow = scene.add.ellipse(
      0, 9, 22, 8, 0x000000, 0.4
    );

    const glowColor =
      type === "key" || type === "treasure"
        ? 0xf2b84b
        : 0x45d6c5;

    const glow = scene.add.circle(
      0, 0, 17, glowColor, 0.18
    );

    const parts: Phaser.GameObjects.GameObject[] = [
      shadow,
      glow
    ];

    if (type === "key") {
      const ring = scene.add.circle(
        -5, -3, 5, 0xf2b84b
      );

      const hole = scene.add.circle(
        -5, -3, 2.3, 0x17232d
      );

      const shaft = scene.add.rectangle(
        3, -3, 13, 3, 0xf2b84b
      );

      const tooth1 = scene.add.rectangle(
        7, 0, 3, 5, 0xf2b84b
      );

      const tooth2 = scene.add.rectangle(
        2, 0, 3, 4, 0xf2b84b
      );

      parts.push(ring, hole, shaft, tooth1, tooth2);
    }

    if (type === "treasure") {
      const chest = scene.add.rectangle(
        0, 1, 19, 13, 0xb87932
      ).setStrokeStyle(1, 0xffd477);

      const lid = scene.add.rectangle(
        0, -6, 20, 5, 0xf2b84b
      );

      const lock = scene.add.rectangle(
        0, 1, 4, 6, 0xffe3a0
      );

      parts.push(chest, lid, lock);
    }

    if (type === "potion") {
      const neck = scene.add.rectangle(
        0, -9, 7, 5, 0x45d6c5
      );

      const cork = scene.add.rectangle(
        0, -13, 8, 3, 0xf2b84b
      );

      const bottle = scene.add.ellipse(
        0, 0, 13, 17, 0x45d6c5
      ).setStrokeStyle(1, 0xb7fff3);

      const liquid = scene.add.rectangle(
        0, 4, 9, 5, 0x168e83
      );

      parts.push(bottle, liquid, neck, cork);
    }

    this.sprite = scene.add.container(
      position.x,
      position.y,
      parts
    );

    this.sprite.setDepth(
      getEntityDepth(tileX, tileY, 6)
    );

    scene.tweens.add({
      targets: this.sprite,
      y: position.y - 3,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
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

