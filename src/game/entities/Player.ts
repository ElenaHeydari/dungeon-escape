
import Phaser from "phaser";
import {
  tileToWorld,
  getEntityDepth,
} from "../maps/isometric";

export class Player {
  private sprite: Phaser.GameObjects.Container;
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

    const outerGlow = scene.add.circle(
      0, 0, 27, 0x45d6c5, 0.055
    );

    const innerGlow = scene.add.circle(
      0, 0, 16, 0x45d6c5, 0.14
    );

    const shadow = scene.add.ellipse(
      0, 7, 23, 10, 0x000000, 0.4
    );

    const cape = scene.add.triangle(
      0, 1,
      0, -11,
      -10, 9,
      10, 9,
      0x176d70
    );

    const body = scene.add.ellipse(
      0, 1, 13, 18, 0x45d6c5
    );

    const head = scene.add.circle(
      0, -8, 5.5, 0xe8eef2
    );

    const visor = scene.add.rectangle(
      0, -8, 8, 2, 0x17232d
    );

    this.sprite = scene.add.container(
      position.x,
      position.y,
      [shadow, outerGlow,innerGlow, cape, body, head, visor]
    );
    
    this.scene.tweens.add({
      targets: shadow,
      scaleX: 1.15,
      scaleY: 0.85,
      alpha: 0.25,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });


    this.sprite.setDepth(
    getEntityDepth(tileX, tileY, 10)
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

    this.sprite.setDepth(
      getEntityDepth(targetX, targetY, 10)
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
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

