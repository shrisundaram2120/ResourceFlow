# ResourceFlow Free Cloud Setup

Use this checklist for the strongest free Spark-safe deployment.

## 1. Firebase services to enable

1. Open the Firebase project `resourceflow-8cd9f`.
2. Enable `Authentication`.
3. In Authentication, enable the `Google` sign-in provider.
4. Enable `Cloud Firestore`.
5. Keep `Hosting` connected to the same project.

Optional later:

- `Cloud Storage`

Storage is not required for the free deployment because ResourceFlow can fall back to local evidence records.

## 2. Public app configuration

The free profile already uses:

- `secureBackendEnabled: false`
- `adminEmails: ["acshrisundaram@gmail.com"]`

This means:

- no Cloud Functions are required
- the configured admin email becomes the admin profile after sign-in
- coordinator roles are managed through Firestore user documents inside the app

## 3. Firestore rules

The current rules are Spark-safe and support:

- authenticated workspace sync
- Firestore-backed user profiles
- admin email based role management

Deploy them with:

```powershell
firebase deploy --only "firestore:rules" --project resourceflow-8cd9f
```

## 4. Hosting deployment

Deploy the app with:

```powershell
firebase deploy --only "hosting" --project resourceflow-8cd9f
```

Or deploy hosting and Firestore rules together:

```powershell
firebase deploy --only "firestore:rules,hosting" --project resourceflow-8cd9f
```

## 5. First admin access

1. Sign in through the app using `acshrisundaram@gmail.com`.
2. Open `admin.html`.
3. Click `Refresh Admin Access`.

In Spark-safe mode, no Cloud Functions bootstrap is needed.

## 6. Coordinator promotion

After the admin signs in:

1. Open `admin.html`.
2. Refresh the admin snapshot.
3. Change a user role from `volunteer` to `coordinator`.

That role is stored in Firestore and used by the app in free mode.

## 7. Evidence uploads in free mode

If Firebase Storage is not enabled:

- ResourceFlow still lets coordinators add evidence records
- the app stores a local artifact reference instead of a cloud file

If you later enable Storage, cloud uploads become available without changing the rest of the app.

## 8. AI and routing in free mode

The free profile uses:

- built-in local strategy analysis when no Gemini backend is configured
- estimated routing plus Google Maps route links when paid route APIs are not enabled

This keeps the product complete without requiring Blaze.

## 9. Browser review tests

Open:

- `tests.html`

This verifies:

- sanitization
- validation
- role resolution
- matching logic
- analytics calculations
- free-mode helper outputs

## 10. Optional Blaze upgrade later

If you later decide to upgrade:

- `functions/` already contains the Cloud Functions backend
- `functions/.env` already has the admin email and provider placeholders

That path unlocks:

- custom claims
- secure Gemini proxy
- secure Maps proxy
- notification sending pipeline
- backend audit logs
