

import Phaser from "phaser";

import {
  TILE_SIZE,
  TileType
} from "../maps/level01";

import { LevelManager } from "../systems/LevelManager";
import type { LevelData } from "../data/levels";
import { Player } from "../entities/Player";
import { Collectible } from "../entities/Collectible";
import { Enemy } from "../entities/enemies/Enemy";
import { SlimeEnemy } from "../entities/enemies/SlimeEnemy";
import { SkeletonEnemy } from "../entities/enemies/SkeletonEnemy";
import { Inventory } from "../systems/Inventory";
import { SaveManager } from "../systems/SaveManager";

import { HealthSystem } from "../systems/HealthSystem";
import { Trap } from "../systems/Trap";

export class DungeonScene extends Phaser.Scene {

  private levelManager!: LevelManager;
  private currentLevel!: LevelData;
  private nextLevelKey!: Phaser.Input.Keyboard.Key;
  private levelWon = false;
  private player!: Player;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private interactKey!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;

  private collectibles: Collectible[] = [];
  private enemies: Enemy[] = [];
  private traps: Trap[] = [];

  private health!: HealthSystem;

  private offsetX = 0;
  private offsetY = 0;

  private hasKey = false;
  private score = 0;
  private completed = false;

  private hudText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private gameOverText?: Phaser.GameObjects.Text;

  private inventory!: Inventory;
  private potionKey!: Phaser.Input.Keyboard.Key;
  private pauseKey!: Phaser.Input.Keyboard.Key;

  private isPaused = false;
  private pauseOverlay?: Phaser.GameObjects.Container;
  

  constructor() {
    super("DungeonScene");
  }


  create(data?: { levelId?: number }): void {
    const levelId = data?.levelId ?? 1;
    this.levelWon = false;
    this.levelManager = new LevelManager(levelId);
    this.currentLevel = this.levelManager.currentLevel;

    this.completed = false;
    this.isPaused = false;
    this.hasKey = false;
    this.score = 0;

    this.collectibles = [];
    this.enemies = [];
    this.traps = [];

    this.inventory = new Inventory();
    this.health = new HealthSystem(3, 1000);

    this.cameras.main.setBackgroundColor("#101820");

    this.drawMap();
    this.createPlayer();
    this.createCollectibles();
    this.createEnemies();
    this.createTraps();
    this.createHUD();
    this.setupControls();

    void this.loadSavedProgress();

    this.events.once("shutdown", () => {
      this.health.destroy();
      this.player.destroy();

      this.collectibles.forEach(item => item.destroy());
      this.enemies.forEach(enemy => enemy.destroy());
      this.traps.forEach(trap => trap.destroy());

      this.pauseOverlay?.destroy();

      this.input.keyboard?.off(
        "keydown-H",
      );
    });
  }


  
  update(_time: number, delta: number): void {
    if (this.completed) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart({
          levelId: this.currentLevel.id
        });
      }

