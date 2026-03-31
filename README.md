# ResourceFlow

ResourceFlow is a standalone Smart Resource Allocation web app with a Spark-safe free deployment profile.

## What is included

- multi-page product flow
- `index.html` for overview and judging fit
- `operations.html` for request intake, matching, sync health, and collaboration timeline
- `volunteer.html` for volunteer onboarding
- `insights.html` for AI simulation and outreach generation
- `judge.html` for evaluation-criteria evidence
- real Firebase project config in `firebase-config.js`
- Firebase Auth with role-aware access states
- Firestore-backed live sync with revision tracking and local fallback if cloud access fails
- local evidence logging with optional Cloud Storage uploads when Storage is enabled
- Spark-safe admin console for role management, outreach drafts, error monitoring, and audit trail review
- cross-tab synchronization support
- advanced fairness-aware volunteer matching with explainable reasons
- richer analytics with readiness scoring, risk radar, revision trend history, bar charts, downloadable analysis pack, and local strategy engine fallback
- input validation and duplicate-prevention guards for submission-safe code review
- AI-style operational insights, fairness watch, and downloadable briefs
- PWA packaging with manifest and service worker
- browser test runner in `tests.html`
- backend unit tests in `functions/test` for the optional Blaze upgrade path
- Firebase Hosting, Firestore, and Storage config files for submission and deployment
- submission documents in the `submission` folder

## Best way to run

### Quick demo

Open `index.html` in a browser.

### Better local run

Run a local server from this folder, then open `http://localhost:5500/index.html`.

Example with Python:

```powershell
python -m http.server 5500
```

## Firebase notes

- `firebase-config.js` is now filled with the real Firebase web config
- Firestore sync uses collection `resourceflow` and document `resourceflow-demo`
- If Firestore is not created yet in Firebase Console, the app will safely fall back to local browser storage instead of breaking
- Signed-in users are created as `volunteer` by default
- Free deployment uses Firebase Auth, Firestore, and Hosting without Cloud Functions
- Admin access is anchored to the configured admin email in `firebase-config.js`
- Coordinators can be promoted by the admin inside the app using Firestore-backed profile roles
- Optional Blaze-only secure backends still live in `functions/` if you ever upgrade later

## Backend workspace

New backend source lives in:

- `functions/index.js`
- `functions/src/shared.js`
- `functions/test/shared.test.js`
- `functions/.env.example`

Backend responsibilities:

- custom claims role assignment
- secure Gemini proxy
- secure route proxy
- notification queue
- admin snapshot
- client error logging
- workspace and notification audit logging

These backend features are optional and intended for a future Blaze upgrade. The free profile does not require them.

## Setup guide

Use:

- `submission/firebase-cloud-setup.md`

That file explains:

- enabling Google sign-in
- enabling Firestore
- enabling optional Storage later if wanted
- promoting the first coordinator/admin in Spark-safe mode
- deploying with Firebase Hosting
- running the browser review tests

## Review-safe verification

Open:

- `tests.html`

This page runs browser tests for:

- validation
- sanitization
- matching
- role resolution
- analytics calculations

## Main runtime files for code review

- `index.html`
- `operations.html`
- `volunteer.html`
- `insights.html`
- `judge.html`
- `tests.html`
- `styles.css`
- `app.js`
- `admin.html`
- `tests.js`
- `criteria.js`
- `firebase-config.js`
- `manifest.webmanifest`
- `service-worker.js`
- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `functions/index.js`
