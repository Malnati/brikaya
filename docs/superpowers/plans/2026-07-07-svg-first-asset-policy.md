# SVG-first Asset Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce the Brikaya visual asset policy: SVG-first authoring, SVG runtime while simple, governed PNG/WebP atlas exceptions, and no AVIF sprites.

**Architecture:** Keep the policy repo-local in AGENTS/Cursor/docs and enforce it with a Node validator that produces a JSON receipt. Existing SVG and semantic-name validators remain authoritative but delegate governed raster exceptions to the new policy file.

**Tech Stack:** Node.js v23.x, npm 10.x, TypeScript/React/Vite, shell Git hooks.

## Global Constraints

- Do not alter `/Users/mal/.codex/AGENTS.md`.
- Do not create raster art in this task.
- SVG remains the default source and runtime format for simple sprites, UI, and VFX.
- PNG/WebP atlas files require documented exceptions.
- AVIF is prohibited for sprites and atlases; AVIF is allowed only for cinematic/background assets with evidence.

---

## Tasks

- [ ] Update `AGENTS.md`, `.cursor/rules/all.mdc`, and `docs/assets/visual-runtime/**` with the policy.
- [ ] Add RED tests for the visual asset policy guard.
- [ ] Implement `scripts/validate-visual-asset-policy.mjs` and report output.
- [ ] Integrate the guard into `package.json`, pre-commit, SVG validator, and semantic-name validator.
- [ ] Run required validations and commit the result.
