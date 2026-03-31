# ResourceFlow Project Documentation

## 1. Project Overview

**Project Name:** ResourceFlow  
**Theme:** Smart Resource Allocation for Community Response  
**Tagline:** AI-powered volunteer and resource coordination for social impact

ResourceFlow is a standalone web application built for Google Solution Challenge style hackathons. It helps community organizations manage urgent requests, register volunteers, match the right people to the right tasks, track impact, and present judge-ready evidence in one platform.

The product is designed for NGOs, campus service teams, shelters, relief organizers, and local community networks that often coordinate through spreadsheets, calls, and scattered messages. ResourceFlow replaces that fragmented process with a structured, cloud-connected workflow and now ships with a Spark-safe free deployment profile.

## 2. Problem Statement

Community organizations often struggle to coordinate real-time needs such as food delivery, medical camp support, shelter assistance, and volunteer mobilization. In many cases:

- requests are tracked manually
- volunteer skills and availability are not centralized
- urgent needs are hard to prioritize
- coordination is slow and error-prone
- there is little visibility into fairness, coverage, or impact

This creates delays, duplication, and weak resource allocation during time-sensitive community operations.

## 3. Solution Summary

ResourceFlow solves this by providing:

- a request intake dashboard for community needs
- a volunteer onboarding portal with skills, availability, transport, and location
- a fairness-aware matching engine
- operational dashboards with sync health and activity timeline
- built-in strategy insights with optional Gemini upgrade later
- estimated routing plus Google Maps route links
- local evidence logging with optional Firebase Storage later
- review-safe browser tests and deployment-ready configuration

## 4. Core Goals

- reduce coordination time
- improve matching quality between needs and volunteers
- make operations more transparent and explainable
- support real-time cloud collaboration
- improve submission readiness for technical review and judging

## 5. Target Users

- NGOs
- volunteer coordinators
- campus service groups
- community relief teams
- shelters and outreach organizations
- social impact project reviewers and judges

## 6. Product Pages

### `index.html`

Overview page with product introduction, impact framing, and judging narrative.

### `operations.html`

Main coordinator workspace for:

- adding requests
- running matching
- viewing assignments
- checking sync health
- reviewing collaboration timeline
- uploading proof artifacts
- viewing live route planning

### `volunteer.html`

Volunteer registration page for:

- name
- skills
- zone
- location
- transport
- experience
- availability

### `insights.html`

Strategy and analytics page for:

- executive brief
- judge brief
- readiness score
- risk radar
- zone and skill charts
- live Gemini analysis
- downloadable analysis pack

### `judge.html`

A dedicated page that maps the product directly to evaluation criteria.

### `tests.html`

Browser-based test runner for core logic verification.

## 7. Major Features

### A. Firebase Authentication with Roles

The app supports real Firebase Authentication with Google sign-in.

Role model:

- `guest`
- `volunteer`
- `coordinator`
- `admin`

Behavior:

- guests can view the app
- signed-in users can join the workspace as volunteers
- coordinators and admins can manage operational actions
- elevated roles are visible in the UI
- the free profile uses Firestore-backed role management anchored to the configured admin email
- the repository also includes an optional Blaze upgrade path for server-enforced custom claims

### B. Cloud Firestore Sync

The app uses Firestore for shared workspace state.

Capabilities:

- cloud-backed workspace document
- cross-tab synchronization
- revision history
- activity logging
- local fallback when cloud access fails

### C. Evidence Management

Coordinators and admins can log evidence files such as:

- photos
- PDFs
- text notes

If Firebase Storage is enabled later, these files can be uploaded to cloud storage. In the free profile, ResourceFlow still records local evidence references so the workflow stays usable without paid services.

### D. Strategy Analysis

The free profile uses a built-in local strategy engine for operational analysis.

The app can generate:

- top immediate actions
- staffing risks
- community impact summary
- product improvement suggestions

If the project is upgraded later, the repository already contains an optional secure Gemini backend path.

### E. Google Maps Routing

The free profile uses estimated routing plus Google Maps route links between volunteer locations and request locations.

Outputs include:

- route estimate
- estimated travel time
- assignment dispatch context
- one-click Google Maps handoff

### F. Analytics and Impact Storytelling

The app includes richer analytics such as:

