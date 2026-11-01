

import Phaser from "phaser";

import {
  LEVEL_01_MAP,
  TILE_SIZE,
  TileType
} from "../maps/level01";

import { Player } from "../entities/Player";
import { Collectible } from "../entities/Collectible";
import { Enemy } from "../entities/enemies/Enemy";
import { SlimeEnemy } from "../entities/enemies/SlimeEnemy";
import { SkeletonEnemy } from "../entities/enemies/SkeletonEnemy";

import { HealthSystem } from "../systems/HealthSystem";
import { Trap } from "../systems/Trap";

export class DungeonScene extends Phaser.Scene {
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

  constructor() {
    super("DungeonScene");
  }

  create(): void {
    this.completed = false;
    this.hasKey = false;
    this.score = 0;

    this.collectibles = [];
    this.enemies = [];
    this.traps = [];

    this.health = new HealthSystem(3, 1000);

    this.cameras.main.setBackgroundColor("#101820");

    this.drawMap();
    this.createPlayer();
    this.createCollectibles();
    this.createEnemies();
    this.createTraps();
    this.createHUD();
    this.setupControls();

    this.events.once("shutdown", () => {
      this.health.destroy();

      this.player.destroy();

      this.collectibles.forEach(item => item.destroy());
      this.enemies.forEach(enemy => enemy.destroy());
      this.traps.forEach(trap => trap.destroy());
    });
  }

  update(_time: number, delta: number): void {
    if (this.completed) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
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
  }

  // ---------------- MAP ----------------

  private drawMap(): void {
    const mapWidth = LEVEL_01_MAP[0].length * TILE_SIZE;
    const mapHeight = LEVEL_01_MAP.length * TILE_SIZE;

    this.offsetX = (800 - mapWidth) / 2;
    this.offsetY = (600 - mapHeight) / 2;

    LEVEL_01_MAP.forEach((row, y) => {
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
    if (
      y < 0 ||
      y >= LEVEL_01_MAP.length ||
      x < 0 ||
      x >= LEVEL_01_MAP[y].length
    ) {
      return false;
    }

    return LEVEL_01_MAP[y][x] !== TileType.WALL;
  }

  // ---------------- PLAYER ----------------

  private createPlayer(): void {
    this.player = new Player(
      this,
      1,
      1,
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
    this.collectibles = [
      new Collectible(
        this, "key", 4, 3, this.offsetX, this.offsetY
      ),
      new Collectible(
        this, "treasure", 10, 5, this.offsetX, this.offsetY
      )
    ];
  }

  private checkCollectibles(): void {
    for (const item of this.collectibles) {
      if (item.isCollected) continue;

      if (
        item.tileX === this.player.x &&
        item.tileY === this.player.y
      ) {
        if (!item.collect()) continue;

        if (item.type === "key") {
          this.hasKey = true;
          this.score += 100;
          this.showMessage("Key collected!");
        } else {
          this.score += 150;
          this.showMessage("Treasure collected!");
        }

        this.updateHUD();
      }
    }
  }

  // ---------------- ENEMIES ----------------

  private createEnemies(): void {
    this.enemies = [
      new SlimeEnemy(
        this, 8, 3, this.offsetX, this.offsetY
      ),
      new SkeletonEnemy(
        this, 8, 7, this.offsetX, this.offsetY
      )
    ];
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
    this.traps = [
      new Trap(this, 6, 5, this.offsetX, this.offsetY),
      new Trap(this, 2, 7, this.offsetX, this.offsetY)
    ];
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

  // ---------------- HEALTH ----------------

  private onPlayerDamaged(): void {
    this.cameras.main.shake(120, 0.006);
    this.cameras.main.flash(100, 230, 91, 101);

    this.showMessage("You took damage!");
    this.updateHUD();
  }

  // ---------------- EXIT ----------------

  private findExit(): { x: number; y: number } | null {
    for (let y = 0; y < LEVEL_01_MAP.length; y++) {
      for (let x = 0; x < LEVEL_01_MAP[y].length; x++) {
        if (LEVEL_01_MAP[y][x] === TileType.EXIT) {
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
    this.completed = true;
    this.score += 500;

    this.updateHUD();

    this.messageText.setColor("#45d6c5");
    this.messageText.setText(
      `LEVEL COMPLETE! Final score: ${this.score} | Press R to restart`
    );
  }

  // ---------------- HUD ----------------

  private createHUD(): void {
    this.hudText = this.add.text(
      20,
      18,
      "",
      {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#e8eef2"
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
      `Health: ${hearts}     Score: ${this.score}     Key: ${this.hasKey ? "YES" : "NO"}`
    );
  }

  private showMessage(message: string): void {
    this.messageText.setText(message);
    this.messageText.setColor("#f2b84b");
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
  }
}

