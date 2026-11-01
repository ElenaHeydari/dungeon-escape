
import Phaser from "phaser";
import {
  LEVEL_01_MAP,
  TILE_SIZE,
  TileType
} from "../maps/level01";
import { Player } from "../entities/Player";
import { Collectible } from "../entities/Collectible";

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
  private collectibles: Collectible[] = [];

  private offsetX = 0;
  private offsetY = 0;

  private hasKey = false;
  private score = 0;
  private completed = false;

  private hudText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super("DungeonScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#101820");

    this.drawMap();
    this.createPlayer();
    this.createCollectibles();
    this.createHUD();
    this.setupControls();
  }

  update(): void {
    if (this.completed || this.player.isMoving) return;

    this.handleMovement();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
    }
  }

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

  private createPlayer(): void {
    this.player = new Player(
      this,
      1,
      1,
      this.offsetX,
      this.offsetY
    );
  }

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
    this.updateHUD();

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
  }

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

  private completeLevel(): void {
    this.completed = true;
    this.score += 500;
    this.updateHUD();

    this.messageText.setColor("#45d6c5");
    this.messageText.setText(
      `LEVEL COMPLETE!  Final score: ${this.score}`
    );
  }

  private showMessage(message: string): void {
    this.messageText.setText(message);
  }

  private updateHUD(): void {
    this.hudText.setText(
      `Score: ${this.score}     Key: ${this.hasKey ? "YES" : "NO"}`
    );
  }
}

