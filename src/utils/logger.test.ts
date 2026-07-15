// src/utils/logger.test.ts
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("logger", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) =>
      key === "brikaya:diagnostics" ? "1" : null,
    );
  });

  it("prefixa emits com BUILD_VERSION_LABEL quando diagnostics está ligado", async () => {
    const { LOG, WARN, ERROR } = await import("./logger");
    const { BUILD_VERSION_LABEL } = await import("../constants/buildVersion");
    const prefix = `[${BUILD_VERSION_LABEL}]`;

    LOG("mensagem de teste");
    WARN("aviso");
    ERROR("erro");

    expect(console.log).toHaveBeenCalledWith(`${prefix} mensagem de teste`);
    expect(console.warn).toHaveBeenCalledWith(`${prefix} aviso`);
    expect(console.error).toHaveBeenCalledWith(`${prefix} erro`);
  });
});
