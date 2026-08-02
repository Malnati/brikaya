// src/constants/dashboardElements.ts
import {
  sprBallPlayerDefault,
  sprComponentBasicBlueNormal,
  sprComponentBasicGreenNormal,
  sprComponentBasicPurpleNormal,
  sprComponentBasicRedNormal,
  sprComponentBasicYellowNormal,
  sprComponentMetalSteelDentedOne,
  sprComponentMetalSteelDentedTwo,
  sprComponentMetalSteelNormal,
  sprPaddlePlayerDefault,
  sprPowerupLaserFan,
  sprPowerupMultiballOrb,
  sprPowerupSlowBall,
  sprPowerupWidePaddle,
} from "./visualAssets";

export const DASHBOARD_ELEMENT_CATEGORY_BALL = "Bola";
export const DASHBOARD_ELEMENT_CATEGORY_PADDLE = "Raquete";
export const DASHBOARD_ELEMENT_CATEGORY_COMPONENT = "Componente eletrônico";
export const DASHBOARD_ELEMENT_CATEGORY_POWER_UP = "Power-up";
export const DASHBOARD_ELEMENT_CATEGORY_CONTROL = "Controle";

export type DashboardElementCategory =
  | typeof DASHBOARD_ELEMENT_CATEGORY_BALL
  | typeof DASHBOARD_ELEMENT_CATEGORY_PADDLE
  | typeof DASHBOARD_ELEMENT_CATEGORY_COMPONENT
  | typeof DASHBOARD_ELEMENT_CATEGORY_POWER_UP
  | typeof DASHBOARD_ELEMENT_CATEGORY_CONTROL;

export type DashboardElementKind = "sprite" | "turret-control";

export interface DashboardElementDescriptor {
  id: string;
  category: DashboardElementCategory;
  title: string;
  description: string;
  kind: DashboardElementKind;
  spritePath?: string;
}

export const DASHBOARD_2D_ELEMENTS: readonly DashboardElementDescriptor[] = [
  {
    id: "ball",
    category: DASHBOARD_ELEMENT_CATEGORY_BALL,
    title: "Bolinha",
    description: "Esfera principal que percorre o tabuleiro.",
    kind: "sprite",
    spritePath: sprBallPlayerDefault,
  },
  {
    id: "paddle",
    category: DASHBOARD_ELEMENT_CATEGORY_PADDLE,
    title: "Raquete",
    description: "Raquete padrão controlada pelo jogador.",
    kind: "sprite",
    spritePath: sprPaddlePlayerDefault,
  },
  {
    id: "component-red",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Indutor quadrado",
    description: "Componente eletrônico vermelho, estado normal.",
    kind: "sprite",
    spritePath: sprComponentBasicRedNormal,
  },
  {
    id: "component-blue",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Transistor",
    description: "Componente eletrônico azul, estado normal.",
    kind: "sprite",
    spritePath: sprComponentBasicBlueNormal,
  },
  {
    id: "component-green",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Chip integrado",
    description: "Componente eletrônico verde, estado normal.",
    kind: "sprite",
    spritePath: sprComponentBasicGreenNormal,
  },
  {
    id: "component-yellow",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Diodo LED",
    description: "Componente eletrônico amarelo, estado normal.",
    kind: "sprite",
    spritePath: sprComponentBasicYellowNormal,
  },
  {
    id: "component-purple",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Capacitor",
    description: "Componente eletrônico roxo, estado normal.",
    kind: "sprite",
    spritePath: sprComponentBasicPurpleNormal,
  },
  {
    id: "component-metal-steel",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Módulo blindado resistente",
    description: "Componente metálico intacto.",
    kind: "sprite",
    spritePath: sprComponentMetalSteelNormal,
  },
  {
    id: "component-metal-steel-dented-one",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Módulo blindado danificado",
    description: "Componente metálico após o primeiro impacto.",
    kind: "sprite",
    spritePath: sprComponentMetalSteelDentedOne,
  },
  {
    id: "component-metal-steel-dented-two",
    category: DASHBOARD_ELEMENT_CATEGORY_COMPONENT,
    title: "Módulo blindado crítico",
    description: "Componente metálico prestes a ser destruído.",
    kind: "sprite",
    spritePath: sprComponentMetalSteelDentedTwo,
  },
  {
    id: "powerup-multiball",
    category: DASHBOARD_ELEMENT_CATEGORY_POWER_UP,
    title: "Multiball",
    description: "Power-up que multiplica a bolinha em jogo.",
    kind: "sprite",
    spritePath: sprPowerupMultiballOrb,
  },
  {
    id: "powerup-wide-paddle",
    category: DASHBOARD_ELEMENT_CATEGORY_POWER_UP,
    title: "Raquete ampla",
    description: "Power-up que aumenta a raquete do jogador.",
    kind: "sprite",
    spritePath: sprPowerupWidePaddle,
  },
  {
    id: "powerup-slow-ball",
    category: DASHBOARD_ELEMENT_CATEGORY_POWER_UP,
    title: "Bola lenta",
    description: "Power-up que reduz a velocidade da bolinha.",
    kind: "sprite",
    spritePath: sprPowerupSlowBall,
  },
  {
    id: "powerup-laser-fan",
    category: DASHBOARD_ELEMENT_CATEGORY_POWER_UP,
    title: "Laser em leque",
    description: "Power-up que dispara um leque de lasers.",
    kind: "sprite",
    spritePath: sprPowerupLaserFan,
  },
  {
    id: "turret-control",
    category: DASHBOARD_ELEMENT_CATEGORY_CONTROL,
    title: "Controle da Torreta",
    description:
      "Trampolim radial controlado pelo jogador no modo Torreta, renderizado pelo motor de jogo.",
    kind: "turret-control",
  },
] as const;
