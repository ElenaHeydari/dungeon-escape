
import {
  LEVEL_01_MAP,
  TileType
} from "../maps/level01";

import { LEVEL_02_MAP } from "../maps/level02";

export interface LevelItem {
  type: "key" | "treasure" | "potion";
  x: number;
  y: number;
}

export interface LevelEnemy {
  type: "slime" | "skeleton";
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  name: string;
  description: string;

  map: TileType[][];

  playerSpawn: {
    x: number;
    y: number;
  };

  items: LevelItem[];
  enemies: LevelEnemy[];

  traps: {
    x: number;
    y: number;
  }[];
}

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "The Beginning",
    description: "Escape from the forgotten dungeon.",

    map: LEVEL_01_MAP,

    playerSpawn: { x: 1, y: 1 },

    items: [
      { type: "key", x: 4, y: 3 },
      { type: "treasure", x: 10, y: 5 },
      { type: "potion", x: 2, y: 5 }
    ],

    enemies: [
      { type: "slime", x: 8, y: 3 },
      { type: "skeleton", x: 8, y: 7 }
    ],

    traps: [
      { x: 6, y: 5 },
      { x: 2, y: 7 }
    ]
  },

  {
    id: 2,
    name: "The Dark Maze",
    description: "A deeper and more dangerous dungeon.",

    map: LEVEL_02_MAP,

    playerSpawn: { x: 1, y: 1 },

    items: [
      { type: "key", x: 3, y: 3 },
      { type: "treasure", x: 12, y: 7 },
      { type: "potion", x: 2, y: 5 }
    ],

    enemies: [
      { type: "slime", x: 6, y: 3 },
      { type: "skeleton", x: 10, y: 7 }
    ],

    traps: [
      { x: 5, y: 5 },
      { x: 9, y: 3 }
    ]
  }
];
