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
const mockSetTurretControlMode = jest.fn();
const mockSetDualSwitchDirection = jest.fn();
const mockGetPaddleDiagnosticSnapshot = jest.fn();
const TOUCH_ZONE_TEST_ID = "paddle-touch-zone";
const JOYSTICK_TEST_ID = "ball-turret-joystick";
const LEFT_SWITCH_TEST_ID = "ball-turret-switch-left";
const RIGHT_SWITCH_TEST_ID = "ball-turret-switch-right";
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
const SWITCH_AXIS_CSS_VAR = "--bb-turret-switch-axis";
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
const CANVAS_RECT = {
  left: 20,
  top: 40,
  width: 400,
  height: 300,
  bottom: 340,
  right: 420,
  x: 20,
  y: 40,
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
    setTurretControlMode: mockSetTurretControlMode,
    setDualSwitchDirection: mockSetDualSwitchDirection,
    getPaddleDiagnosticSnapshot: mockGetPaddleDiagnosticSnapshot,
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
  switchesEnabled = false,
  gameMode = "classic",
  turretControlMode = "dual-switch",
  joystickDiagnosticsEnabled = false,
  onJoystickDiagnosticSample,
  onServeLockChange,
}: {
  imageSetId: ImageSetId;
  paused?: boolean;
  touchEnabled?: boolean;
  joystickEnabled?: boolean;
  switchesEnabled?: boolean;
  gameMode?: "classic" | "ball-turret";
  turretControlMode?: "joystick" | "dual-switch";
  joystickDiagnosticsEnabled?: boolean;
  onJoystickDiagnosticSample?: (sample: unknown) => void;
  onServeLockChange?: (locked: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchZoneRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef<HTMLDivElement>(null);
  const leftSwitchRef = useRef<HTMLDivElement>(null);
  const rightSwitchRef = useRef<HTMLDivElement>(null);

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
    turretControlMode,
    touchZoneRef,
    joystickRef,
    leftSwitchRef,
    rightSwitchRef,
    joystickDiagnosticsEnabled,
    onJoystickDiagnosticSample,
    onServeLockChange,
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
      {switchesEnabled && (
        <>
          <div data-testid={LEFT_SWITCH_TEST_ID} ref={leftSwitchRef} />
          <div data-testid={RIGHT_SWITCH_TEST_ID} ref={rightSwitchRef} />
        </>
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

function createKeyboardEvent(type: string, key: string) {
  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.defineProperty(event, "key", { value: key });

  return event as KeyboardEvent;
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

  it("inicia a torreta com interruptores duplos e publica callback de saque", async () => {
    const onServeLockChange = jest.fn();

    render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        switchesEnabled
        onServeLockChange={onServeLockChange}
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
      expect(mockSetTurretControlMode).toHaveBeenCalledWith("dual-switch");
    });

    const constructorArgs = (GameEngine as jest.Mock).mock.calls[0];
    expect(constructorArgs[10]).toBe("ball-turret");
    expect(constructorArgs[11]).toBe("dual-switch");
    expect(constructorArgs[12]).toEqual(expect.any(Function));

    constructorArgs[12](true);

    expect(onServeLockChange).toHaveBeenCalledWith(true);
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

  it("espelha pontos do joystick para pontos equivalentes do canvas por pointer", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDownCenter = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      150,
      250,
    );
    joystick.dispatchEvent(pointerDownCenter);

    const cases = [
      {
        name: "direita",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 200, 250),
        expectedClientX: 420,
        expectedClientY: 190,
        expectedVisualX: 1,
        expectedVisualY: 0,
      },
      {
        name: "esquerda",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 250),
        expectedClientX: 20,
        expectedClientY: 190,
        expectedVisualX: -1,
        expectedVisualY: 0,
      },
      {
        name: "topo",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 150, 200),
        expectedClientX: 220,
        expectedClientY: 40,
        expectedVisualX: 0,
        expectedVisualY: -1,
      },
      {
        name: "base",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 150, 300),
        expectedClientX: 220,
        expectedClientY: 340,
        expectedVisualX: 0,
        expectedVisualY: 1,
      },
      {
        name: "arco superior direito",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 185, 215),
        expectedClientX: 360,
        expectedClientY: 85,
        expectedVisualX: 0.7,
        expectedVisualY: -0.7,
      },
      {
        name: "arco inferior esquerdo",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 115, 285),
        expectedClientX: 80,
        expectedClientY: 295,
        expectedVisualX: -0.7,
        expectedVisualY: 0.7,
      },
      {
        name: "arco superior esquerdo",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 115, 215),
        expectedClientX: 80,
        expectedClientY: 85,
        expectedVisualX: -0.7,
        expectedVisualY: -0.7,
      },
      {
        name: "arco inferior direito",
        event: createPointerEvent(POINTER_MOVE_EVENT_NAME, 185, 285),
        expectedClientX: 360,
        expectedClientY: 295,
        expectedVisualX: 0.7,
        expectedVisualY: 0.7,
      },
    ];

    expect(pointerDownCenter.defaultPrevented).toBe(true);
    expect(mockStartPaddleDrag).toHaveBeenCalledWith(220, 190);
    expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(0);
    expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(0);

    for (const point of cases) {
      joystick.dispatchEvent(point.event);

      expect(point.event.defaultPrevented).toBe(true);
      expect(mockMovePaddleDrag).toHaveBeenLastCalledWith(
        point.expectedClientX,
        point.expectedClientY,
      );
      expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(
        point.expectedVisualX,
      );
      expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(
        point.expectedVisualY,
      );
      expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe(
        "1",
      );
    }

    expect(mockSetBallTurretControlVector).not.toHaveBeenCalled();
  });

  it("ignora início pointer fora do joystick espelhado", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDownOutside = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      80,
      320,
    );

    joystick.dispatchEvent(pointerDownOutside);

    expect(pointerDownOutside.defaultPrevented).toBe(false);
    expect(mockStartPaddleDrag).not.toHaveBeenCalled();
    expect(mockMovePaddleDrag).not.toHaveBeenCalled();
    expect(mockEndPaddleDrag).not.toHaveBeenCalled();
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
  });

  it("ignora início pointer fora do círculo visual mesmo dentro do retângulo do joystick", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDownTransparentCorner = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      100,
      200,
    );

    joystick.dispatchEvent(pointerDownTransparentCorner);

    expect(pointerDownTransparentCorner.defaultPrevented).toBe(false);
    expect(mockStartPaddleDrag).not.toHaveBeenCalled();
    expect(mockMovePaddleDrag).not.toHaveBeenCalled();
    expect(mockEndPaddleDrag).not.toHaveBeenCalled();
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
  });

  it("ignora movimento pointer fora do joystick sem clamping e retoma ao voltar", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDownCenter = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      150,
      250,
    );
    const pointerMoveOutside = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      240,
      180,
    );
    const pointerMoveLeft = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      100,
      250,
    );

    joystick.dispatchEvent(pointerDownCenter);
    mockMovePaddleDrag.mockClear();
    joystick.dispatchEvent(pointerMoveOutside);

    expect(pointerDownCenter.defaultPrevented).toBe(true);
    expect(pointerMoveOutside.defaultPrevented).toBe(true);
    expect(mockStartPaddleDrag).toHaveBeenCalledWith(220, 190);
    expect(mockMovePaddleDrag).not.toHaveBeenCalled();
    expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(0);
    expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(0);
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe(
      "1",
    );

    joystick.dispatchEvent(pointerMoveLeft);

    expect(pointerMoveLeft.defaultPrevented).toBe(true);
    expect(mockMovePaddleDrag).toHaveBeenCalledWith(20, 190);
    expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(-1);
    expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(0);
  });

  it("ignora movimento pointer fora do círculo visual e retoma ao voltar ao círculo", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDownBottom = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      150,
      300,
    );
    const pointerMoveTransparentCorner = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      100,
      300,
    );
    const pointerMoveLeftEdge = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      100,
      250,
    );

    joystick.dispatchEvent(pointerDownBottom);
    mockMovePaddleDrag.mockClear();
    joystick.dispatchEvent(pointerMoveTransparentCorner);

    expect(pointerDownBottom.defaultPrevented).toBe(true);
    expect(pointerMoveTransparentCorner.defaultPrevented).toBe(true);
    expect(mockStartPaddleDrag).toHaveBeenCalledWith(220, 340);
    expect(mockMovePaddleDrag).not.toHaveBeenCalled();
    expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(0);
    expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(1);
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe(
      "1",
    );

    joystick.dispatchEvent(pointerMoveLeftEdge);

    expect(pointerMoveLeftEdge.defaultPrevented).toBe(true);
    expect(mockMovePaddleDrag).toHaveBeenCalledWith(20, 190);
    expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(-1);
    expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(0);
  });

  it("para de mover na tangência inferior esquerda quando o pointer sai do círculo visual", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDownBottom = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      150,
      300,
    );
    const pointerMoveInsideLowerLeftArc = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      120,
      290,
    );
    const pointerMoveOutsideLowerLeftTangent = createPointerEvent(
      POINTER_MOVE_EVENT_NAME,
      100,
      300,
    );

    joystick.dispatchEvent(pointerDownBottom);
    joystick.dispatchEvent(pointerMoveInsideLowerLeftArc);
    mockMovePaddleDrag.mockClear();
    joystick.dispatchEvent(pointerMoveOutsideLowerLeftTangent);

    expect(pointerDownBottom.defaultPrevented).toBe(true);
    expect(pointerMoveInsideLowerLeftArc.defaultPrevented).toBe(true);
    expect(pointerMoveOutsideLowerLeftTangent.defaultPrevented).toBe(true);
    expect(mockStartPaddleDrag).toHaveBeenCalledWith(220, 340);
    expect(mockMovePaddleDrag).not.toHaveBeenCalled();
    expect(readStyleNumber(joystick, TRACKBALL_X_CSS_VAR)).toBeCloseTo(-0.6);
    expect(readStyleNumber(joystick, TRACKBALL_Y_CSS_VAR)).toBeCloseTo(0.8);
  });


  it("registra diagnóstico aceito com ponto do joystick e posição da cama elástica", async () => {
    const onJoystickDiagnosticSample = jest.fn();
    mockGetPaddleDiagnosticSnapshot.mockReturnValue({
      x: 360,
      y: 520,
      width: 80,
      height: 12,
      radial: {
        centerX: 400,
        centerY: 300,
        radius: 238,
        thickness: 12,
        startAngle: 1.4,
        centerAngle: 1.57,
        endAngle: 1.74,
      },
    });
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
        joystickDiagnosticsEnabled
        onJoystickDiagnosticSample={onJoystickDiagnosticSample}
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.width = 800;
    canvas.height = 600;
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    joystick.dispatchEvent(createPointerEvent(POINTER_DOWN_EVENT_NAME, 150, 300));

    expect(onJoystickDiagnosticSample).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "start",
        inputType: "pointer",
        accepted: true,
        clientPoint: { x: 150, y: 300 },
        joystick: expect.objectContaining({
          normalized: { x: 0.5, y: 1 },
          visual: { x: 0, y: 1 },
        }),
        canvas: expect.objectContaining({
          mappedClientPoint: { x: 220, y: 340 },
          mappedCanvasPoint: { x: 400, y: 600 },
        }),
        paddle: expect.objectContaining({
          radial: expect.objectContaining({ centerAngle: 1.57 }),
        }),
      }),
    );
  });

  it("registra diagnóstico rejeitado quando o arrasto sai do círculo visual", async () => {
    const onJoystickDiagnosticSample = jest.fn();
    mockGetPaddleDiagnosticSnapshot.mockReturnValue({
      x: 330,
      y: 500,
      width: 80,
      height: 12,
      radial: { centerAngle: 2.2 },
    });
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
        joystickDiagnosticsEnabled
        onJoystickDiagnosticSample={onJoystickDiagnosticSample}
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.width = 800;
    canvas.height = 600;
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    joystick.dispatchEvent(createPointerEvent(POINTER_DOWN_EVENT_NAME, 150, 300));
    mockMovePaddleDrag.mockClear();
    onJoystickDiagnosticSample.mockClear();
    joystick.dispatchEvent(createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 300));

    expect(mockMovePaddleDrag).not.toHaveBeenCalled();
    expect(onJoystickDiagnosticSample).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "move",
        inputType: "pointer",
        accepted: false,
        reason: "outside-joystick-circle",
        joystick: expect.objectContaining({
          normalized: { x: 0, y: 1 },
          visual: { x: -1, y: 1 },
        }),
        paddle: expect.objectContaining({
          radial: expect.objectContaining({ centerAngle: 2.2 }),
        }),
      }),
    );
  });

  it("usa touch como fallback absoluto do joystick espelhado", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const touchStartBottom = createTouchEvent(TOUCH_START_EVENT_NAME, 150, 300);
    const touchMoveOutside = createTouchEvent(TOUCH_MOVE_EVENT_NAME, 150, 180);
    const touchMoveTop = createTouchEvent(TOUCH_MOVE_EVENT_NAME, 150, 200);
    const touchEnd = createTouchEvent(TOUCH_END_EVENT_NAME, null);

    joystick.dispatchEvent(touchStartBottom);
    mockMovePaddleDrag.mockClear();
    joystick.dispatchEvent(touchMoveOutside);
    joystick.dispatchEvent(touchMoveTop);
    joystick.dispatchEvent(touchEnd);

    expect(touchStartBottom.defaultPrevented).toBe(true);
    expect(touchMoveOutside.defaultPrevented).toBe(true);
    expect(touchMoveTop.defaultPrevented).toBe(true);
    expect(touchEnd.defaultPrevented).toBe(true);
    expect(mockStartPaddleDrag).toHaveBeenCalledWith(220, 340);
    expect(mockMovePaddleDrag).toHaveBeenCalledWith(220, 40);
    expect(mockMovePaddleDrag).toHaveBeenCalledTimes(1);
    expect(mockEndPaddleDrag).toHaveBeenCalledTimes(1);
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
  });

  it("reseta joystick espelhado em pointerup e pointercancel", async () => {
    const { container, getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="joystick"
        joystickEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);
    joystick.setPointerCapture = jest.fn(() => {
      throw new Error("captura indisponível");
    });
    joystick.releasePointerCapture = jest.fn(() => {
      throw new Error("captura indisponível");
    });

    const pointerDown = createPointerEvent(POINTER_DOWN_EVENT_NAME, 200, 250);
    const pointerUp = createPointerEvent(POINTER_UP_EVENT_NAME, 200, 250);
    const pointerDownAgain = createPointerEvent(
      POINTER_DOWN_EVENT_NAME,
      100,
      250,
    );
    const pointerCancel = createPointerEvent(
      POINTER_CANCEL_EVENT_NAME,
      100,
      250,
    );

    joystick.dispatchEvent(pointerDown);
    joystick.dispatchEvent(pointerUp);
    joystick.dispatchEvent(pointerDownAgain);
    joystick.dispatchEvent(pointerCancel);

    expect(pointerDown.defaultPrevented).toBe(true);
    expect(pointerUp.defaultPrevented).toBe(true);
    expect(pointerDownAgain.defaultPrevented).toBe(true);
    expect(pointerCancel.defaultPrevented).toBe(true);
    expect(mockEndPaddleDrag).toHaveBeenCalledTimes(2);
    expect(joystick.style.getPropertyValue(TRACKBALL_X_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_Y_CSS_VAR)).toBe("0");
    expect(joystick.style.getPropertyValue(TRACKBALL_ACTIVE_CSS_VAR)).toBe("0");
  });

  it("controla interruptores esquerdo e direito com velocidade proporcional na torreta", async () => {
    const { getByTestId } = render(
      <Harness
        imageSetId={IMAGE_SET_RETRO_DEFAULT}
        gameMode="ball-turret"
        turretControlMode="dual-switch"
        switchesEnabled
      />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
      expect(mockSetTurretControlMode).toHaveBeenCalledWith("dual-switch");
    });

    const leftSwitch = getByTestId(LEFT_SWITCH_TEST_ID);
    const rightSwitch = getByTestId(RIGHT_SWITCH_TEST_ID);
    leftSwitch.getBoundingClientRect = jest.fn(
      () =>
        ({
          top: 100,
          height: 200,
        }) as DOMRect,
    );
    rightSwitch.getBoundingClientRect = jest.fn(
      () =>
        ({
          top: 100,
          height: 200,
        }) as DOMRect,
    );
    leftSwitch.setPointerCapture = jest.fn();
    leftSwitch.hasPointerCapture = jest.fn(() => true);
    leftSwitch.releasePointerCapture = jest.fn();
    mockSetDualSwitchDirection.mockClear();

    const pointerDownTop = createPointerEvent(POINTER_DOWN_EVENT_NAME, 100, 100);
    const pointerMoveMidUp = createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 150);
    const pointerMoveCenter = createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 200);
    const pointerMoveBottom = createPointerEvent(POINTER_MOVE_EVENT_NAME, 100, 300);
    const pointerUp = createPointerEvent(POINTER_UP_EVENT_NAME, 100, 300);

    leftSwitch.dispatchEvent(pointerDownTop);
    leftSwitch.dispatchEvent(pointerMoveMidUp);
    leftSwitch.dispatchEvent(pointerMoveCenter);
    leftSwitch.dispatchEvent(pointerMoveBottom);
    leftSwitch.dispatchEvent(pointerUp);

    expect(pointerDownTop.defaultPrevented).toBe(true);
    expect(pointerMoveMidUp.defaultPrevented).toBe(true);
    expect(pointerMoveCenter.defaultPrevented).toBe(true);
    expect(pointerMoveBottom.defaultPrevented).toBe(true);
    expect(pointerUp.defaultPrevented).toBe(true);
    expect(mockSetDualSwitchDirection).toHaveBeenNthCalledWith(1, "left", -1);
    expect(mockSetDualSwitchDirection).toHaveBeenNthCalledWith(2, "left", -0.5);
    expect(mockSetDualSwitchDirection).toHaveBeenNthCalledWith(3, "left", 0);
    expect(mockSetDualSwitchDirection).toHaveBeenNthCalledWith(4, "left", 1);
    expect(mockSetDualSwitchDirection).toHaveBeenNthCalledWith(5, "left", 0);
    expect(leftSwitch.style.getPropertyValue(SWITCH_AXIS_CSS_VAR)).toBe("0");
    expect(leftSwitch.dataset.switchDirection).toBe("neutral");

    mockSetDualSwitchDirection.mockClear();
    const keyDown = createKeyboardEvent("keydown", "ArrowDown");
    const keyUp = createKeyboardEvent("keyup", "ArrowDown");

    rightSwitch.dispatchEvent(keyDown);
    rightSwitch.dispatchEvent(keyUp);

    expect(keyDown.defaultPrevented).toBe(true);
    expect(keyUp.defaultPrevented).toBe(true);
    expect(mockSetDualSwitchDirection).toHaveBeenNthCalledWith(1, "right", 1);
    expect(mockSetDualSwitchDirection).toHaveBeenNthCalledWith(2, "right", 0);
    expect(rightSwitch.style.getPropertyValue(SWITCH_AXIS_CSS_VAR)).toBe("0");
  });

  it("não instala controle absoluto do joystick fora do modo torreta", async () => {
    const { container, getByTestId } = render(
      <Harness imageSetId={IMAGE_SET_RETRO_DEFAULT} joystickEnabled />,
    );

    await waitFor(() => {
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    const joystick = getByTestId(JOYSTICK_TEST_ID);
    canvas.getBoundingClientRect = jest.fn(() => CANVAS_RECT);
    joystick.getBoundingClientRect = jest.fn(() => JOYSTICK_RECT);

    const pointerDown = createPointerEvent(POINTER_DOWN_EVENT_NAME, 200, 250);
    joystick.dispatchEvent(pointerDown);

    expect(pointerDown.defaultPrevented).toBe(false);
    expect(mockStartPaddleDrag).not.toHaveBeenCalled();
    expect(mockMovePaddleDrag).not.toHaveBeenCalled();
    expect(mockEndPaddleDrag).not.toHaveBeenCalled();
  });
});
