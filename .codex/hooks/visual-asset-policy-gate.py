#!/usr/bin/env python3
"""PostToolUse (Write|Edit|MultiEdit) gate — política visual SVG-first do Brikaya.

Porta de `.cursor/hooks/visual-asset-policy-gate.mjs` para o schema de hooks do
Claude Code. Quando o arquivo editado casa com um caminho visual monitorado,
roda `npm run test:visual-asset-policy` e bloqueia (`decision: block`) se a
validação falhar. Falha aberta em qualquer erro de adaptador.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys

VISUAL_PATH_PATTERN = re.compile(
    r"(?:^|/)(public/assets/visual/|src/constants/visualAssets\.ts|docs/assets/visual-runtime/)"
)


def matches_visual_path(file_path: str) -> bool:
    if not isinstance(file_path, str) or not file_path:
        return False
    return bool(VISUAL_PATH_PATTERN.search(file_path.replace("\\", "/")))


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        return 0
    if not isinstance(payload, dict):
        return 0

    tool_input = payload.get("tool_input")
    tool_input = tool_input if isinstance(tool_input, dict) else {}
    file_path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not matches_visual_path(str(file_path)):
        return 0

    cwd = payload.get("cwd") or os.getcwd()
    try:
        result = subprocess.run(
            ["npm", "run", "test:visual-asset-policy"],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=110,
        )
    except Exception:  # fail open on launch errors
        return 0

    if result.returncode == 0:
        return 0

    reason = (
        (result.stderr or "").strip()
        or (result.stdout or "").strip()
        or "Falha na validação da política visual SVG-first."
    )
    print(json.dumps({"decision": "block", "reason": reason}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
