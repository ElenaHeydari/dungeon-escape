
import { useEffect, useRef } from "react";
import Phaser from "phaser";

import { GAME_CONFIG } from "../game/core/GameConfig";

type GameCanvasProps = {
  onGameReady: (game: Phaser.Game | null) => void;
};

export function GameCanvas({ onGameReady }: GameCanvasProps) {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const game = new Phaser.Game({
      ...GAME_CONFIG,
      parent: gameRef.current,
    });

    onGameReady(game);

    return () => {
      onGameReady(null);
      game.destroy(true);
    };
  }, [onGameReady]);

  return (
    <div
      ref={gameRef}
      id="dungeon-game"
      className="game-container"
    />
  );
}
