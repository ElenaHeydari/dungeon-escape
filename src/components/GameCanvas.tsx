import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

export type MoveInput = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type GameCanvasProps = {
  moveInput: RefObject<MoveInput>;
};

const WORLD_SIZE = 12;
const PLAYER_RADIUS = 0.28;
const PLAYER_SPEED = 3.6;

type WallCollider = {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
};

export function GameCanvas({ moveInput }: GameCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#101820");
    scene.fog = new THREE.Fog("#101820", 15, 27);

    const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 80);
    camera.position.set(10, 12, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight("#b8d5df", "#17232d", 2.1));

    const keyLight = new THREE.DirectionalLight("#d9f4ef", 2.5);
    keyLight.position.set(-5, 11, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
      new THREE.MeshStandardMaterial({ color: "#17232d", roughness: 0.94, metalness: 0.05 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(WORLD_SIZE, WORLD_SIZE, "#405566", "#263746");
    grid.position.y = 0.012;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.52;
    });
    scene.add(grid);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: "#263746", roughness: 0.82, metalness: 0.12 });
    const wallColliders: WallCollider[] = [];

    const addWall = (x: number, z: number, width: number, depth: number, height = 1.35) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMaterial);
      wall.position.set(x, height / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);
      wallColliders.push({ x, z, halfX: width / 2, halfZ: depth / 2 });
    };

    const edge = WORLD_SIZE / 2;
    for (let i = -edge; i < edge; i += 1) {
      addWall(i + 0.5, -edge + 0.5, 1, 1);
      addWall(i + 0.5, edge - 0.5, 1, 1);
      if (i > -edge) {
        addWall(-edge + 0.5, i + 0.5, 1, 1);
        addWall(edge - 0.5, i + 0.5, 1, 1);
      }
    }

    addWall(-1.5, -1.5, 3, 0.8);
    addWall(2.1, 0.2, 0.8, 3.2);
    addWall(-2.8, 2.1, 2.4, 0.8);
    addWall(0.2, 3.3, 2.2, 0.7);

    const player = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.31, 0.62, 8),
      new THREE.MeshStandardMaterial({ color: "#263746", roughness: 0.62, metalness: 0.2 }),
    );
    body.position.y = 0.43;
    body.castShadow = true;
    player.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 10),
      new THREE.MeshStandardMaterial({ color: "#8d9ba8", roughness: 0.72 }),
    );
    head.position.set(0, 0.83, 0);
    head.castShadow = true;
    player.add(head);

    const chestGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.09, 0.035),
      new THREE.MeshStandardMaterial({ color: "#45d6c5", emissive: "#168f83", emissiveIntensity: 1.2 }),
    );
    chestGlow.position.set(0, 0.48, -0.255);
    player.add(chestGlow);

    const aura = new THREE.PointLight("#45d6c5", 0.8, 2.8);
    aura.position.set(0, 0.8, 0);
    player.add(aura);

    player.position.set(-4.2, 0, 4.1);
    scene.add(player);

    const clock = new THREE.Clock();
    const direction = new THREE.Vector3();
    const nextPosition = new THREE.Vector3();

    const collidesAt = (x: number, z: number) => wallColliders.some((wall) => {
      const nearestX = Math.max(wall.x - wall.halfX, Math.min(x, wall.x + wall.halfX));
      const nearestZ = Math.max(wall.z - wall.halfZ, Math.min(z, wall.z + wall.halfZ));
      const dx = x - nearestX;
      const dz = z - nearestZ;
      return dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS;
    });

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      const aspect = width / height;
      const viewHeight = 13.5;
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const input = moveInput.current;
      direction.set(
        Number(input.right) - Number(input.left),
        0,
        Number(input.backward) - Number(input.forward),
      );

      if (direction.lengthSq() > 0) {
        direction.normalize();
        nextPosition.copy(player.position);
        nextPosition.x += direction.x * PLAYER_SPEED * delta;
        if (!collidesAt(nextPosition.x, player.position.z)) player.position.x = nextPosition.x;

        nextPosition.copy(player.position);
        nextPosition.z += direction.z * PLAYER_SPEED * delta;
        if (!collidesAt(player.position.x, nextPosition.z)) player.position.z = nextPosition.z;

        player.rotation.y = Math.atan2(direction.x, direction.z);
        body.position.y = 0.43 + Math.sin(clock.elapsedTime * 12) * 0.025;
      } else {
        body.position.y = THREE.MathUtils.damp(body.position.y, 0.43, 8, delta);
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [moveInput]);

  return <div ref={mountRef} className="game-container" aria-label="Three-dimensional isometric dungeon" />;
}
