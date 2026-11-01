
import { openDB } from "idb";

export interface GameSave {
  bestScore: number;
  unlockedLevel: number;
  completedLevels: number[];
}

const DATABASE_NAME = "dungeon-escape-db";
const STORE_NAME = "game-save";
const SAVE_KEY = "main";

const databasePromise = openDB(DATABASE_NAME, 1, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME);
    }
  }
});

const DEFAULT_SAVE: GameSave = {
  bestScore: 0,
  unlockedLevel: 1,
  completedLevels: []
};

export class SaveManager {
  static async load(): Promise<GameSave> {
    const database = await databasePromise;

    const save = await database.get(STORE_NAME, SAVE_KEY);

    return save ?? { ...DEFAULT_SAVE };
  }

  static async save(data: GameSave): Promise<void> {
    const database = await databasePromise;

    await database.put(STORE_NAME, data, SAVE_KEY);
  }

  static async reset(): Promise<void> {
    const database = await databasePromise;

    await database.delete(STORE_NAME, SAVE_KEY);
  }
}
