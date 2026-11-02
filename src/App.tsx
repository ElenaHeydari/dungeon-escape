
import { useCallback, useState } from "react";
import Phaser from "phaser";

import { GameCanvas } from "./components/GameCanvas";
import { TouchControls } from "./components/TouchControls";
import "./styles/global.css";

function App() {
  const [game, setGame] = useState<Phaser.Game | null>(null);

  const handleGameReady = useCallback((instance: Phaser.Game | null) => {
    setGame(instance);
  }, []);

  return (
    <main className="app">
      <header className="game-header">
        <h1>Dungeon Escape</h1>
        <p>Find your way out of the dungeon.</p>
      </header>

      <div className="game-area">
        <GameCanvas onGameReady={handleGameReady} />
        <TouchControls game={game} />
      </div>

      <footer className="game-footer">
        <span>Move: WASD / Arrows</span>
        <span>Attack: Space | Interact: E</span>
        <span>Potion: H | Pause: Esc | Restart: R</span>
      </footer>
    </main>
  );
}

export default App;

