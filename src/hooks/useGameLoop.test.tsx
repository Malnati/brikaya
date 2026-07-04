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
const mockStartPaddleDrag = jest.fn();
const mockMovePaddleDrag = jest.fn();
const mockEndPaddleDrag = jest.fn();
const TOUCH_ZONE_TEST_ID = 'paddle-touch-zone';
const TOUCH_START_EVENT_NAME = 'touchstart';
const TOUCH_MOVE_EVENT_NAME = 'touchmove';
const TOUCH_END_EVENT_NAME = 'touchend';
const TOUCH_CANCEL_EVENT_NAME = 'touchcancel';
const TOUCH_START_CLIENT_X = 128;
const TOUCH_MOVE_CLIENT_X = 196;

jest.mock('../logic/GameEngine', () => ({
  GameEngine: jest.fn().mockImplementation(() => ({
    start: mockStart,
    stop: mockStop,
    resize: mockResize,
    setImageSet: mockSetImageSet,
    setPaused: mockSetPaused,
    startPaddleDrag: mockStartPaddleDrag,
    movePaddleDrag: mockMovePaddleDrag,
    endPaddleDrag: mockEndPaddleDrag,
  })),
}));

jest.mock('../utils/logger', () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
}));

function Harness({
  imageSetId,
  paused = false,
  touchEnabled = false,
}: {
  imageSetId: ImageSetId;
  paused?: boolean;
  touchEnabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchZoneRef = useRef<HTMLDivElement>(null);

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
    touchZoneRef,
  );

  return (
    <>
      <canvas ref={canvasRef} />
      {touchEnabled && <div data-testid={TOUCH_ZONE_TEST_ID} ref={touchZoneRef} />}
    </>
  );
}

function createTouchEvent(type: string, clientX: number | null) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const touches = clientX === null ? [] : [{ clientX }];

  Object.defineProperty(event, 'touches', { value: touches });
  Object.defineProperty(event, 'changedTouches', { value: touches });

  return event as TouchEvent;
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

  it('encaminha gestos touch da faixa sensível para o motor sem recriar a partida', async () => {
    const { getByTestId } = render(
      <Harness imageSetId={IMAGE_SET_RETRO_DEFAULT} touchEnabled />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const touchZone = getByTestId(TOUCH_ZONE_TEST_ID);
    const startEvent = createTouchEvent(
      TOUCH_START_EVENT_NAME,
      TOUCH_START_CLIENT_X,
    );
    const moveEvent = createTouchEvent(TOUCH_MOVE_EVENT_NAME, TOUCH_MOVE_CLIENT_X);
    const endEvent = createTouchEvent(TOUCH_END_EVENT_NAME, null);
    const cancelEvent = createTouchEvent(TOUCH_CANCEL_EVENT_NAME, null);

    touchZone.dispatchEvent(startEvent);
    touchZone.dispatchEvent(moveEvent);
    touchZone.dispatchEvent(endEvent);
    touchZone.dispatchEvent(cancelEvent);

    expect(startEvent.defaultPrevented).toBe(true);
    expect(moveEvent.defaultPrevented).toBe(true);
    expect(endEvent.defaultPrevented).toBe(true);
    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(mockStartPaddleDrag).toHaveBeenCalledWith(TOUCH_START_CLIENT_X);
    expect(mockMovePaddleDrag).toHaveBeenCalledWith(TOUCH_MOVE_CLIENT_X);
    expect(mockEndPaddleDrag).toHaveBeenCalledTimes(2);
    expect(GameEngine).toHaveBeenCalledTimes(1);
  });

  it('ignora touch sem coordenada na faixa sensível', async () => {
    const { getByTestId } = render(
      <Harness imageSetId={IMAGE_SET_RETRO_DEFAULT} touchEnabled />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const startEvent = createTouchEvent(TOUCH_START_EVENT_NAME, null);

    getByTestId(TOUCH_ZONE_TEST_ID).dispatchEvent(startEvent);

    expect(startEvent.defaultPrevented).toBe(false);
    expect(mockStartPaddleDrag).not.toHaveBeenCalled();
  });

  it('remove listeners touch da faixa sensível ao desmontar', async () => {
    const { getByTestId, unmount } = render(
      <Harness imageSetId={IMAGE_SET_RETRO_DEFAULT} touchEnabled />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const touchZone = getByTestId(TOUCH_ZONE_TEST_ID);

    unmount();
    jest.clearAllMocks();
    touchZone.dispatchEvent(
      createTouchEvent(TOUCH_START_EVENT_NAME, TOUCH_START_CLIENT_X),
    );

    expect(mockStartPaddleDrag).not.toHaveBeenCalled();
  });
});