- request coverage
- critical fill rate
- readiness score
- risk radar
- beneficiary estimates
- revision trend history
- zone coverage chart
- skill gap chart

### G. Submission-Safe Testing

The project includes a browser test runner that validates:

- role resolution
- request validation
- state sanitization
- assignment generation
- analytics calculations

The backend also includes Node-based unit tests for shared helper logic.

## 8. Google Technology Stack

ResourceFlow uses Google technologies directly in the product:

- **Firebase Authentication** for sign-in
- **Cloud Firestore** for live shared data
- **Cloud Storage** as an optional later upgrade for evidence files
- **Firebase Hosting** for deployment
- **Google Maps** route links for dispatch handoff
- **Google Analytics for Firebase** for event tracking

Optional later:

- **Cloud Functions for Firebase** for secure backend workflows
- **Gemini API** for paid live AI analysis

## 9. Technical Architecture

### Frontend

- HTML
- CSS
- vanilla JavaScript
- multi-page structure

### Main Runtime Files

- `app.js`
- `criteria.js`
- `styles.css`
- `firebase-config.js`

### State Model

Workspace state includes:

- requests
- volunteers
- assignments
- artifacts
- activityLog
- history
- meta
- lastUpdated

### Security Files

- `firestore.rules`
- `storage.rules`
- `firebase.json`

## 10. Matching Logic

The volunteer matching engine uses multiple factors:

- skill overlap
- zone proximity
- transport availability
- experience level
- availability
- urgency
- zone pressure

It produces:

- ranked assignments
- fit scores
- explainable reasons for each match

## 11. Accessibility and UX Notes

The app includes:

- skip link
- clear form labeling
- keyboard-friendly navigation
- readable cards and panels
- mobile-friendly layout
- visible sync and permission states

## 12. Real-World Impact

ResourceFlow is intended to improve:

- response speed
- staffing accuracy
- operational transparency
- fairness across zones
- measurable community support

Instead of simply collecting data, the app helps teams make faster, more informed decisions.

## 13. Evaluation Criteria Alignment

### Technical Merit

- real Google technology integration
- maintainable structured code
- cloud sync, routing, AI, uploads, and testing
- scalable state model and deployment files

### User Experience

- clean multi-page product flow
- clear coordinator and volunteer journeys
- accessibility-minded interactions
- strong demo clarity

### Alignment With Cause

- directly addresses community coordination and social impact operations
- supports food, health, shelter, logistics, and outreach use cases
- improves decision quality for mission-driven teams

### Innovation and Creativity

- fairness-aware allocation
- live Gemini analysis
- route-aware dispatch planning
- judge mode and browser test mode
- collaboration history and revision-based analytics

## 14. How To Run The App

### Quick open

Open:

- `index.html`

### Best local run

Serve the project with a local server, for example:

```powershell
python -m http.server 5500
```

Then open:

- `http://localhost:5500/index.html`

## 15. Cloud Setup Summary

To fully enable all advanced features:

1. enable Google sign-in in Firebase Authentication
2. enable Firestore
3. enable Cloud Storage
4. add Maps API key in `firebase-config.js`
5. add Gemini API key in `firebase-config.js`
6. sign in once to create the user profile
7. promote the first user to `coordinator` or `admin` in Firestore
8. deploy rules and hosting

Detailed steps are documented in:

- `submission/firebase-cloud-setup.md`

## 16. Testing and Review

To verify the project logic:

- open `tests.html`
- review browser test results
- use `judge.html` for criteria evidence
- use `insights.html` for analytics and AI proof

## 17. Submission Strengths

- real Google integrations instead of mock-only architecture
- clear product framing for judges
- role-aware operational workflow
- strong technical storytelling
- submission-safe project structure
- built-in evidence for code review and demo presentation

## 18. Future Improvements

- Cloud Functions proxy for Gemini requests
- automatic admin tooling for role promotion
- multi-stop route optimization
- multilingual communication workflows
- notifications through email, SMS, or WhatsApp
- deeper impact dashboards

## 19. Conclusion

ResourceFlow is more than a static prototype. It is a cloud-connected, AI-assisted, submission-ready community coordination platform that combines Firebase, Gemini, Google Maps, analytics, and structured operational design to solve a real social impact problem.
