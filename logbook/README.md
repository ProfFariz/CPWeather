# CPWeather Development Logbook

**Intern:** CS Degree Student  
**Project:** CPWeather (CuacaPerak) — Perak Weather Decision Dashboard  
**Duration:** 10 Working Days  
**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Chart.js, Three.js, Cloudflare Workers

---

## Overview

CPWeather is a Perak, Malaysia-focused weather dashboard that answers hyper-local questions traditional weather apps ignore: haze risk, rain timing, outdoor/hiking safety, and live government warnings. It combines OpenWeather and Malaysia government weather APIs (data.gov.my) into a polished glass-morphism UI with predictive hiking recommendations.

This logbook documents the complete development journey across 10 working days, from project initialization to production deployment.

---

## Day-by-Day Index

| Day | Focus | File |
|-----|-------|------|
| 1 | Project Initialization & Foundation | [day-01-project-setup.md](./day-01-project-setup.md) |
| 2 | Core Architecture & Data Contracts | [day-02-core-architecture.md](./day-02-core-architecture.md) |
| 3 | API Integration & Backend Service | [day-03-api-integration.md](./day-03-api-integration.md) |
| 4 | API Layer & Client-Side Caching | [day-04-api-layer-caching.md](./day-04-api-layer-caching.md) |
| 5 | Frontend Foundation & Layout | [day-05-frontend-foundation.md](./day-05-frontend-foundation.md) |
| 6 | Hero Section & Weather Display | [day-06-hero-weather-display.md](./day-06-hero-weather-display.md) |
| 7 | Forecast & Charts | [day-07-forecast-charts.md](./day-07-forecast-charts.md) |
| 8 | Warnings System, i18n & Animations | [day-08-warnings-i18n-animations.md](./day-08-warnings-i18n-animations.md) |
| 9 | Styling & Responsive Design | [day-09-styling-responsive.md](./day-09-styling-responsive.md) |
| 10 | Testing, Deployment & Documentation | [day-10-testing-deployment.md](./day-10-testing-deployment.md) |

---

## Project Architecture Summary

```
src/shared/dashboard.ts          <- Central data contract (types, validation)
         |
api/dashboardService.ts          <- Core aggregation engine
api/dashboard.ts                 <- API route handler
         |
src/hooks/useDashboard.ts        <- Cache-first data hook
         |
src/components/dashboard/*.tsx   <- UI components (glass-morphism)
         |
worker/index.ts                  <- Cloudflare Worker deployment
```

### Five External Data Providers:
1. OpenWeather Current Weather (/data/2.5/weather)
2. OpenWeather 5-day Forecast (/data/2.5/forecast)
3. OpenWeather Air Pollution (/data/2.5/air_pollution)
4. Malaysia Government Forecast (api.data.gov.my/weather/forecast)
5. Malaysia Government Warnings (api.data.gov.my/weather/warning)

### 10 Supported Perak Locations:
Tapah, Ipoh, Cameron Highlands, Taiping, Lumut, Gopeng, Gerik, Kampong Gajah, Sungkai, Teluk Intan

### Bilingual Support:
Full English and Bahasa Malaysia (BM) translations across all UI surfaces.

---

## Key Skills Demonstrated

- **Frontend:** React 19 with hooks, TypeScript 6.0, Tailwind CSS v4, Chart.js, Three.js/WebGL
- **Backend:** REST API design, multiple provider aggregation, graceful degradation
- **Architecture:** Data contract-first design, cache-first strategy, stale-while-revalidate pattern
- **DevOps:** Cloudflare Workers deployment, Vite build pipeline, ESLint 9 flat config
- **Testing:** Vitest integration tests with mocked fetch, runtime validation tests
- **UX:** Glass-morphism design system, responsive breakpoints, reduced-motion accessibility, PWA support
- **Internationalization:** Full bilingual i18n system with dayjs locale switching

---

*This logbook documents 10 days of intensive full-stack development for a CS degree internship.*
