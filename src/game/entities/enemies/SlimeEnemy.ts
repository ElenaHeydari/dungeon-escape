
import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class SlimeEnemy extends Enemy {
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
        color: 0x65c466,
        damage: 1,
        moveInterval: 900,
        axis: "horizontal"
      },
      offsetX,
      offsetY
    );
  }
}
