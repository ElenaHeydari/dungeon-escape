
import { useEffect, useRef } from "react";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

export function IsometricGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    scene.clearColor = new Color4(16 / 255, 24 / 255, 32 / 255, 1);

    // Isometric-style orthographic camera
    const camera = new ArcRotateCamera(
      "isometricCamera",
      -Math.PI / 4,
      Math.PI / 3,
      12,
      new Vector3(0, 0, 0),
      scene
    );

    camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
    camera.lowerRadiusLimit = 12;
    camera.upperRadiusLimit = 12;
    camera.attachControl(canvas, true);

    const size = 8;

    const updateCameraSize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) return;

      const aspect = width / height;

      camera.orthoLeft = -size * aspect;
      camera.orthoRight = size * aspect;
      camera.orthoTop = size;
      camera.orthoBottom = -size;
    };

    updateCameraSize();

    // Lighting
    const light = new HemisphericLight(
      "ambientLight",
      new Vector3(0, 1, 0),
      scene
    );

    light.intensity = 0.9;

    // Floor
    const floor = MeshBuilder.CreateBox(
      "floor",
      { width: 10, height: 0.3, depth: 10 },
      scene
    );

    floor.position.y = -0.15;

    const floorMaterial = new StandardMaterial("floorMaterial", scene);
    floorMaterial.diffuseColor = new Color3(0.09, 0.14, 0.17);
    floor.material = floorMaterial;

    // Walls
    const wallMaterial = new StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new Color3(0.15, 0.22, 0.28);

    const createWall = (
      name: string,
      x: number,
      z: number,
      width: number,
      depth: number
    ) => {
      const wall = MeshBuilder.CreateBox(
        name,
        { width, height: 2, depth },
        scene
      );

      wall.position.set(x, 1, z);
      wall.material = wallMaterial;
    };

    createWall("northWall", 0, -5, 10, 0.3);
    createWall("southWall", 0, 5, 10, 0.3);
    createWall("westWall", -5, 0, 0.3, 10);
    createWall("eastWall", 5, 0, 0.3, 10);

    // Player
    const player = MeshBuilder.CreateBox(
      "player",
      { width: 0.7, height: 1, depth: 0.7 },
      scene
    );

    player.position.set(0, 0.5, 0);

    const playerMaterial = new StandardMaterial("playerMaterial", scene);
    playerMaterial.diffuseColor = new Color3(0.27, 0.84, 0.77);
    player.material = playerMaterial;

    // Keyboard input
    const pressedKeys = new Set<string>();

    const movementKeys = new Set([
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
    ]);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement !== canvas) return;

      const key = event.key.toLowerCase();

      if (movementKeys.has(key)) {
        event.preventDefault();
        pressedKeys.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key.toLowerCase());
    };

    const handleBlur = () => {
      pressedKeys.clear();
    };

    const handlePointerDown = () => {
      canvas.focus();
    };

    canvas.tabIndex = 0;

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("blur", handleBlur);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    // Movement settings
    const moveSpeed = 3.5;
    const movementLimit = 4.5;

    const movementObserver = scene.onBeforeRenderObservable.add(() => {
      const deltaTime = Math.min(
        engine.getDeltaTime() / 1000,
        0.05
      );

      let moveX = 0;
      let moveZ = 0;

      if (pressedKeys.has("w") || pressedKeys.has("arrowup")) {
        moveZ -= 1;
      }

      if (pressedKeys.has("s") || pressedKeys.has("arrowdown")) {
        moveZ += 1;
      }

      if (pressedKeys.has("a") || pressedKeys.has("arrowleft")) {
        moveX -= 1;
      }

      if (pressedKeys.has("d") || pressedKeys.has("arrowright")) {
        moveX += 1;
      }

      // Normalize diagonal movement
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);

      if (length > 0) {
        moveX /= length;
        moveZ /= length;

        player.position.x += moveX * moveSpeed * deltaTime;
        player.position.z += moveZ * moveSpeed * deltaTime;
      }

      // Keep player inside the room
      player.position.x = Math.max(
        -movementLimit,
        Math.min(movementLimit, player.position.x)
      );

      player.position.z = Math.max(
        -movementLimit,
        Math.min(movementLimit, player.position.z)
      );
    });

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
      updateCameraSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);

      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("blur", handleBlur);

      scene.onBeforeRenderObservable.remove(movementObserver);

      camera.detachControl();
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        overflow: "hidden",
        borderRadius: "12px",
        background: "#101820",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          outline: "none",
          touchAction: "none",
        }}
      />
    </div>
  );
}
