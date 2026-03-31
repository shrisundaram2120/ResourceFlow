# Code Review Notes

## Main active runtime files

- `index.html`
- `operations.html`
- `volunteer.html`
- `insights.html`
- `judge.html`
- `styles.css`
- `app.js`
- `criteria.js`
- `firebase-config.js`

## Firebase and deployment files

- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `firestore.indexes.json`
- `manifest.webmanifest`
- `service-worker.js`

## Firestore data model

Collection:
- `resourceflow`

Document:
- `resourceflow-demo`

Stored document shape:
- `state.requests`
- `state.volunteers`
- `state.assignments`
- `state.lastUpdated`
- `updatedAt`

## Cloud sync behavior

- if Firestore is available, the app reads and writes the shared workspace in Firestore
- if Firestore is not available yet, the app automatically falls back to local storage
- this fallback is intentional so judges do not hit a broken interface during demos

## Notes for reviewers

- volunteer matching is explainable and score-based
- judge mode and AI insights are generated from actual workspace data
- Google Maps integration is link-based dispatch, not a full Maps SDK integration
- the app is ready for Firebase Hosting deployment
