
import Phaser from "phaser";
import { GameEntity } from "../GameEntity";

export type EnemyConfig = {
  x: number;
  y: number;
  color: number;
  damage: number;
  moveInterval: number;
  axis: "horizontal" | "vertical";
};

export abstract class Enemy extends GameEntity {
  private direction = 1;
  private elapsed = 0;

  readonly damage: number;
  private readonly moveInterval: number;
  private readonly axis: "horizontal" | "vertical";

  constructor(
    scene: Phaser.Scene,
    config: EnemyConfig,
    offsetX: number,
    offsetY: number
  ) {
    super(
      scene,
      config.x,
      config.y,
      offsetX,
      offsetY,
      config.color
    );

    this.damage = config.damage;
    this.moveInterval = config.moveInterval;
    this.axis = config.axis;
  }

  update(
    delta: number,
    canMoveTo: (x: number, y: number) => boolean,
    offsetX: number,
    offsetY: number
  ): void {
    if (this.moving) return;

    this.elapsed += delta;

    if (this.elapsed < this.moveInterval) return;

    this.elapsed = 0;

    const dx = this.axis === "horizontal" ? this.direction : 0;
    const dy = this.axis === "vertical" ? this.direction : 0;

    let nextX = this.x + dx;
    let nextY = this.y + dy;

    if (!canMoveTo(nextX, nextY)) {
      this.direction *= -1;

      nextX = this.x + (this.axis === "horizontal" ? this.direction : 0);
      nextY = this.y + (this.axis === "vertical" ? this.direction : 0);
    }

    if (canMoveTo(nextX, nextY)) {
      this.moveTo(nextX, nextY, offsetX, offsetY, 180);
    }
  }
}
