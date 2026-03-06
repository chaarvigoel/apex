# Apex MVP — Performance Engine for Elite Female Athletes

Cycle-aware athletic performance optimization for NCAA Division I & II female athletes in high-impact sports (soccer, basketball, volleyball). Apex is a **tactical service layer**: it syncs with your existing training plan and adjusts load based on individual physiology—not a standalone training plan.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/apex](http://localhost:3000/apex) (basePath is `/apex` for GitHub Pages).

## Deploy to GitHub Pages (https://chaarvigoel.github.io/apex/)

1. Push this repo to GitHub (e.g. `chaarvigoel/apex`).
2. In the repo: **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**.
3. Push to `main` (or `master`). The workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) will build the static export and deploy it. The live UI will be at **https://chaarvigoel.github.io/apex/**.

## What’s in this MVP

- **Hero** — Pitch, sub-headline, “Integrate Your Program” CTA
- **Daily Athlete Dashboard** — Mock view: cycle phase, training intensity (High/Moderate/Recovery), ACL injury-risk alert, tactical S&C adjustment, recovery protocol
- **Apex Advantage** — Feature grid: Transparency, Safety Necessity, Tactical Integration (vs Wild.AI, Ultrahuman, generic wellness)
- **Data views** — Placeholders for HRV × cycle phase, RHR × cycle phase, injury risk over 28-day cycle

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Design: high-contrast, data-driven, “Elite Tactical Performance” (no soft wellness-only look)

## Build

```bash
npm run build
npm start
```
