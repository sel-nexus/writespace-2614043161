# WriteSpace

WriteSpace is a lightweight, browser-local writing and reading space built as a static Vite + React application. Visitors can explore recent public previews, register or sign in, and authenticated users can create, read, edit, and delete posts. An admin dashboard provides post oversight and local account management.

## Features

- Public landing page with feature overview and recent post previews.
- Local registration and login, including a default demo admin (`admin` / `admin`).
- Role-aware route protection and responsive navigation.
- Blog collection with newest-first ordering, excerpts, author details, and empty states.
- Full post reading with ownership-aware edit/delete actions.
- Post creation and editing with validation, character count, and persistence feedback.
- Admin dashboard with statistics, recent post actions, and account management.
- Browser `localStorage` persistence; data remains in the current browser only.

> This is a local demo. Do not use real passwords or store sensitive information. Clearing browser storage removes local accounts and posts.

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local development URL. For a production bundle:

```bash
cd frontend
npm run build
npm run preview
```

## Tests

Run component/unit tests:

```bash
cd frontend
npm test
```

Run browser end-to-end tests (Chromium required):

```bash
cd frontend
npm run e2e
```

The Playwright configuration starts the Vite server automatically. The E2E suite covers public/auth flows, blog reading, post writing, admin management, mobile navigation, persistence, and browser error capture.
