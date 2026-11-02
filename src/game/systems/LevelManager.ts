
import { LEVELS } from "../data/levels";
import type { LevelData } from "../data/levels";
export class LevelManager {
  private currentLevelId: number;

  constructor(levelId = 1) {
    this.currentLevelId = levelId;
  }

  get currentLevel(): LevelData {
    const level = LEVELS.find(
      item => item.id === this.currentLevelId
    );

    if (!level) {
      throw new Error(
        `Level ${this.currentLevelId} does not exist.`
      );
    }

    return level;
  }

  get currentLevelNumber(): number {
    return this.currentLevelId;
  }

  get totalLevels(): number {
    return LEVELS.length;
  }

  get hasNextLevel(): boolean {
    return this.currentLevelId < LEVELS.length;
  }

  getLevel(id: number): LevelData | undefined {
    return LEVELS.find(level => level.id === id);
  }

  nextLevel(): LevelData | null {
    if (!this.hasNextLevel) return null;

    this.currentLevelId += 1;

    return this.currentLevel;
  }

  loadLevel(id: number): LevelData {
    const level = this.getLevel(id);

    if (!level) {
      throw new Error(`Level ${id} does not exist.`);
    }

    this.currentLevelId = id;

    return level;
  }
}
