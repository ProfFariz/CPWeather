# CPWeather — Day 1 Logbook: Project Initialization & Foundation

**Date:** Day 1  
**Phase:** Sprint 0 — Project Scaffolding & Configuration  
**Status:** Complete

---

## 1. Objectives for the Day

- Initialize a greenfield React + TypeScript project with Vite as the build tool.
- Install the full dependency tree: UI framework, charting, 3D, internationalization, and all dev tooling.
- Configure ESLint 9 using the new flat config format with TypeScript, React Hooks, and React Refresh plugins.
- Set up a three-file TypeScript project references structure (tsconfig.json, tsconfig.app.json, tsconfig.node.json).
- Wire Vite with the Tailwind CSS 4 plugin and React plugin; embed a local dev API middleware.
- Provision a Vitest runner with Node environment, targeting API and source test files.
- Create the .env.example template, .gitignore, .node-version, and .nvmrc files.
- Scaffold the full directory tree for src/, api/, functions/, worker/, and public/.
- Configure index.html with PWA manifest link, SVG favicon, theme-color meta, and Apple Web App meta tags.
- Verify that pnpm install, pnpm lint, pnpm test, and pnpm build all pass on first attempt.

---

## 2. Tasks Completed

### 2.1 Project Bootstrapping

Ran the Vite scaffolding command targeting the React + TypeScript template:

```powershell
pnpm create vite@latest CPWeather --template react-ts
cd CPWeather
```

Set the package manager to pnpm@10.25.0 and Node version to 22.22.2 (required for Cloudflare Workers compatibility and fetch API stability).

### 2.2 Dependency Installation

**Runtime dependencies:**

| Package | Version | Purpose |
|---|---|---|
| react | ^19.2.4 | UI framework (React 19 with concurrent features) |
| react-dom | ^19.2.4 | DOM rendering |
| tailwindcss | ^4.2.2 | Utility-first CSS framework (Tailwind v4) |
| @tailwindcss/vite | ^4.2.2 | Tailwind CSS Vite plugin (v4 native) |
| chart.js | ^4.5.1 | Canvas-based charting library |
| react-chartjs-2 | ^5.3.1 | React wrapper for Chart.js |
| three | ^0.169.0 | WebGL/3D rendering (ShaderGradient background) |
| @react-three/fiber | ^9.6.0 | React renderer for Three.js |
| @shadergradient/react | ^2.4.20 | Animated shader gradient component |
| dayjs | ^1.11.20 | Lightweight date/time manipulation |
| lottie-web | ^5.13.0 | Lottie animation runtime |

**Dev dependencies:**

| Package | Version | Purpose |
|---|---|---|
| vite | ^8.0.4 | Build tool and dev server |
| @vitejs/plugin-react | ^6.0.1 | React Fast Refresh and JSX transform |
| typescript | ~6.0.2 | TypeScript compiler (TS 6.0) |
| eslint | ^9.39.4 | ESLint core (flat config only) |
| @eslint/js | ^9.39.4 | ESLint recommended rules |
| typescript-eslint | ^8.58.0 | TypeScript ESLint integration |
| eslint-plugin-react-hooks | ^7.0.1 | Rules of Hooks linting |
| eslint-plugin-react-refresh | ^0.5.2 | HMR-safe export linting |
| vitest | ^4.1.4 | Unit test runner |
| wrangler | ^4.88.0 | Cloudflare Workers CLI |

**Key decisions:**
- Chose Tailwind CSS v4 over v3 for its CSS-first configuration model — no tailwind.config.ts needed.
- Chose dayjs over date-fns or luxon for its minimal bundle footprint (~2KB) and timezone plugin support.
- Chose Vitest over Jest for native ESM support, Vite integration, and zero-config TypeScript.

### 2.3 ESLint 9 Flat Config

Created eslint.config.js:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

### 2.4 TypeScript Configuration

Three-file project references architecture:

- tsconfig.json (root orchestrator) — references tsconfig.app.json and tsconfig.node.json
- tsconfig.app.json — ES2023 target, react-jsx, strict linting, src/ only
- tsconfig.node.json — Node types, includes api/, functions/, worker/, src/shared/

### 2.5 Vite Configuration

vite.config.ts with three plugins:
1. @vitejs/plugin-react for Fast Refresh
2. @tailwindcss/vite for Tailwind CSS v4
3. Custom local-dashboard-api middleware for /api/dashboard during dev

