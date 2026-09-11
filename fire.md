# Local Firebase setup

This guide runs Mjolnir locally with Firebase emulators. The frontend is intentionally not changed by this setup.

## 1. Prerequisites

Install:

- Java 21 or newer for the Firebase emulators
- Java 17 for the Spring Boot application
- Node.js and npm
- Firebase CLI, or allow the startup script to download it with `npx`

Verify the tools:

```powershell
java -version
node --version
npm --version
```

## 2. Start the Firebase emulators

From the repository root, run:

```powershell
.\scripts\start-emulators.ps1
```

The script starts:

| Emulator | URL | Purpose |
| --- | --- | --- |
| Authentication | `http://127.0.0.1:9099` | Email/password users and ID tokens |
| Firestore | `http://127.0.0.1:8081` | Users and posts |
| Storage | `http://127.0.0.1:9199` | Local Firebase Storage development |
| Emulator UI | `http://127.0.0.1:4000` | Inspect and manage emulator data |

The script exports `FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST`, and `FIREBASE_STORAGE_EMULATOR_HOST`. The Spring application detects the Auth and Firestore variables automatically.

The API upload endpoint intentionally stores image files in `data/uploads/posts`. This is separate from the Firebase Storage emulator's internal blob directory and makes local image files easy to inspect and back up. The Storage emulator remains available for frontend Firebase Storage work.

## 3. Start the Spring Boot API

Open a second PowerShell window. Keep the emulator window running, then start the API with the local backend script:

```powershell
.\scripts\run-backend-local.ps1
```

The API listens on `http://localhost:8080`.

The backend script exports the emulator variables in the same process that starts Spring Boot. If you prefer to run Maven directly, copy the variables first:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081'
$env:FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199'
$env:FIREBASE_PROJECT_ID = 'mjolnir-local'
.\mvnw.cmd spring-boot:run
```

## 4. Create an email/password account

Firebase Authentication owns passwords. The API never receives or stores a password.

The easiest option is the Emulator UI:

1. Open `http://127.0.0.1:4000`.
2. Open **Authentication**.
3. Choose **Add user**.
4. Enter an email and password.
5. Save the user.

You can also create a user through the Auth emulator REST API:

```powershell
$body = @{ email = 'alice@example.test'; password = 'password123'; returnSecureToken = $true } | ConvertTo-Json
Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key' `
  -ContentType 'application/json' `
  -Body $body
```

For an existing user, sign in and receive an ID token:

```powershell
$body = @{ email = 'alice@example.test'; password = 'password123'; returnSecureToken = $true } | ConvertTo-Json
$session = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key' `
  -ContentType 'application/json' `
  -Body $body

$token = $session.idToken
```

The frontend will later perform these same operations with the Firebase Web SDK using `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`.

## 5. Register the user profile through the API

Firebase Auth creates the identity. This endpoint creates the matching Firestore document in the `users` collection.

```powershell
$headers = @{ Authorization = "Bearer $token" }
$profile = @{ username = 'Alice' } | ConvertTo-Json
Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:8080/api/auth/register' `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body $profile
```

The request is authenticated with the Firebase ID token. The token UID becomes the Firestore user document ID.

## 6. Anonymous post reads

These endpoints do not require an account:

```powershell
Invoke-RestMethod 'http://localhost:8080/api/posts/public'
Invoke-RestMethod 'http://localhost:8080/api/posts'
Invoke-RestMethod 'http://localhost:8080/api/posts/{postId}'
```

`GET /api/posts` and `GET /api/posts/public` return active posts. Add `?type=LOST` or `?type=FOUND` to filter the results.

## 7. Create a post with an account

Post creation requires a Firebase ID token:

```powershell
$post = @{
  title = 'Black wallet'
  description = 'Found near the library entrance'
  category = 'Personal items'
  type = 'FOUND'
  location = 'Library entrance'
  pictureUrl = ''
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:8080/api/posts' `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body $post
```

The post is written to the Firestore `posts` collection with the authenticated user's UID as `userId`.

## 8. Upload an image locally

Image upload also requires the Firebase ID token:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:8080/api/uploads' `
  -Headers $headers `
  -Form @{ file = Get-Item '.\example.jpg' }
```

The response contains a URL such as `/uploads/posts/<generated-file-name>`. Files are stored under:

```text
data/uploads/posts/
```

The returned URL can be opened through `http://localhost:8080`.

## 9. Inspect data

Use the Emulator UI at `http://127.0.0.1:4000` to inspect:

- Auth users and email/password accounts
- Firestore `users` and `posts` collections
- Firebase Storage emulator objects

The local API uses Firestore emulator data for users and posts. Stop the emulator with `Ctrl+C`.

## 10. Production transition

For a deployed environment:

1. Remove the emulator environment variables.
2. Configure Application Default Credentials for the Google Cloud service account.
3. Set `FIREBASE_PROJECT_ID` to the production Firebase project.
4. Move image storage from `data/uploads` to Firebase Storage or a Google Cloud Storage bucket.
5. Keep Firebase Auth email/password as the identity provider.
6. Restrict `CORS_ALLOWED_ORIGIN` to the deployed frontend origin.

The API contract remains the same: anonymous reads, Firebase-token-protected writes, profile registration, and post retrieval.
