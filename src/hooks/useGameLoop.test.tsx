// src/hooks/useGameLoop.test.tsx
import { render, waitFor } from "@testing-library/react";
import { useRef } from "react";

import {
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from "../constants/appearance";
import { GameEngine } from "../logic/GameEngine";
import { useGameLoop } from "./useGameLoop";

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockResize = jest.fn();
const mockSetImageSet = jest.fn();
const mockSetPaused = jest.fn();
const mockStartPaddleDrag = jest.fn();
const mockMovePaddleDrag = jest.fn();
const mockEndPaddleDrag = jest.fn();
const mockSetBallTurretControlVector = jest.fn();
const mockSetBallTurretJoystickTurn = jest.fn();
const TOUCH_ZONE_TEST_ID = "paddle-touch-zone";
const JOYSTICK_TEST_ID = "ball-turret-joystick";
const TOUCH_START_EVENT_NAME = "touchstart";
const TOUCH_MOVE_EVENT_NAME = "touchmove";
const TOUCH_END_EVENT_NAME = "touchend";
const TOUCH_CANCEL_EVENT_NAME = "touchcancel";
const POINTER_DOWN_EVENT_NAME = "pointerdown";
const POINTER_MOVE_EVENT_NAME = "pointermove";
const POINTER_UP_EVENT_NAME = "pointerup";
const POINTER_CANCEL_EVENT_NAME = "pointercancel";
const TOUCH_START_CLIENT_X = 128;
const TOUCH_MOVE_CLIENT_X = 196;
const TOUCH_START_CLIENT_Y = 420;
const TOUCH_MOVE_CLIENT_Y = 512;
const TRACKBALL_X_CSS_VAR = "--bb-turret-trackball-x";
const TRACKBALL_Y_CSS_VAR = "--bb-turret-trackball-y";
const TRACKBALL_ACTIVE_CSS_VAR = "--bb-turret-trackball-active";
const DIAGONAL_TRACKBALL_AXIS = Math.SQRT1_2;
const JOYSTICK_RECT = {
  left: 100,
  top: 200,
  width: 100,
  height: 100,
  bottom: 300,
  right: 200,
  x: 100,
  y: 200,
  toJSON: jest.fn(),
} as unknown as DOMRect;

jest.mock("../logic/GameEngine", () => ({
  GameEngine: jest.fn().mockImplementation(() => ({
    start: mockStart,
    stop: mockStop,
    resize: mockResize,
    setImageSet: mockSetImageSet,
    setPaused: mockSetPaused,
    startPaddleDrag: mockStartPaddleDrag,
    movePaddleDrag: mockMovePaddleDrag,
    endPaddleDrag: mockEndPaddleDrag,
    setBallTurretControlVector: mockSetBallTurretControlVector,
    setBallTurretJoystickTurn: mockSetBallTurretJoystickTurn,
  })),
}));

jest.mock("../utils/logger", () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
}));

