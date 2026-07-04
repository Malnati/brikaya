// src/components/GameCinematicOverlay.tsx
import { useEffect, useState } from "react";

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
import { useI18n } from "../i18n";

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
const MEDIA_CLASS_NAME = `${BASE_CLASS_NAME}__media`;
const STAGE_CLASS_NAME = `${BASE_CLASS_NAME}__stage`;
const CONTENT_CLASS_NAME = `${BASE_CLASS_NAME}__content`;
const RIP_COMPOSITION_CLASS_NAME = `${BASE_CLASS_NAME}__composition`;
const MEDIA_ALT = "";
const MEDIA_LOADING = "lazy";
const MEDIA_DECODING = "async";
const STAGE_TEST_ID = "game-cinematic-stage";
const CONTENT_TEST_ID = "game-cinematic-content";
const RIP_COMPOSITION_TEST_ID = "game-cinematic-rip-composition";
const RIP_VIEWPORT_BOTTOM_INSET_PARAM = "qaViewportBottomInset";
const RIP_BROWSER_CHROME_SAFE_BOTTOM_PX = 104;
const RIP_MIN_VISIBLE_VIEWPORT_SIZE_PX = 240;
const RIP_VIEWPORT_LEFT_PROPERTY = "--game-cinematic-rip-visible-left";
const RIP_VIEWPORT_TOP_PROPERTY = "--game-cinematic-rip-visible-top";
const RIP_VIEWPORT_WIDTH_PROPERTY = "--game-cinematic-rip-visible-width";
const RIP_VIEWPORT_HEIGHT_PROPERTY = "--game-cinematic-rip-visible-height";
const CINEMATIC_MEDIA_ROLES = {
  "countdown-circle": GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay,
  "countdown-spark": GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay,
  "level-up-twirl": GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay,
  "level-up-star": GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay,
  "rip-smoke": GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke,
} as const satisfies Record<string, GameVisualAssetRole>;

type RipViewportStyle = CSSProperties & Record<string, string>;

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

function positiveNumber(value: string | null): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function isStandaloneDisplayMode(): boolean {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    standaloneNavigator.standalone === true
  );
}

function shouldReserveMobileBrowserChrome(): boolean {
  return (
    window.matchMedia?.("(pointer: coarse) and (max-width: 600px)").matches ===
      true && !isStandaloneDisplayMode()
  );
}

function measuredRipViewportStyle(): RipViewportStyle {
  const visualViewport = window.visualViewport;
  const left = visualViewport?.offsetLeft || 0;
  const top = visualViewport?.offsetTop || 0;
  const width = visualViewport?.width || window.innerWidth;
  const height = visualViewport?.height || window.innerHeight;
  const detectedBottomInset = Math.max(0, window.innerHeight - (top + height));
  const requestedBottomInset = positiveNumber(
    new URLSearchParams(window.location.search).get(
      RIP_VIEWPORT_BOTTOM_INSET_PARAM,
    ),
  );
  const fallbackBottomInset =
    detectedBottomInset > 0 || requestedBottomInset > 0
      ? 0
      : shouldReserveMobileBrowserChrome()
        ? RIP_BROWSER_CHROME_SAFE_BOTTOM_PX
        : 0;
  const bottomInset = Math.max(requestedBottomInset, fallbackBottomInset);
  const visibleHeight = Math.max(
    RIP_MIN_VISIBLE_VIEWPORT_SIZE_PX,
    height - bottomInset,
  );

  return {
    [RIP_VIEWPORT_LEFT_PROPERTY]: `${left}px`,
    [RIP_VIEWPORT_TOP_PROPERTY]: `${top}px`,
    [RIP_VIEWPORT_WIDTH_PROPERTY]: `${width}px`,
    [RIP_VIEWPORT_HEIGHT_PROPERTY]: `${visibleHeight}px`,
  };
}

