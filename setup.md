# Mjolnir backend setup and deployment

## What this backend provides

- Firebase ID-token verification for authenticated API operations.
- User-profile registration linked to the Firebase Authentication UID.
- Creation and public discovery of lost/found posts in Cloud Firestore.
- Owner-only `resolve` operation. Firestore executes it in a transaction, so a post can transition from `ACTIVE` to `RESOLVED` only once.

Firebase Authentication itself performs email/password, Google, or other sign-in/sign-up flows in the React client. The backend **never receives passwords**; it receives and verifies the resulting Firebase ID token.

## Prerequisites

- JDK 17 and Docker for local backend work.
- A Firebase project on the Blaze plan (required for Cloud Run access to Firebase/Google Cloud resources).
- `gcloud` CLI authenticated to the Google account that owns the Firebase project.

## Firebase and Google Cloud configuration

1. In the Firebase console, create or select a project, then enable:
   - **Authentication** and the desired providers (email/password is a common starting point).
   - **Cloud Firestore** in Native mode.
   - **Cloud Storage**.
2. In Google Cloud, enable the following APIs for the same project:

   ```powershell
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com firebase.googleapis.com
   ```

3. Give the Cloud Run runtime service account `roles/datastore.user`. If you use the default Compute service account, replace the email below with its actual value:

   ```powershell
   gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" --role="roles/datastore.user"
   ```

4. For local development, create a service-account key only if Application Default Credentials are unavailable, then set it without committing the file:

   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\secure\service-account.json"
   $env:FIREBASE_PROJECT_ID = "PROJECT_ID"
   ```

   Alternatively, run `gcloud auth application-default login`. On Cloud Run, do not use a key file: the runtime service account supplies Application Default Credentials automatically.

## Run locally

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

The API listens on `http://localhost:8080`. Set the allowed Vite development origin if it differs from the default:

```powershell
$env:CORS_ALLOWED_ORIGIN = "http://localhost:5173"
```

## Deploy to Cloud Run

From the repository root, replace all placeholders and deploy the included Dockerfile:

```powershell
gcloud config set project PROJECT_ID
gcloud run deploy mjolnir-api --source . --region REGION --allow-unauthenticated --set-env-vars "FIREBASE_PROJECT_ID=PROJECT_ID,CORS_ALLOWED_ORIGIN=https://YOUR_SITE.web.app"
```

`--allow-unauthenticated` is intentional: public `GET /api/posts` and `GET /api/posts/{id}` are browse endpoints. Protected endpoints still reject requests without a valid Firebase ID token.

After deployment, copy the Cloud Run service URL. Its health endpoint is `GET /actuator/health`.

## API contract

All dates are ISO-8601 UTC strings. All errors use `{ timestamp, status, error, message }`.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Required | Create the profile for the Firebase user. Body: `{ "username": "Ada" }` |
| `GET` | `/api/auth/me` | Required | Return the current user's profile. |
| `GET` | `/api/posts?type=LOST` | No | List active posts; `type` may be `LOST` or `FOUND`. |
| `GET` | `/api/posts/{id}` | No | Get one post. |
| `GET` | `/api/posts/mine` | Required | List posts created by the current user. |
| `POST` | `/api/posts` | Required | Create a post. |
| `PATCH` | `/api/posts/{id}/resolve` | Required, owner only | Resolve an active post once; returns `204`. A second call returns `409`. |

Authenticated requests must include:

```http
Authorization: Bearer <Firebase ID token>
```

Example create request:

```json
{
  "title": "Black backpack",
  "description": "Black backpack with a silver zipper.",
  "category": "Bags",
  "type": "LOST",
  "location": "Main library",
  "pictureUrl": "https://firebasestorage.googleapis.com/..."
}
```

## Next steps for the React + Vite frontend

1. Create the Vite app and install Firebase. Put the Firebase web configuration in `VITE_FIREBASE_*` environment variables, as expected by the existing helper under `src/main/resources/frontend/src/services/firebase.ts`.
2. Use Firebase Auth for sign-up/sign-in. Immediately after a first successful sign-up, obtain `await user.getIdToken()` and call `POST /api/auth/register` with the bearer token and the chosen username.
3. Configure `VITE_API_BASE_URL` to the deployed Cloud Run URL. For protected API calls, refresh the token with `await auth.currentUser?.getIdToken()` and send it in `Authorization`.
4. Upload images from the browser to Firebase Storage, then send the returned download URL as `pictureUrl` when creating a post. Use Storage security rules that allow writes only to authenticated users and restrict file size/content type.
5. Create views for the active feed, lost/found filter, post detail, post composer, and the current user's posts. Only display the Resolve action to the post owner when its status is `ACTIVE`.
6. Build the frontend and deploy it to Firebase Hosting. Set `CORS_ALLOWED_ORIGIN` on Cloud Run to the final `https://PROJECT_ID.web.app` (or custom domain), then redeploy/update the service environment variable.

Do not let the frontend write Firestore post documents directly. Route post/profile mutations through this API so ownership and the one-time resolution rule are always enforced.
