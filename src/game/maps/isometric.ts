
export const ISO_TILE_WIDTH = 48;
export const ISO_TILE_HEIGHT = 24;

export function tileToWorld(
  tileX: number,
  tileY: number,
  offsetX: number,
  offsetY: number
) {
  return {
    x: offsetX + (tileX - tileY) * (ISO_TILE_WIDTH / 2),
    y: offsetY + (tileX + tileY) * (ISO_TILE_HEIGHT / 2),
  };
}

export function getIsometricMapOffset(
  map: number[][],
  canvasWidth = 800,
  canvasHeight = 600
) {
  const rows = map.length;
  const columns = map[0]?.length ?? 0;

  const centerX =
    ((columns - rows) * ISO_TILE_WIDTH) / 4;

  const centerY =
    ((columns + rows - 2) * ISO_TILE_HEIGHT) / 4;

  return {
    x: canvasWidth / 2 - centerX,
    y: canvasHeight / 2 - centerY,
  };
}

export function getIsometricDepth(
  tileX: number,
  tileY: number,
  layer = 0
) {
  return (tileX + tileY) * 10 + layer;
}


export function getEntityDepth(
  tileX: number,
  tileY: number,
  layer = 0
) {
  return 1000 + (tileX + tileY) * 10 + layer;
}

