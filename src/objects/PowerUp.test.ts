// src/objects/PowerUp.test.ts
import { POWER_UP_DEFINITIONS } from '../constants/powerUps';
import { calculatePowerUpSize } from '../constants/powerUps';
import { AssetLoader } from '../utils/assetLoader';
import { PowerUp } from './PowerUp';

jest.mock('../utils/assetLoader', () => ({
  AssetLoader: {
    getOrLoadImage: jest.fn(),
  },
}));

const CANVAS_IMAGE_SOURCE = {} as CanvasImageSource;
const POWER_UP_CENTER = 40;
const POWER_UP_TOP = 40;
const EXPECTED_ICON_LEFT = 24;
const EXPECTED_ICON_TOP = 24;
const EXPECTED_ICON_SIZE = 32;
const TEST_POWER_UP_SIZE = 32;
const TEST_BRICK_WIDTH = 42;
const TEST_DESKTOP_BRICK_WIDTH = 120;
const EXPECTED_MOBILE_POWER_UP_SIZE = 29.4;
const EXPECTED_DESKTOP_POWER_UP_SIZE = 56;
const TEST_POWER_UP_BOUNDARY = 25;

function createContext() {
  return {
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    fillText: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    stroke: jest.fn(),
    arc: jest.fn(),
    set fillStyle(_value: string) {},
    set font(_value: string) {},
    set textAlign(_value: CanvasTextAlign) {},
    set textBaseline(_value: CanvasTextBaseline) {},
  } as unknown as CanvasRenderingContext2D & {
    drawImage: jest.Mock;
    fillText: jest.Mock;
  };
}

describe('PowerUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(Object.keys(POWER_UP_DEFINITIONS) as Array<keyof typeof POWER_UP_DEFINITIONS>)(
    'desenha SVG local para %s quando asset está carregado',
    (powerUpType) => {
      jest.mocked(AssetLoader.getOrLoadImage).mockReturnValue(CANVAS_IMAGE_SOURCE as HTMLImageElement);
      const context = createContext();
      const powerUp = new PowerUp(
        POWER_UP_CENTER,
        POWER_UP_TOP,
        powerUpType,
        TEST_POWER_UP_SIZE,
      );

      powerUp.draw(context);

      expect(AssetLoader.getOrLoadImage).toHaveBeenCalledWith(
        POWER_UP_DEFINITIONS[powerUpType].iconPath,
      );
      expect(context.drawImage).toHaveBeenCalledWith(
        CANVAS_IMAGE_SOURCE,
        EXPECTED_ICON_LEFT,
        EXPECTED_ICON_TOP,
        EXPECTED_ICON_SIZE,
        EXPECTED_ICON_SIZE,
      );
      expect(context.fillText).not.toHaveBeenCalled();
    },
  );

  it('mantém fallback sem SVG quando imagem não está no cache', () => {
    jest.mocked(AssetLoader.getOrLoadImage).mockReturnValue(null);
    const context = createContext();
    const powerUp = new PowerUp(
      POWER_UP_CENTER,
      POWER_UP_TOP,
      'multiball',
      TEST_POWER_UP_SIZE,
    );

    powerUp.draw(context);

    expect(context.drawImage).not.toHaveBeenCalled();
    expect(context.fillText).toHaveBeenCalledWith('M', POWER_UP_CENTER, POWER_UP_TOP + 1);
  });

  it('calcula tamanho proporcional ao bloco com limite seguro', () => {
    expect(
      calculatePowerUpSize({ brickWidth: TEST_BRICK_WIDTH } as Parameters<
        typeof calculatePowerUpSize
      >[0]),
    ).toBeCloseTo(EXPECTED_MOBILE_POWER_UP_SIZE);
    expect(
      calculatePowerUpSize({ brickWidth: TEST_DESKTOP_BRICK_WIDTH } as Parameters<
        typeof calculatePowerUpSize
      >[0]),
    ).toBe(EXPECTED_DESKTOP_POWER_UP_SIZE);
  });

  it('usa o tamanho dinâmico para colisão e saída da tela', () => {
    const powerUp = new PowerUp(
      POWER_UP_CENTER,
      POWER_UP_TOP,
      'multiball',
      TEST_POWER_UP_SIZE,
    );

    expect(
      powerUp.intersects({
        x: POWER_UP_CENTER + TEST_POWER_UP_SIZE / 2,
        y: POWER_UP_TOP + TEST_POWER_UP_SIZE / 2,
        width: 8,
        height: 8,
      }),
    ).toBe(true);

    expect(
      powerUp.intersects({
        x: POWER_UP_CENTER + TEST_POWER_UP_SIZE / 2 + 1,
        y: POWER_UP_TOP + TEST_POWER_UP_SIZE / 2 + 1,
        width: 8,
        height: 8,
      }),
    ).toBe(false);

    expect(powerUp.isOutOfBounds(TEST_POWER_UP_BOUNDARY)).toBe(false);
    powerUp.update();
    expect(powerUp.isOutOfBounds(TEST_POWER_UP_BOUNDARY)).toBe(true);
  });

  it('move power-up radial do centro até a borda da torreta', () => {
    const powerUp = new PowerUp(
      100,
      100,
      'multiball',
      20,
      undefined,
      {
        kind: 'radial',
        centerX: 100,
        centerY: 100,
        directionX: 1,
        directionY: 0,
        boundaryRadius: 45,
        speed: 12,
      },
    );

    expect(powerUp.getPosition()).toEqual({ x: 100, y: 100 });
    expect(powerUp.hasReachedRadialBoundary()).toBe(false);

    powerUp.update();
    expect(powerUp.getPosition()).toEqual({ x: 112, y: 100 });
    expect(powerUp.hasReachedRadialBoundary()).toBe(false);

    powerUp.update();
    powerUp.update();
    expect(powerUp.getPosition()).toEqual({ x: 136, y: 100 });
    expect(powerUp.hasReachedRadialBoundary()).toBe(true);
  });
});
