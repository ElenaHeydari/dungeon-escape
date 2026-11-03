
import Phaser from "phaser";
import { DungeonScene } from "../game/scenes/DungeonScene";

type TouchControlsProps = {
  game: Phaser.Game | null;
};

export function TouchControls({ game }: TouchControlsProps) {
  const getScene = (): DungeonScene | null => {
    if (!game) return null;

    try {
      const scene = game.scene.getScene("DungeonScene") as DungeonScene;

      if (!scene || !scene.sys.isActive()) return null;

      return scene;
    } catch {
      return null;
    }
  };

  const setDirection = (x: number, y: number) => {
    getScene()?.setTouchDirection({ x, y });
  };

  const releaseDirection = () => {
    getScene()?.setTouchDirection(null);
  };

  const action = (
    name: "attack" | "interact" | "potion" | "pause" | "restart" | "next"
  ) => {
    getScene()?.touchAction(name);
  };

  const directionButton = (
    label: string,
    x: number,
    y: number,
    className: string
  ) => (
    <button
      type="button"
      className={`touch-direction ${className}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setDirection(x, y);
      }}
      onPointerUp={releaseDirection}
      onPointerCancel={releaseDirection}
      onLostPointerCapture={releaseDirection}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <section className="touch-controls" aria-label="Touch game controls">
      <div className="touch-dpad">
        {directionButton("↗", 0, -1, "up")}
        {directionButton("↖", -1, 0, "left")}
        {directionButton("↘", 1, 0, "right")}
        {directionButton("↙", 0, 1, "down")}
      </div>

      <div className="touch-actions">
        <button type="button" onClick={() => action("attack")}>
          Attack
        </button>
        <button type="button" onClick={() => action("interact")}>
          Interact
        </button>
        <button type="button" onClick={() => action("potion")}>
          Potion
        </button>
        <button type="button" onClick={() => action("pause")}>
          Pause
        </button>
        <button type="button" onClick={() => action("restart")}>
          Restart
        </button>
        <button type="button" onClick={() => action("next")}>
          Next
        </button>
      </div>
    </section>
  );
}
