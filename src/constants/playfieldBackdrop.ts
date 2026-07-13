// src/constants/playfieldBackdrop.ts
export const PLAYFIELD_BACKDROP_TOP = "#04070f";
export const PLAYFIELD_BACKDROP_MID = "#070d18";
export const PLAYFIELD_BACKDROP_BOTTOM = "#0a1220";
export const PLAYFIELD_BACKDROP_MID_STOP = 0.45;

export function buildPlayfieldBackdropGradient(
  ctx: CanvasRenderingContext2D,
  height: number,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, PLAYFIELD_BACKDROP_TOP);
  gradient.addColorStop(PLAYFIELD_BACKDROP_MID_STOP, PLAYFIELD_BACKDROP_MID);
  gradient.addColorStop(1, PLAYFIELD_BACKDROP_BOTTOM);
  return gradient;
}