function Harness({
  imageSetId,
  paused = false,
  touchEnabled = false,
  joystickEnabled = false,
  gameMode = "classic",
}: {
  imageSetId: ImageSetId;
  paused?: boolean;
  touchEnabled?: boolean;
  joystickEnabled?: boolean;
  gameMode?: "classic" | "ball-turret";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchZoneRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef<HTMLDivElement>(null);

  (useGameLoop as unknown as (...args: unknown[]) => void)(
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
    gameMode,
    touchZoneRef,
    joystickRef,
  );

  return (
    <>
      <canvas ref={canvasRef} />
      {touchEnabled && (
        <div data-testid={TOUCH_ZONE_TEST_ID} ref={touchZoneRef} />
      )}
      {joystickEnabled && (
        <div data-testid={JOYSTICK_TEST_ID} ref={joystickRef} />
      )}
    </>
  );
}

function createTouchEvent(
  type: string,
  clientX: number | null,
  clientY = TOUCH_START_CLIENT_Y,
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const touches = clientX === null ? [] : [{ clientX, clientY }];

  Object.defineProperty(event, "touches", { value: touches });
  Object.defineProperty(event, "changedTouches", { value: touches });

  return event as TouchEvent;
}

function createPointerEvent(type: string, clientX: number, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.defineProperty(event, "clientX", { value: clientX });
  Object.defineProperty(event, "clientY", { value: clientY });
  Object.defineProperty(event, "pointerId", { value: 7 });

  return event as PointerEvent;
}

function readStyleNumber(element: HTMLElement, propertyName: string) {
  return Number(element.style.getPropertyValue(propertyName));
}

describe("useGameLoop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("troca conjunto de imagens no motor atual sem recriar a partida", async () => {
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

  it("pausa o motor atual sem recriar a partida", async () => {
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

  it("encaminha gestos touch da faixa sensível para o motor sem recriar a partida", async () => {
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
      TOUCH_START_CLIENT_Y,
    );
    const moveEvent = createTouchEvent(
      TOUCH_MOVE_EVENT_NAME,
      TOUCH_MOVE_CLIENT_X,
      TOUCH_MOVE_CLIENT_Y,
    );
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
    expect(mockStartPaddleDrag).toHaveBeenCalledWith(
      TOUCH_START_CLIENT_X,
      TOUCH_START_CLIENT_Y,
    );
    expect(mockMovePaddleDrag).toHaveBeenCalledWith(
      TOUCH_MOVE_CLIENT_X,
      TOUCH_MOVE_CLIENT_Y,
    );
    expect(mockEndPaddleDrag).toHaveBeenCalledTimes(2);
    expect(GameEngine).toHaveBeenCalledTimes(1);
  });

  it("ignora touch sem coordenada na faixa sensível", async () => {
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

  it("remove listeners touch da faixa sensível ao desmontar", async () => {
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

  it("encaminha trackball da torreta com feedback visual 3D e giro horizontal", async () => {
    const { getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const joystick = getByTestId(JOYSTICK_TEST_ID);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDown = createPointerEvent(POINTER_DOWN_EVENT_NAME, 200, 250);
    const pointerMoveLeft = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      100,
      250,
    );
    const pointerMoveTop = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      150,
      200,
    );
    const pointerUp = createPointerEvent(POINTER_UP_EVENT_NAME, 150, 200);

    joystick.dispatchEvent(pointerDown);
    joystick.dispatchEvent(pointerMoveLeft);
    joystick.dispatchEvent(pointerMoveTop);
    joystick.dispatchEvent(pointerUp);

    expect(pointerDown.defaultPrevented).toBe(true);
    expect(pointerMoveLeft.defaultPrevented).toBe(true);
    expect(pointerMoveTop.defaultPrevented).toBe(true);
    expect(pointerUp.defaultPrevented).toBe(true);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenNthCalledWith(1, 1);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenNthCalledWith(2, -1);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenNthCalledWith(3, 0);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenNthCalledWith(4, 0);
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
    expect(mockSetBallTurretControlVector).not.toHaveBeenCalled();
    expect(GameEngine).toHaveBeenCalledTimes(1);
  });

  it("mostra pressão imediata ao tocar no lado esquerdo do trackball da torreta", async () => {
    const { getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const joystick = getByTestId(JOYSTICK_TEST_ID);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDownLeft = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      100,
      250,
    );

    joystick.dispatchEvent(pointerDownLeft);

    expect(pointerDownLeft.defaultPrevented).toBe(true);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenCalledWith(-1);
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("-1");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("1");
  });

  it("usa touch como fallback do trackball quando eventos pointer não cobrem o gesto", async () => {
    const { getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const joystick = getByTestId(JOYSTICK_TEST_ID);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const touchStartLeft = createTouchEvent(TOUCH_START_EVENT_NAME, 100, 250);
    const touchMoveTop = createTouchEvent(TOUCH_MOVE_EVENT_NAME, 150, 200);
    const touchEnd = createTouchEvent(TOUCH_END_EVENT_NAME, null);

    joystick.dispatchEvent(touchStartLeft);
    joystick.dispatchEvent(touchMoveTop);
    joystick.dispatchEvent(touchEnd);

    expect(touchStartLeft.defaultPrevented).toBe(true);
    expect(touchMoveTop.defaultPrevented).toBe(true);
    expect(touchEnd.defaultPrevented).toBe(true);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenNthCalledWith(1, -1);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenNthCalledWith(2, 0);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenNthCalledWith(3, 0);
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
  });

  it("reseta trackball mesmo quando a captura de ponteiro não está disponível", async () => {
    const { getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const joystick = getByTestId(JOYSTICK_TEST_ID);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);
    joystick.setPointerCapture = jest.fn(() => {
      throw new Error("captura indisponível");
    });
    joystick.releasePointerCapture = jest.fn(() => {
      throw new Error("captura indisponível");
    });

    const pointerDown = createPointerEvent(POINTER_DOWN_EVENT_NAME, 200, 250);
    const pointerCancel = createPointerEvent(
      POINTER_CANCEL_EVENT_NAME,
      200,
      250,
    );

    joystick.dispatchEvent(pointerDown);
    joystick.dispatchEvent(pointerCancel);

    expect(pointerDown.defaultPrevented).toBe(true);
    expect(pointerCancel.defaultPrevented).toBe(true);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenLastCalledWith(0);
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
  });

  it("representa oito direções do trackball e normaliza diagonais antes de girar", async () => {
    const { getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const joystick = getByTestId(JOYSTICK_TEST_ID);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const dispatchAndExpect = (
      event: PointerEvent,
      expectedTurn: number,
      expectedX: number,
      expectedY: number,
    ) => {
      joystick.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(mockSetBallTurretJoystickTurn).toHaveBeenLastCalledWith(
        expect.closeTo(expectedTurn, 6),
      );
      expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(
        expectedX,
      );
      expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(
        expectedY,
      );
      expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe(
        "1",
      );
    };

    dispatchAndExpect(
      createPointerEvent(POINTER_DOWN_EVENT_NAME, 150, 250),
      0,
      0,
      0,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 200, 200),
      DIAGONAL_TRACKBALL_AXIS,
      DIAGONAL_TRACKBALL_AXIS,
      -DIAGONAL_TRACKBALL_AXIS,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 300),
      -DIAGONAL_TRACKBALL_AXIS,
      -DIAGONAL_TRACKBALL_AXIS,
      DIAGONAL_TRACKBALL_AXIS,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 200),
      -DIAGONAL_TRACKBALL_AXIS,
      -DIAGONAL_TRACKBALL_AXIS,
      -DIAGONAL_TRACKBALL_AXIS,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 200, 300),
      DIAGONAL_TRACKBALL_AXIS,
      DIAGONAL_TRACKBALL_AXIS,
      DIAGONAL_TRACKBALL_AXIS,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 150, 300),
      0,
      0,
      1,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 150, 200),
      0,
      0,
      -1,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 200, 250),
      1,
      1,
      0,
    );
    dispatchAndExpect(
      createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 250),
      -1,
      -1,
      0,
    );

    const pointerUp = createPointerEvent(POINTER_UP_EVENT_NAME, 150, 250);
    joystick.dispatchEvent(pointerUp);

    expect(pointerUp.defaultPrevented).toBe(true);
    expect(mockSetBallTurretJoystickTurn).toHaveBeenLastCalledWith(0);
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
  });
});
