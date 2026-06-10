---
name: testing-resourceflow
description: Test ResourceFlow end-to-end locally. Use when verifying frontend, backend, or security changes.
---

# Testing ResourceFlow

## Quick Local Setup

```bash
# Serve the frontend
cd /home/ubuntu/repos/ResourceFlow
python3 -m http.server 5500
```

Then open `http://localhost:5500/index.html` in the browser.

## Available Test Suites

### Browser Tests (tests.html)
- Navigate to `http://localhost:5500/tests.html`
- Runs 14 tests covering: validation, sanitization, matching engine, role resolution, analytics, risk scoring, and free-mode helpers
- Tests auto-run on page load; results show PASS/FAIL inline
- These tests exercise `app.js`, `criteria.js`, and `tests.js`

### Backend Unit Tests
```bash
cd functions && npm install && npm test
```
- Runs 9 tests via `node --test` covering shared helpers: `normalizeRole`, `normalizeZone`, `normalizeSkills`, `safeInteger`, `sanitizeVolunteerRecord`, `sanitizeNotificationPayload`, `sanitizeClientError`, `assertManager`, `assertAdmin`

## What Requires Firebase Credentials

The following cannot be tested locally without Firebase emulators + project config:
- Firestore security rules (read/write permissions)
- Cloud Function auth enforcement (ensureSignedIn, ensureManager, ensureAdmin)
- Firebase Auth sign-in flow (Google sign-in, email/password)
- Firestore data sync between clients

To test these, you would need Firebase emulators configured with the project credentials.

## Key Pages

| Page | URL | Auth Required | Notes |
|---|---|---|---|
| Sign In | `/index.html` | No | Entry point, loads `auth-entry.js` |
| Operations | `/operations.html` | Yes (government+) | Redirects to sign-in if not authed |
| Volunteer | `/volunteer.html` | Yes | Volunteer onboarding |
| Admin | `/admin.html` | Yes (admin) | Admin dashboard, loads `resourceflow-shared.js` |
| Insights | `/insights.html` | Yes | AI simulation |
| Tests | `/tests.html` | No | Browser test runner |

## Architecture Notes

- `script.js` is a standalone/legacy file NOT loaded by any HTML page in the current app
- The live app uses: `app.js`, `portal.js`, `resourceflow-shared.js`, `auth-entry.js`, `criteria.js`
- `firebase-config.js` contains client-side Firebase config (API key is public by design)
- Cloud Functions live in `functions/index.js` with shared helpers in `functions/src/shared.js`
- Firestore rules in `firestore.rules`, Storage rules in `storage.rules`
- Security headers configured in `firebase.json` under `hosting.headers`

## Devin Secrets Needed

No secrets are required for local frontend testing or backend unit tests. Firebase project credentials would be needed only for emulator-based Firestore/Auth testing.
