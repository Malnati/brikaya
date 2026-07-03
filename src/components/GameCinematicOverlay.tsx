// src/components/GameCinematicOverlay.tsx
import { CINEMATIC_MEDIA_LAYERS } from "../constants/cinematicMedia";
import {
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from "../constants/appearance";
import {
  GAME_VISUAL_ASSET_ROLES,
  resolveGameVisualAssetPath,
  type GameVisualAssetRole,
} from "../utils/visualAssetResolver";

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

export type GameCinematicOverlayState =
  | {
      type: "countdown";
      value: string;
    }
  | {
      type: "levelUp";
      nextLevel: number;
      speedLabel: string;
    }
  | {
      type: "rip";
    }
  | null;

interface GameCinematicOverlayProps {
  state: GameCinematicOverlayState;
  imageSetId?: ImageSetId;
  boardRect?: GameCinematicBoardRect | null;
}

export interface GameCinematicBoardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type OverlayAttributes = ComponentPropsWithoutRef<"div"> & {
  "data-cinematic-type": string;
  "data-testid": string;
};

const BASE_CLASS_NAME = "game-cinematic-overlay";
const COUNTDOWN_CLASS_NAME =
  "game-cinematic-overlay game-cinematic-overlay--countdown";
const LEVEL_UP_CLASS_NAME =
  "game-cinematic-overlay game-cinematic-overlay--level-up";
const RIP_CLASS_NAME = "game-cinematic-overlay game-cinematic-overlay--rip";
const TEST_ID = "game-cinematic-overlay";
const LEVEL_UP_TEST_ID = "level-toast";
const COUNTDOWN_ARIA_LABEL = "Contagem inicial";
const LEVEL_UP_ARIA_LABEL = "Subida de fase";
const RIP_ARIA_LABEL = "Fim de jogo";
const LEVEL_UP_EYEBROW = "Subindo de nível";
const LEVEL_UP_TITLE_PREFIX = "Fase";
const LEVEL_UP_SPEED_PREFIX = "Velocidade";
const RIP_TITLE = "RIP";
const RIP_HINT = "Recomeçando...";
const MEDIA_CLASS_NAME = `${BASE_CLASS_NAME}__media`;
const STAGE_CLASS_NAME = `${BASE_CLASS_NAME}__stage`;
const CONTENT_CLASS_NAME = `${BASE_CLASS_NAME}__content`;
const MEDIA_ALT = "";
const MEDIA_LOADING = "lazy";
const MEDIA_DECODING = "async";
const STAGE_TEST_ID = "game-cinematic-stage";
const CONTENT_TEST_ID = "game-cinematic-content";
const CINEMATIC_MEDIA_ROLES = {
  "countdown-circle": GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay,
  "countdown-spark": GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay,
  "level-up-twirl": GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay,
  "level-up-star": GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay,
  "rip-smoke": GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke,
} as const satisfies Record<string, GameVisualAssetRole>;

function resolveCinematicMediaPath(
  media: (typeof CINEMATIC_MEDIA_LAYERS)[keyof typeof CINEMATIC_MEDIA_LAYERS][number],
  imageSetId: ImageSetId,
) {
  const role = CINEMATIC_MEDIA_ROLES[media.id];
  return role ? resolveGameVisualAssetPath(imageSetId, role) : media.src;
}

function renderMediaLayers(
  state: Exclude<GameCinematicOverlayState, null>,
  imageSetId: ImageSetId,
) {
  return CINEMATIC_MEDIA_LAYERS[state.type].map((media) => {
    const src = resolveCinematicMediaPath(media, imageSetId);

    return (
      <img
        key={media.id}
        className={`${MEDIA_CLASS_NAME} ${MEDIA_CLASS_NAME}--${media.id}`}
        data-cinematic-media={media.id}
        src={src}
        alt={MEDIA_ALT}
        loading={MEDIA_LOADING}
        decoding={MEDIA_DECODING}
        aria-hidden="true"
        draggable={false}
      />
    );
  });
}

function stageStyle(
  boardRect: GameCinematicBoardRect | null | undefined,
): CSSProperties | undefined {
  if (!boardRect) return undefined;

  return {
    left: boardRect.x,
    top: boardRect.y,
    width: boardRect.width,
    height: boardRect.height,
  };
}

function renderStage(
  children: ReactNode,
  boardRect: GameCinematicBoardRect | null | undefined,
) {
  return (
    <div
      className={STAGE_CLASS_NAME}
      data-testid={STAGE_TEST_ID}
      style={stageStyle(boardRect)}
    >
      {children}
    </div>
  );
}

function renderContent(children: ReactNode) {
  return (
    <div className={CONTENT_CLASS_NAME} data-testid={CONTENT_TEST_ID}>
      {children}
    </div>
  );
}

function overlayProps(
  state: Exclude<GameCinematicOverlayState, null>,
): OverlayAttributes {
  if (state.type === "countdown") {
    return {
      className: COUNTDOWN_CLASS_NAME,
      "aria-label": COUNTDOWN_ARIA_LABEL,
      "data-cinematic-type": state.type,
      "data-testid": TEST_ID,
    };
  }

  if (state.type === "levelUp") {
    return {
      className: LEVEL_UP_CLASS_NAME,
      "aria-label": LEVEL_UP_ARIA_LABEL,
      "data-cinematic-type": state.type,
      "data-testid": LEVEL_UP_TEST_ID,
    };
  }

  return {
    className: RIP_CLASS_NAME,
    "aria-label": RIP_ARIA_LABEL,
    "data-cinematic-type": state.type,
    "data-testid": TEST_ID,
  };
}

export function GameCinematicOverlay({
  state,
  imageSetId = IMAGE_SET_RETRO_DEFAULT,
  boardRect = null,
}: GameCinematicOverlayProps) {
  if (!state) return null;

  if (state.type === "countdown") {
    return (
      <div {...overlayProps(state)} role="status" aria-live="assertive">
        {renderStage(
          <>
            {renderMediaLayers(state, imageSetId)}
            <span className={`${BASE_CLASS_NAME}__count`}>{state.value}</span>
          </>,
          boardRect,
        )}
      </div>
    );
  }

  if (state.type === "levelUp") {
    return (
      <div {...overlayProps(state)} role="status" aria-live="polite">
        {renderStage(
          <>
            {renderMediaLayers(state, imageSetId)}
            <span className={`${BASE_CLASS_NAME}__eyebrow`}>
              {LEVEL_UP_EYEBROW}
            </span>
            <span className={`${BASE_CLASS_NAME}__title`}>
              {LEVEL_UP_TITLE_PREFIX} {state.nextLevel}
            </span>
            <span className={`${BASE_CLASS_NAME}__detail`}>
              {LEVEL_UP_SPEED_PREFIX} {state.speedLabel}
            </span>
          </>,
          boardRect,
        )}
      </div>
    );
  }

  return (
    <div {...overlayProps(state)} role="status" aria-live="assertive">
      {renderStage(
        <>
          {renderMediaLayers(state, imageSetId)}
          {renderContent(
            <>
              <span className={`${BASE_CLASS_NAME}__title`}>{RIP_TITLE}</span>
              <span className={`${BASE_CLASS_NAME}__detail`}>{RIP_HINT}</span>
            </>,
          )}
        </>,
        null,
      )}
    </div>
  );
}