function useRipViewportStyle(enabled: boolean): RipViewportStyle | undefined {
  const [style, setStyle] = useState<RipViewportStyle | undefined>(undefined);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setStyle(undefined);
      return undefined;
    }

    const updateStyle = () => setStyle(measuredRipViewportStyle());

    updateStyle();
    window.addEventListener("resize", updateStyle);
    window.visualViewport?.addEventListener("resize", updateStyle);
    window.visualViewport?.addEventListener("scroll", updateStyle);

    return () => {
      window.removeEventListener("resize", updateStyle);
      window.visualViewport?.removeEventListener("resize", updateStyle);
      window.visualViewport?.removeEventListener("scroll", updateStyle);
    };
  }, [enabled]);

  return enabled ? style : undefined;
}

function stageStyle(
  boardRect: GameCinematicBoardRect | null | undefined,
  customStyle?: CSSProperties,
): CSSProperties | undefined {
  if (!boardRect) return customStyle;

  return {
    ...customStyle,
    left: boardRect.x,
    top: boardRect.y,
    width: boardRect.width,
    height: boardRect.height,
  };
}

function renderStage(
  children: ReactNode,
  boardRect: GameCinematicBoardRect | null | undefined,
  customStyle?: CSSProperties,
) {
  return (
    <div
      className={STAGE_CLASS_NAME}
      data-testid={STAGE_TEST_ID}
      style={stageStyle(boardRect, customStyle)}
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

function renderRipComposition(children: ReactNode) {
  return (
    <div
      className={RIP_COMPOSITION_CLASS_NAME}
      data-testid={RIP_COMPOSITION_TEST_ID}
    >
      {children}
    </div>
  );
}

function overlayProps(
  state: Exclude<GameCinematicOverlayState, null>,
  labels: {
    countdown: string;
    levelUp: string;
    rip: string;
  },
): OverlayAttributes {
  if (state.type === "countdown") {
    return {
      className: COUNTDOWN_CLASS_NAME,
      "aria-label": labels.countdown,
      "data-cinematic-type": state.type,
      "data-testid": TEST_ID,
    };
  }

  if (state.type === "levelUp") {
    return {
      className: LEVEL_UP_CLASS_NAME,
      "aria-label": labels.levelUp,
      "data-cinematic-type": state.type,
      "data-testid": LEVEL_UP_TEST_ID,
    };
  }

  return {
    className: RIP_CLASS_NAME,
    "aria-label": labels.rip,
    "data-cinematic-type": state.type,
    "data-testid": TEST_ID,
  };
}

export function GameCinematicOverlay({
  state,
  imageSetId = IMAGE_SET_RETRO_DEFAULT,
  boardRect = null,
}: GameCinematicOverlayProps) {
  const { t } = useI18n();
  const ripViewportStyle = useRipViewportStyle(state?.type === "rip");
  const labels = {
    countdown: t("cinematic.countdownAria"),
    levelUp: t("cinematic.levelUpAria"),
    rip: t("cinematic.gameOverAria"),
  };

  if (!state) return null;

  if (state.type === "countdown") {
    return (
      <div {...overlayProps(state, labels)} role="status" aria-live="assertive">
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
      <div {...overlayProps(state, labels)} role="status" aria-live="polite">
        {renderStage(
          <>
            {renderMediaLayers(state, imageSetId)}
            <span className={`${BASE_CLASS_NAME}__eyebrow`}>
              {t("cinematic.levelUpEyebrow")}
            </span>
            <span className={`${BASE_CLASS_NAME}__title`}>
              {t("cinematic.levelPrefix")} {state.nextLevel}
            </span>
            <span className={`${BASE_CLASS_NAME}__detail`}>
              {t("cinematic.speedPrefix")} {state.speedLabel}
            </span>
          </>,
          boardRect,
        )}
      </div>
    );
  }

  return (
    <div {...overlayProps(state, labels)} role="status" aria-live="assertive">
      {renderStage(
        renderRipComposition(
          <>
            {renderMediaLayers(state, imageSetId)}
            {renderContent(
              <>
                <span className={`${BASE_CLASS_NAME}__title`}>
                  {t("cinematic.ripTitle")}
                </span>
                <span className={`${BASE_CLASS_NAME}__detail`}>
                  {t("cinematic.ripHint")}
                </span>
              </>,
            )}
          </>,
        ),
        null,
        ripViewportStyle,
      )}
    </div>
  );
}
