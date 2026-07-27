#!/usr/bin/env python3
"""PreToolUse (Bash) gate — força a rota git-admin no Brikaya.

Porta de `.cursor/hooks/brikaya-git-route-gate.mjs` para o schema de hooks do
Claude Code. Nega comandos `git push` / `gh pr` que não passem pelos wrappers
`codex-git-admin` / `codex-gh-admin`. Falha aberta em qualquer erro para nunca
travar a sessão.
"""

from __future__ import annotations

import json
import re
import sys

CODEX_GIT_ADMIN = "/Users/mal/.codex/bin/codex-git-admin"
CODEX_GH_ADMIN = "/Users/mal/.codex/bin/codex-gh-admin"
BLOCKED_GIT_PUSH = re.compile(r"(^|\s)git\s+push\b")
BLOCKED_GH_PR = re.compile(r"(^|\s)gh\s+pr\b")


def deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }
        )
    )


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        return 0
    if not isinstance(payload, dict):
        return 0

    tool_input = payload.get("tool_input")
    tool_input = tool_input if isinstance(tool_input, dict) else {}
    command = tool_input.get("command") or tool_input.get("cmd") or ""
    if not isinstance(command, str) or not command.strip():
        return 0

    if CODEX_GIT_ADMIN in command or CODEX_GH_ADMIN in command:
        return 0

    if BLOCKED_GIT_PUSH.search(command):
        deny(f"Use `{CODEX_GIT_ADMIN} push` em vez de `git push` no Brikaya.")
        return 0

    if BLOCKED_GH_PR.search(command):
        deny(f"Use `{CODEX_GH_ADMIN} pr` em vez de `gh pr` no Brikaya.")
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
