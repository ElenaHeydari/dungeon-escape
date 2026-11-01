
import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class SkeletonEnemy extends Enemy {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    offsetX: number,
    offsetY: number
  ) {
    super(
      scene,
      {
        x,
        y,
        color: 0xe8eef2,
        damage: 1,
        moveInterval: 650,
        axis: "vertical"
      },
      offsetX,
      offsetY
    );
  }
}
