// src/objects/PowerUp.test.ts
import { POWER_UP_DEFINITIONS } from '../constants/powerUps';
import { AssetLoader } from '../utils/assetLoader';
import { PowerUp } from './PowerUp';

jest.mock('../utils/assetLoader', () => ({
  AssetLoader: {
    getImage: jest.fn(),
  },
}));

const CANVAS_IMAGE_SOURCE = {} as CanvasImageSource;
const POWER_UP_CENTER = 40;
const POWER_UP_TOP = 40;
const EXPECTED_ICON_LEFT = 31;
const EXPECTED_ICON_TOP = 31;
const EXPECTED_ICON_SIZE = 18;

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
      jest.mocked(AssetLoader.getImage).mockReturnValue(CANVAS_IMAGE_SOURCE as HTMLImageElement);
      const context = createContext();
      const powerUp = new PowerUp(POWER_UP_CENTER, POWER_UP_TOP, powerUpType);

      powerUp.draw(context);

      expect(AssetLoader.getImage).toHaveBeenCalledWith(
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
    jest.mocked(AssetLoader.getImage).mockReturnValue(null);
    const context = createContext();
    const powerUp = new PowerUp(POWER_UP_CENTER, POWER_UP_TOP, 'multiball');

    powerUp.draw(context);

    expect(context.drawImage).not.toHaveBeenCalled();
    expect(context.fillText).toHaveBeenCalledWith('M', POWER_UP_CENTER, POWER_UP_TOP + 1);
  });
});