### 2.6 Vitest Configuration

```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts', 'src/**/*.test.ts'],
    restoreMocks: true,
    unstubGlobals: true,
    clearMocks: true,
  },
})
```

### 2.7 Environment Variables

- .env.example: OPENWEATHER_API_KEY=your_openweather_api_key
- .env.local (git-ignored) contains the real key

### 2.8 index.html with PWA & Theme Setup

- theme-color: #059669 (emerald-600 brand color)
- Favicon as SVG for infinite scalability
- manifest.webmanifest link for PWA support
- apple-mobile-web-app-capable for iOS standalone mode

### 2.9 Full Directory Structure

```
CPWeather/
  api/          — API route handler, service, tests, location config
  functions/    — Cloudflare Pages Functions
  worker/       — Cloudflare Worker entry
  public/       — Static assets (favicon, manifest)
  src/          — React source code
    assets/     — Images, Lottie JSON
    components/ — Dashboard UI components
    hooks/      — Custom React hooks
    i18n/       — Internationalization
    lib/        — Cache utilities
    shared/     — Shared type contracts
  Config files: eslint, tsconfig, vite, vitest, wrangler, package.json
```

### 2.10 Verification Checklist

| Command | Result | Notes |
|---|---|---|
| pnpm install | Pass | 0 peer dependency warnings |
| pnpm lint | Pass | ESLint 9 flat config, 0 errors |
| pnpm test | Pass | All tests passing |
| pnpm build | Pass | tsc -b + vite build successful |

---

## 3. Challenges Encountered & Solutions

### Challenge 1: ESLint 9 Flat Config Migration
The Vite React-TS template originally included an ESLint 8-style config. ESLint 9+ rejects .eslintrc.* files entirely. Deleted the legacy file and authored eslint.config.js from scratch using defineConfig() and globalIgnores().

### Challenge 2: Tailwind CSS v4 Vite Plugin
Tailwind CSS v4 uses CSS-first configuration via @theme directives. The @tailwindcss/vite plugin replaces the PostCSS pipeline. Added @import "tailwindcss" as the first line of src/index.css and removed any lingering tailwind.config.ts.

### Challenge 3: Environment Variable Loading
The API layer reads process.env.OPENWEATHER_API_KEY, but Vite's dev server only auto-exposes VITE_-prefixed vars to import.meta.env. Used loadEnv with empty prefix to load all env vars and manually hydrated process.env.

### Challenge 4: TypeScript Project References with Shared Code
src/shared/ needed type-checking in both app context (DOM types) and node context (Node types). Both tsconfig.app.json and tsconfig.node.json include src/shared/**/*.ts — the shared code uses only platform-agnostic TypeScript.

---

## 4. Lessons Learned

1. **ESLint flat config is the future.** The defineConfig() + globalIgnores() API is cleaner and more composable than the old cascade.
2. **Tailwind CSS v4 reduces config surface area.** No tailwind.config.ts, no postcss.config.js — just the Vite plugin.
3. **Project references prevent type leakage.** Dividing app and tooling code prevents DOM types from leaking into the API layer.
4. **erasableSyntaxOnly catches future problems early.** Prevents enum usage incompatible with verbatimModuleSyntax.
5. **Testing pnpm build on Day 1 is essential.** Surfaces config issues before any application code is written.
6. **The .env.example / .env.local pattern must be established immediately.** Prevents accidental API key commits.

---

## 5. Next Day Preview (Day 2)

- Define the full DashboardPayload type as the single source of truth
- Implement runtime validation with type guards
- Write Vitest unit tests for validation
- Build mock data generator for all 10 Perak locations
- Implement location configuration with GPS coordinates and warning aliases
- Begin API service layer with provider interfaces

---

## 6. Hours Logged

| Task | Hours |
|---|---|
| Project scaffolding & dependency installation | 1.5 |
| ESLint 9 flat config setup & debugging | 1.0 |
| TypeScript project references configuration | 0.75 |
| Vite config with Tailwind + React + dev API | 1.0 |
| Vitest config | 0.5 |
| Environment variable setup | 0.5 |
| index.html with PWA meta tags | 0.5 |
| Directory structure scaffolding | 0.75 |
| Verification (lint, test, build) & fixes | 1.0 |
| Documentation | 0.5 |
| **Total** | **8.0** |
