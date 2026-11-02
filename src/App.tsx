import { useRef } from "react";
import { GameCanvas, type MoveInput } from "./components/GameCanvas";
import "./styles/global.css";

const directions: { label: string; key: keyof MoveInput; className: string }[] = [
  { label: "↑", key: "forward", className: "up" },
  { label: "←", key: "left", className: "left" },
  { label: "↓", key: "backward", className: "down" },
  { label: "→", key: "right", className: "right" },
];

function App() {
  const moveInput = useRef<MoveInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const setDirection = (key: keyof MoveInput, pressed: boolean) => {
    moveInput.current[key] = pressed;
  };

  return (
    <main className="app">
      <header className="game-header">
        <p className="eyebrow">A DARK FANTASY ADVENTURE</p>
        <h1>Dungeon Escape</h1>
        <p>Explore the forgotten halls. Find a way out.</p>
      </header>

      <section className="game-shell" aria-label="Dungeon game">
        <div className="game-topbar">
          <span><i className="status-dot" /> PROTOTYPE · PHASE 01</span>
          <span>THE BEGINNING</span>
        </div>
        <GameCanvas moveInput={moveInput} />
        <div className="game-hint">MOVE <strong>WASD</strong> OR <strong>← ↑ ↓ →</strong> · EXPLORE THE DUNGEON</div>
      </section>

      <div className="touch-controls" aria-label="Touch movement controls">
        <div className="touch-dpad">
          {directions.map(({ label, key, className }) => (
            <button
              key={key}
              type="button"
              className={`touch-direction ${className}`}
              aria-label={`Move ${key}`}
              onPointerDown={(event) => {
                event.preventDefault();
                setDirection(key, true);
              }}
              onPointerUp={() => setDirection(key, false)}
              onPointerCancel={() => setDirection(key, false)}
              onPointerLeave={() => setDirection(key, false)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="touch-caption">TOUCH TO MOVE</p>
      </div>

      <footer className="game-footer">
        <span>ISOMETRIC VIEW</span>
        <span>3D MOVEMENT FOUNDATION</span>
        <span>BUILD 0.1.0</span>
      </footer>
    </main>
  );
}

export default App;
