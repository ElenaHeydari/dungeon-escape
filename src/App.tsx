import { GameCanvas } from "./components/GameCanvas";
import "./styles/global.css";

function App() {
  return (
    <main className="app">
      <header className="game-header">
        <h1>Dungeon Escape</h1>
        <p>Find your way out of the dungeon.</p>
      </header>

      <GameCanvas />

      
      <footer className="game-footer">
        <span>Move: WASD / Arrows</span>
        <span>Attack: Space | Interact: E</span>
        <span>Potion: H | Pause: Esc | Restart: R</span>
      </footer>

    </main>
  );
}

export default App;

