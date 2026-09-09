# Agent Guidelines — Suraj Yadav AI Portfolio

This document defines the core architecture, agent skills, coding standards, and operational guidelines for AI agents working on this codebase.

---

## 1. Project Overview & Architecture
- **Application**: Android Material Design 3 AI Agent and interactive portfolio for Suraj Yadav (Full-Stack Developer, 7+ Yrs experience).
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion animations, Material 3 design philosophy.
- **Backend**: Express 4 server hosting REST endpoints (`/api/chat`, `/api/profile`, `/api/health`) and serving compiled Vite assets.
- **AI Engine**: Google Gemini API via `@google/genai` TypeScript SDK using `gemini-3.8-flash` with graceful fallback cascade (`gemini-3.1-flash-lite`, `gemini-flash-latest`).
- **Security**: The Gemini API key is strictly server-side (`process.env.GEMINI_API_KEY`) and must never be exposed to browser clients.

---

## 2. Gemini Agent Skills & Capabilities
Agents interacting with this project have the following key skills:

### Skill: `gemini-chat-orchestration`
- **Objective**: Maintain conversational state and grounding against Suraj's verified resume.
- **Model Standard**: Use `@google/genai` with `gemini-3.8-flash`.
- **System Instructions**: Prepend verified profile context (`DEFAULT_PROFILE_CONTEXT`) and prompt instructions in `server.ts`.
- **Multi-Turn Context**: Map client chat history into `contents` array with alternating `user` and `model` roles.

### Skill: `material-ui-integrity`
- **Objective**: Maintain Android Material Design 3 fidelity (Pixel viewport shell, dynamic status bar, gesture navigation bar, bottom navigation, pill badges).
- **Design Tokens**: Dark surface palette `#1b1c22`, `#202127`, high contrast text `#e3e2e6`, primary accents in Indigo/Sky, and emerald active indicators.

### Skill: `test-driven-assurance`
- **Objective**: Ensure all profile data updates, component behaviors, and API formats are covered by unit and component tests via Vitest.

---

## 3. Git Workflow & Conventions
- **Branch Strategy**:
  - `main`: Production-ready, stable releases.
  - `feature/<name>`: New feature implementations.
  - `fix/<name>`: Bug fixes and performance patches.
- **Commit Convention**: Conventional Commits standard:
  - `feat: ...` for new features
  - `fix: ...` for bug fixes
  - `refactor: ...` for non-functional code changes
  - `test: ...` for test suite additions
  - `docs: ...` for documentation
- **Quality Gate before Push**:
  1. `npm run lint` (0 errors)
  2. `npm test` (all tests pass)
  3. `npm run build` (successful compilation)
