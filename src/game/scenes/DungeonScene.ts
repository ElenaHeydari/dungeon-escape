import Phaser from "phaser";
import {
  LEVEL_01_MAP,
  TILE_SIZE,
  TileType,
} from "../maps/level01";

export class DungeonScene extends Phaser.Scene {
  constructor() {
    super("DungeonScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#101820");

    this.drawMap();
  }

  private drawMap(): void {
    const mapWidth = LEVEL_01_MAP[0].length * TILE_SIZE;
    const mapHeight = LEVEL_01_MAP.length * TILE_SIZE;

    const offsetX = (800 - mapWidth) / 2;
    const offsetY = (600 - mapHeight) / 2;

    LEVEL_01_MAP.forEach((row, y) => {
      row.forEach((tile, x) => {
        const posX = offsetX + x * TILE_SIZE;
        const posY = offsetY + y * TILE_SIZE;

        let color = 0x17232d;

        if (tile === TileType.WALL) {
          color = 0x263746;
        }

        if (tile === TileType.EXIT) {
          color = 0x45d6c5;
        }

        this.add.rectangle(
          posX + TILE_SIZE / 2,
          posY + TILE_SIZE / 2,
          TILE_SIZE - 2,
          TILE_SIZE - 2,
          color
        );
      });
    });
  }
}