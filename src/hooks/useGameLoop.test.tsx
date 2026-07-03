// src/hooks/useGameLoop.test.tsx
import { render, waitFor } from '@testing-library/react';
import { useRef } from 'react';

import {
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from '../constants/appearance';
import { GameEngine } from '../logic/GameEngine';
import { useGameLoop } from './useGameLoop';

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockResize = jest.fn();
const mockSetImageSet = jest.fn();
const mockSetPaused = jest.fn();

jest.mock('../logic/GameEngine', () => ({
  GameEngine: jest.fn().mockImplementation(() => ({
    start: mockStart,
    stop: mockStop,
    resize: mockResize,
    setImageSet: mockSetImageSet,
    setPaused: mockSetPaused,
  })),
}));

jest.mock('../utils/logger', () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
}));

function Harness({
  imageSetId,
  paused = false,
}: {
  imageSetId: ImageSetId;
  paused?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGameLoop(
    canvasRef,
    jest.fn(),
    undefined,
    undefined,
    undefined,
    undefined,
    null,
    undefined,
    undefined,
    false,
    imageSetId,
    paused,
  );

  return <canvas ref={canvasRef} />;
}

describe('useGameLoop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('troca conjunto de imagens no motor atual sem recriar a partida', async () => {
    const { rerender } = render(
      <Harness imageSetId={IMAGE_SET_RETRO_DEFAULT} />,
    );

    expect(GameEngine).toHaveBeenCalledTimes(1);

    rerender(<Harness imageSetId={IMAGE_SET_HIGH_CONTRAST} />);

    await waitFor(() => {
      expect(mockSetImageSet).toHaveBeenCalledWith(IMAGE_SET_HIGH_CONTRAST);
    });
    expect(GameEngine).toHaveBeenCalledTimes(1);
    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('pausa o motor atual sem recriar a partida', async () => {
    const { rerender } = render(
      <Harness imageSetId={IMAGE_SET_RETRO_DEFAULT} />,
    );

    expect(GameEngine).toHaveBeenCalledTimes(1);

    rerender(<Harness imageSetId={IMAGE_SET_RETRO_DEFAULT} paused />);

    await waitFor(() => {
      expect(mockSetPaused).toHaveBeenCalledWith(true);
    });
    expect(GameEngine).toHaveBeenCalledTimes(1);
    expect(mockStart).toHaveBeenCalledTimes(1);
  });
});
