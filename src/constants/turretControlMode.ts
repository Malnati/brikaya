export const TURRET_CONTROL_MODE_JOYSTICK = "joystick";
export const TURRET_CONTROL_MODE_DUAL_SWITCH = "dual-switch";
export const DEFAULT_TURRET_CONTROL_MODE = TURRET_CONTROL_MODE_DUAL_SWITCH;

export type TurretControlMode =
  | typeof TURRET_CONTROL_MODE_JOYSTICK
  | typeof TURRET_CONTROL_MODE_DUAL_SWITCH;

export type TurretSwitchSide = "left" | "right";
export type TurretSwitchDirection = -1 | 0 | 1;
