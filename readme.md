# CPWeather

Perak Weather + API Dashboard focused on the things that matter locally: haze, sudden rain, air quality, and whether an outdoor plan still makes sense today.

## Project Goal

Most generic weather apps stop at temperature and icons. This project is meant to be more useful for Perak users by combining:

- 5-day weather forecast
- air-quality insight
- local weather warning context
- a practical trip tip such as "can I hike today?"

The main portfolio signal is strong front-end fundamentals:

- API integration
- data normalization
- Chart.js data visualization
- responsive UI
- local caching
- server/client separation for secrets

## Current Status

What is already done:

- React + TypeScript + Vite app scaffolded in this repo
- Tailwind CSS wired into Vite
- mock dashboard UI built
- shared dashboard response contract created
- `/api/dashboard` endpoint created
- frontend now fetches `/api/dashboard`
- loading, error, retry, and empty states added
- local Vite dev server can serve `/api/dashboard`
- project passes `pnpm lint`
- project passes `pnpm build`

What is not done yet:

- real OpenWeather integration
- real Malaysia weather and warning integration
- `localStorage` cache with TTL
- live hiking-decision rules
- `.env.local` setup for live keys
- deployment to Vercel
- final README screenshots and attribution polish

Important note:

- The frontend is already using the API route, but the API route still returns mock data right now.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Chart.js
- `fetch`
- `dayjs`

## Product Scope

The MVP dashboard should answer:

1. What does the next 5 days look like?
2. Is the air quality okay?
3. Are there any warnings I should care about?
4. Is today still a good day for an outdoor plan?

Current sample locations:

- Ipoh
- Taiping
- Lumut

Current outdoor examples:

- Cameron Highlands
- Bukit Larut
- Teluk Batik coastal trail

## Folder Structure

```text
CPWeather/
|-- api/
|   `-- dashboard.ts
|-- src/
|   |-- shared/
|   |   `-- dashboard.ts
|   |-- App.tsx
|   |-- index.css
|   `-- mockData.ts
|-- vite.config.ts
|-- package.json
`-- readme.md
```

## Shared Contract

The frontend and backend both use the same dashboard shape from:

- `src/shared/dashboard.ts`

That shared contract includes:

- location list
- active location key
- current snapshot
- source metadata
- typed error payloads

This is important because once real APIs are added, the UI should not care where the data came from. It should only care that the shape is stable.

## API Route

Current endpoint:

```text
GET /api/dashboard
GET /api/dashboard?location=ipoh
GET /api/dashboard?location=taiping
GET /api/dashboard?location=lumut
```

Current behavior:

- returns mock dashboard payload for a valid location
- defaults to `ipoh` if no location is provided
- returns `400 INVALID_LOCATION` for unsupported locations
- returns `405 METHOD_NOT_ALLOWED` for non-GET requests

## Planned Live Data Sources

Planned integration:

- OpenWeather 5-day forecast
- OpenWeather air pollution
- Malaysia weather or warning data via `data.gov.my` / MET Malaysia

Planned server flow:

1. Frontend calls `/api/dashboard`
2. Server fetches third-party APIs
3. Server normalizes the data into one dashboard payload
4. Frontend renders that payload

This keeps secret API keys out of the browser in production.

## Setup

### Requirements

- Node `22.12.0` recommended
- `pnpm`
- PowerShell on Windows

### Important Node Reminder

This machine had an older Node 18 install in `C:\Program Files\nodejs`.

A PowerShell profile was added so new PowerShell terminals prioritize Node 22 first. If a terminal still shows Node 18, do this:

```powershell
. $PROFILE
node -v
where node
```

Expected result:

```powershell
v22.12.0
```

### Install

```powershell
pnpm install
```

### Run Dev Server

```powershell
pnpm dev
```

### Lint

```powershell
pnpm lint
```

### Build

```powershell
pnpm build
```

## Environment Variables

Not needed yet for the current mock-backed API route.

Planned local env file:

```text
.env.local
```

Planned variables:

```text
OPENWEATHER_API_KEY=your_key_here
```

More vars may be added later depending on the exact Malaysia API flow.

Do not expose secret keys through `VITE_*` variables for production use.

## Current Frontend Behavior

The app now:

- fetches dashboard data from `/api/dashboard`
- shows a first-load state while waiting for data
- shows a retryable error state if the request fails
- keeps the same main dashboard layout
- shows source metadata such as whether the payload is mock or live

## Next Steps

Recommended build order from here:

1. Add `localStorage` caching with a 10 to 15 minute TTL
2. Replace mock API response with real OpenWeather + Malaysia API requests
3. Normalize real responses into the shared dashboard contract
4. Move hiking logic into a reusable decision function
5. Add `.env.local` and Vercel environment variables
6. Deploy to Vercel
7. Add attribution, screenshots, and final polish

## Hiking Tip Logic Plan

The final hiking tip should be explicit and explainable.

Basic intended rule order:

1. Active weather warning has the highest priority
2. AQI affects comfort and safety
3. Rain timing affects whether the trip is still practical
4. The UI should explain why the answer is yes, caution, or no

## Caching Plan

Planned client cache strategy:

- store dashboard payload in `localStorage`
- use a TTL of around 10 to 15 minutes
- prefer cached data for fast repeat loads
- refresh in background when stale
- show stale data notice if live refresh fails

## Deployment Plan

Planned target:

- Vercel

Planned production model:

- frontend served by Vercel
- `/api/dashboard` runs as serverless function
- secret API keys stored in Vercel environment variables

## Things Not To Forget

- use Node 22, not Node 18
- the API route is still mock-backed
- do not put secret weather keys in frontend `VITE_*` env vars
- keep the frontend consuming the shared dashboard contract
- add attribution for any provider that requires it
- test mobile layout, not just desktop
- keep the MVP focused before adding Supabase, i18n, or PWA work

## Development Notes

This project is being built iteratively:

1. shape the UI with mock data
2. create a stable shared contract
3. switch frontend to API consumption
4. replace mock API implementation with live integrations

That approach keeps the UI moving early without blocking on API keys.
