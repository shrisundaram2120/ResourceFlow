# ResourceFlow Submission Draft

## Project title

ResourceFlow

## Problem statement

Community organizations often coordinate food distribution, medical camps, shelter support, and volunteer response using spreadsheets, calls, and scattered chat messages. This slows down response time and makes it hard to know which request is most urgent, which volunteers are available, and who has the right skills or transport.

## Solution

ResourceFlow is a web platform that helps coordinators capture requests, register volunteers, automatically match people to the right tasks, and monitor impact metrics in one place. The deployed free profile uses Firebase Authentication, Firestore collaboration, local strategy analysis, Google Maps route links, evidence logging, an admin console, and review-safe testing, while the repository also keeps an optional Blaze upgrade path for secure backend features later.

## SDG alignment

- SDG 11: Sustainable Cities and Communities
- SDG 3: Good Health and Well-Being
- SDG 17: Partnerships for the Goals

## Target users

- NGOs
- campus community groups
- relief organizers
- volunteer coordinators
- local service networks

## Key features

- request intake dashboard
- volunteer portal with skills and availability
- urgency-based matching engine with explainable assignment reasons
- coverage, critical fill rate, readiness score, risk radar, and richer charts
- Firebase Auth with Firestore-backed role-aware access for volunteers, coordinators, and admins
- Firestore live sync with revision history and local fallback
- local evidence logging with optional Cloud Storage uploads
- Google Maps route links and estimated routing for dispatch planning
- local operational analysis and downloadable briefs
- admin console for user roles, outreach drafts, and operational monitoring
- browser test runner for submission-safe code review

## Google technology story

- Firebase Authentication secures role-aware access
- Cloud Firestore powers shared workspace sync and revision tracking
- Cloud Storage can be turned on later for evidence uploads, but the free profile works without it
- Google Maps route links support dispatch handoff without requiring paid routing APIs
- built-in strategy analysis supports decision-making in the free profile
- Firebase Hosting packages the project as a deployable multi-page web app

## Impact story

ResourceFlow reduces response delays, improves staffing accuracy, and helps coordinators use limited volunteers more effectively. This increases coverage for urgent requests and makes local service operations more organized and scalable.

## Future roadmap

1. optional Blaze upgrade for custom claims and secure backend tooling
2. secure Gemini proxy for paid production deployments
3. multi-stop routing and dispatch optimization
4. multilingual outreach and notification workflows
5. deeper impact reporting dashboards and partner analytics
