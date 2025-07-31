// src/constants/game.ts
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 320;

// Responsividade
export const MIN_CANVAS_WIDTH = 320;
export const MIN_CANVAS_HEIGHT = 240;
export const MAX_CANVAS_WIDTH = 800;
export const MAX_CANVAS_HEIGHT = 600;

// Controles touch
export const TOUCH_SENSITIVITY = 2;
export const TOUCH_DEAD_ZONE = 10;

export const BALL_RADIUS = 10;
export const BALL_SPEED = 2;

export const PADDLE_WIDTH = 75;
export const PADDLE_HEIGHT = 10;
export const PADDLE_SPEED = 7;

// Dimensões base dos blocos (serão ajustadas dinamicamente)
export const BRICK_WIDTH = 75;
export const BRICK_HEIGHT = 20;
export const BRICK_PADDING = 10;
export const BRICK_OFFSET_TOP = 30;
export const BRICK_OFFSET_LEFT = 30;

export const BRICK_ROWS = 3;
export const BRICK_COLS = 5;

export const GAME_COLOR = '#00d4ff';
export const ROOT_ELEMENT_ID = 'root';

// Funções para calcular dimensões dinâmicas
export interface DynamicGameDimensions {
  brickWidth: number;
  brickHeight: number;
  brickPadding: number;
  brickOffsetTop: number;
  brickOffsetLeft: number;
  brickCols: number;
  brickRows: number;
  paddleWidth: number;
  paddleHeight: number;
  ballRadius: number;
}

export function calculateDynamicDimensions(canvasWidth: number, canvasHeight: number): DynamicGameDimensions {
  // Calcular largura disponível para os blocos (deixando margem)
  const availableWidth = canvasWidth - 60; // 30px de margem em cada lado
  const availableHeight = canvasHeight * 0.4; // 40% da altura para os blocos
  
  // Calcular número de colunas baseado na largura disponível
  // Queremos pelo menos 3 colunas e no máximo 8
  const minBrickWidth = 40; // Largura mínima para um bloco
  const maxBrickWidth = 120; // Largura máxima para um bloco
  
  let brickCols = Math.floor(availableWidth / (minBrickWidth + 10));
  brickCols = Math.max(3, Math.min(8, brickCols)); // Entre 3 e 8 colunas
  
  // Calcular largura do bloco baseada no número de colunas
  const brickWidth = Math.max(minBrickWidth, Math.min(maxBrickWidth, (availableWidth - (brickCols - 1) * 10) / brickCols));
  
  // Calcular altura do bloco proporcional à largura
  const brickHeight = brickWidth * 0.3; // Proporção 3:1
  
  // Calcular padding entre blocos
  const brickPadding = Math.max(5, brickWidth * 0.1);
  
  // Calcular offset para centralizar os blocos
  const totalBricksWidth = brickCols * brickWidth + (brickCols - 1) * brickPadding;
  const brickOffsetLeft = (canvasWidth - totalBricksWidth) / 2;
  
  // Calcular offset top baseado na altura disponível
  const brickOffsetTop = Math.max(20, canvasHeight * 0.1);
  
  // Calcular número de linhas baseado na altura disponível
  const maxRows = Math.floor((availableHeight - brickOffsetTop) / (brickHeight + brickPadding));
  const brickRows = Math.max(2, Math.min(5, maxRows)); // Entre 2 e 5 linhas
  
  // Calcular dimensões do paddle proporcionalmente
  const paddleWidth = Math.max(60, Math.min(120, canvasWidth * 0.2));
  const paddleHeight = paddleWidth * 0.15;
  
  // Calcular raio da bola proporcionalmente
  const ballRadius = Math.max(8, Math.min(15, canvasWidth * 0.02));
  
  return {
    brickWidth,
    brickHeight,
    brickPadding,
    brickOffsetTop,
    brickOffsetLeft,
    brickCols,
    brickRows,
    paddleWidth,
    paddleHeight,
    ballRadius
  };
}