import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";
import { DungeonScene } from "../scenes/DungeonScene";

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 800,
  height: 600,

  parent: "dungeon-game",

  backgroundColor: "#101820",

  pixelArt: true,
  roundPixels: true,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [
    BootScene,
    DungeonScene,
  ],
};