      if (
        this.levelWon &&
        Phaser.Input.Keyboard.JustDown(this.nextLevelKey) &&
        this.levelManager.hasNextLevel
      ) {
        const nextLevelId = this.currentLevel.id + 1;

        this.scene.restart({
          levelId: nextLevelId
        });

        return;
      
        }
      }
    
    


    if (this.isPaused) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
        this.resumeGame();
      }

      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.pauseGame();
      return;
    }

    this.updateEnemies(delta);
    this.checkEnemyCollisions();
    this.checkTrapCollisions();

    if (this.health.isDead) {
      this.handleGameOver();
      return;
    }

    if (this.player.isMoving) return;

    this.handleMovement();

    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.attack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
    }

    if (Phaser.Input.Keyboard.JustDown(this.potionKey)) {
      this.usePotion();
    }


  }


  // ---------------- MAP ----------------


  private drawMap(): void {
    
    const map = this.currentLevel.map;

    const mapWidth = map[0].length * TILE_SIZE;
    const mapHeight = map.length * TILE_SIZE;

    this.offsetX = (800 - mapWidth) / 2;
    this.offsetY = (600 - mapHeight) / 2;

    map.forEach((row, y) => {
      row.forEach((tile, x) => {
        let color = 0x17232d;

        if (tile === TileType.WALL) color = 0x263746;
        if (tile === TileType.EXIT) color = 0x45d6c5;

        this.add.rectangle(
          this.offsetX + x * TILE_SIZE + TILE_SIZE / 2,
          this.offsetY + y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE - 2,
          TILE_SIZE - 2,
          color
        );
      });
    });
  }


  private isWalkable(x: number, y: number): boolean {
    const map = this.currentLevel.map;

    if (
      y < 0 ||
      y >= map.length ||
      x < 0 ||
      x >= map[y].length
    ) {
      return false;
    }

    return map[y][x] !== TileType.WALL;
  }

  // ---------------- PLAYER ----------------

  private createPlayer(): void {
    const spawn = this.currentLevel.playerSpawn;

    this.player = new Player(
      this,
      spawn.x,
      spawn.y,
      this.offsetX,
      this.offsetY
    );
  }

  private handleMovement(): void {
    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.left)
    ) {
      this.tryMove(-1, 0);
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.right)
    ) {
      this.tryMove(1, 0);
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up)
    ) {
      this.tryMove(0, -1);
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.down)
    ) {
      this.tryMove(0, 1);
    }
  }

  private tryMove(dx: number, dy: number): void {
    const nextX = this.player.x + dx;
    const nextY = this.player.y + dy;

    if (!this.isWalkable(nextX, nextY)) return;

    this.player.moveTo(nextX, nextY, () => {
      this.checkCollectibles();
      this.checkEnemyCollisions();
      this.checkTrapCollisions();
    });
  }

  // ---------------- COLLECTIBLES ----------------

  private createCollectibles(): void {
    this.collectibles = this.currentLevel.items.map(item => {
      return new Collectible(
        this,
        item.type,
        item.x,
        item.y,
        this.offsetX,
        this.offsetY
      );
    });
  }


  private checkCollectibles(): void {
    for (const item of this.collectibles) {
      if (item.isCollected) continue;

      if (
        item.tileX !== this.player.x ||
        item.tileY !== this.player.y
      ) {
        continue;
      }

      if (!item.collect()) continue;

      switch (item.type) {
        case "key":
          this.hasKey = true;
          this.inventory.add("key");
          this.score += 100;
          this.showMessage("Key collected! +100");
          break;

        case "treasure":
          this.inventory.add("treasure");
          this.score += 150;
          this.showMessage("Treasure collected! +150");
          break;

        case "potion":
          this.inventory.add("potion");
          this.showMessage("Potion collected! Press H to use.");
          break;
      }

      this.updateHUD();
    }
  }


  // ---------------- ENEMIES ----------------

  private createEnemies(): void {
    this.enemies = this.currentLevel.enemies.map(enemy => {
      if (enemy.type === "slime") {
        return new SlimeEnemy(
          this,
          enemy.x,
          enemy.y,
          this.offsetX,
          this.offsetY
        );
      }

      return new SkeletonEnemy(
        this,
        enemy.x,
        enemy.y,
        this.offsetX,
        this.offsetY
      );
    });
  }

  private updateEnemies(delta: number): void {
    for (const enemy of this.enemies) {
      enemy.update(
        delta,
        (x, y) => this.isWalkable(x, y),
        this.offsetX,
        this.offsetY
      );
    }
  }

  private attack(): void {
    const targetIndex = this.enemies.findIndex(enemy => {
      const distance =
        Math.abs(enemy.x - this.player.x) +
        Math.abs(enemy.y - this.player.y);

      return distance === 1 && !enemy.isMoving;
    });

    if (targetIndex === -1) {
      this.showMessage("No enemy in attack range.");
      return;
    }

    const enemy = this.enemies[targetIndex];

    enemy.destroy();
    this.enemies.splice(targetIndex, 1);

    this.score += 50;

    this.showMessage("Enemy defeated! +50");
    this.updateHUD();
  }

  private checkEnemyCollisions(): void {
    for (const enemy of this.enemies) {
      if (enemy.x !== this.player.x || enemy.y !== this.player.y) {
        continue;
      }

      if (this.health.takeDamage(enemy.damage)) {
        this.onPlayerDamaged();
      }
    }
  }

  // ---------------- TRAPS ----------------

  private createTraps(): void {
    this.traps = this.currentLevel.traps.map(trap => {
      return new Trap(
        this,
        trap.x,
        trap.y,
        this.offsetX,
        this.offsetY
      );
    });
  }

  private checkTrapCollisions(): void {
    for (const trap of this.traps) {
      if (
        trap.x === this.player.x &&
        trap.y === this.player.y
      ) {
        if (this.health.takeDamage(1)) {
          this.onPlayerDamaged();
        }
      }
    }
  }

  //----------------- Potion --------------------

  
  private usePotion(): void {
    if (!this.inventory.has("potion")) {
      this.showMessage("You don't have a potion!");
      return;
    }

    if (this.health.health >= this.health.max) {
      this.showMessage("Your health is already full!");
      return;
    }

    this.inventory.remove("potion");
    this.health.heal(1);

    this.showMessage("Health restored! +1");
    this.updateHUD();
  }


  // ---------------- HEALTH ----------------

  private onPlayerDamaged(): void {
    this.cameras.main.shake(120, 0.006);
    this.cameras.main.flash(100, 230, 91, 101);

    this.showMessage("You took damage!");
    this.updateHUD();
  }

  // ---------------- EXIT ----------------

  private findExit(): { x: number; y: number } | null {
    const map = this.currentLevel.map;

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === TileType.EXIT) {
          return { x, y };
        }
      }
    }

    return null;
  }

  private tryInteract(): void {
    const exit = this.findExit();

    if (!exit) return;

    const distance =
      Math.abs(this.player.x - exit.x) +
      Math.abs(this.player.y - exit.y);

    if (distance > 1) {
      this.showMessage("Move closer to the exit.");
      return;
    }

    if (!this.hasKey) {
      this.showMessage("The exit is locked. Find the key!");
      return;
    }

    this.completeLevel();
  }

  

  private completeLevel(): void {
    this.levelWon = true;
    this.completed = true;
    this.score += 500;

    this.updateHUD();

    const hasNext = this.levelManager.hasNextLevel;

    const message = hasNext
      ? `LEVEL ${this.currentLevel.id} COMPLETE!\nScore: ${this.score}\nPress N for Next Level | R to Replay`
      : `ALL LEVELS COMPLETE!\nFinal Score: ${this.score}\nPress R to Replay`;

    this.messageText.setColor("#45d6c5");
    this.messageText.setText(message);

    void this.saveProgress();
  }



  private async saveProgress(): Promise<void> {
    try {
      const previousSave = await SaveManager.load();

      const nextLevel = this.currentLevel.id + 1;

      const save = {
        bestScore: Math.max(previousSave.bestScore, this.score),

        unlockedLevel: Math.max(
          previousSave.unlockedLevel,
          Math.min(nextLevel, this.levelManager.totalLevels)
        ),

        completedLevels: Array.from(
          new Set([
            ...previousSave.completedLevels,
            this.currentLevel.id
          ])
        )
      };

      await SaveManager.save(save);

      console.info("Progress saved:", save);
    } catch (error) {
      console.error("Could not save progress:", error);
      this.showMessage("Warning: Progress could not be saved.");
    }
  }


  
  private async loadSavedProgress(): Promise<void> {
    try {
      const save = await SaveManager.load();

      console.info("Saved game progress:", save);

      this.showMessage(
        `Best Score: ${save.bestScore} | Unlocked Level: ${save.unlockedLevel}`
      );
    } catch (error) {
      console.error("Could not load saved progress:", error);
    }
  }



  // ---------------- HUD ----------------

  private createHUD(): void {
    this.hudText = this.add.text(
      20,
      15,
      "",
      {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#e8eef2",
        lineSpacing: 5
      }
    );

    this.hudText.setScrollFactor(0);

    this.messageText = this.add.text(
      400,
      565,
      "",
      {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#f2b84b",
        align: "center"
      }
    );

    this.messageText.setOrigin(0.5);
    this.messageText.setScrollFactor(0);

    this.updateHUD();
  }

  
  private updateHUD(): void {
    const hearts =
      "♥".repeat(this.health.health) +
      "♡".repeat(this.health.max - this.health.health);

    this.hudText.setText(
      `Level: ${this.currentLevel.id} - ${this.currentLevel.name}\n` +
      `Health: ${hearts}     Score: ${this.score}     ` +
      `Key: ${this.hasKey ? "YES" : "NO"}     ` +
      `Potions: ${this.inventory.getCount("potion")}`
    );
  }


  private showMessage(message: string): void {
    this.messageText.setText(message);
    this.messageText.setColor("#f2b84b");
  }

  // ---------------- Pause ---------------------

  private pauseGame(): void {
    this.isPaused = true;

    this.tweens.pauseAll();

    const background = this.add.rectangle(
      400, 300, 800, 600, 0x000000, 0.75
    );

    const title = this.add.text(
      400, 220, "PAUSED",
      {
        fontFamily: "Arial",
        fontSize: "42px",
        color: "#45d6c5"
      }
    ).setOrigin(0.5);

    const instructions = this.add.text(
      400, 310,
      "Press ESC to Resume\nPress R to Restart",
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#e8eef2",
        align: "center",
        lineSpacing: 12
      }
    ).setOrigin(0.5);

    this.pauseOverlay = this.add.container(
      0, 0, [background, title, instructions]
    );

    this.pauseOverlay.setDepth(200);
  }

  private resumeGame(): void {
    this.isPaused = false;

    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;

    this.tweens.resumeAll();
  }


  // ---------------- GAME OVER ----------------

  private handleGameOver(): void {
    if (this.completed) return;

    this.completed = true;

    this.gameOverText = this.add.text(
      400,
      300,
      `GAME OVER\nFinal score: ${this.score}\nPress R to restart`,
      {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#e65b65",
        align: "center",
        backgroundColor: "#101820",
        padding: { x: 20, y: 16 }
      }
    );

    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setScrollFactor(0);
    this.gameOverText.setDepth(100);
  }

  // ---------------- INPUT ----------------

  private setupControls(): void {
    if (!this.input.keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.cursors = this.input.keyboard.createCursorKeys();

    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }) as typeof this.wasd;

    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    this.attackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.restartKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );

    this.potionKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.H
    );

    this.pauseKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.nextLevelKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.N
    );
  }
}

