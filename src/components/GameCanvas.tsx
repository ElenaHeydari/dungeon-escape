import { useEffect, useRef } from "react";
import Phaser from "phaser";

import { GAME_CONFIG } from "../game/core/GameConfig";

export function GameCanvas() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const game = new Phaser.Game({
      ...GAME_CONFIG,
      parent: gameRef.current,
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={gameRef}
      id="dungeon-game"
      className="game-container"
    />
  );
}