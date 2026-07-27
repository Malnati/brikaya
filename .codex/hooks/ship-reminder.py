#!/usr/bin/env python3
"""Stop hook — lembrete de ship do Brikaya (não bloqueante).

Porta de `.cursor/hooks/brikaya-ship-reminder.mjs` para o schema de hooks do
Claude Code. Se houver mudanças não commitadas ao encerrar o turno, mostra um
aviso (`systemMessage`) lembrando de rodar `npm run brikaya:ship`. Nunca bloqueia
o Stop nem força continuação (decisão do usuário: "lembrar + rodar deliberado").
"""

from __future__ import annotations

import json
import os
import subprocess
import sys


def has_uncommitted_changes(cwd: str) -> bool:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except Exception:
        return False
    return bool((result.stdout or "").strip())


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        return 0
    if not isinstance(payload, dict):
        return 0

    cwd = payload.get("cwd") or os.getcwd()
    if not has_uncommitted_changes(cwd):
        return 0

    print(
        json.dumps(
            {
                "systemMessage": (
                    "Há alterações locais não enviadas. Se o prompt foi atendido, "
                    "feche-o (comando /ship): preencha os resultados em .tags/vN.md e "
                    ".releases/vN.md, rode `npm run brikaya:ship` e `npm run brikaya:merge-pr` "
                    "sem pedir permissão — o deploy cria tag vN e release com esses resultados."
                )
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
