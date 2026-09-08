# Mjolnir project context

## Purpose

Mjolnir is an early-stage lost-and-found application. Its domain model supports users creating **LOST** or **FOUND** posts, attaching an optional image and location, tracking custody, and resolving a post.

## Technology

- Java 17 with Spring Boot 4.0.8 and Maven
- Spring MVC, validation, and Actuator dependencies
- Google Cloud Firestore through `firebase-admin` and `google-cloud-firestore`
- A small TypeScript Firebase client layer under `src/main/resources/frontend`
- Firebase Authentication, Firestore, and Cloud Storage on the client

## Repository layout

```text
src/main/java/com/Xylem/Mjolnir/
  MjolnirApplication.java     Spring Boot entry point
  model/                      Firestore-backed domain objects and enums
  repository/                 Firestore data-access classes
src/main/resources/
  application.properties      Application name only
  frontend/src/
    models/                   TypeScript domain types and DTOs
    services/                 Firebase, Firestore, and Storage helpers
src/test/java/                Spring Boot context-load test
pom.xml                       Maven dependencies and build configuration
```

## Domain model

### User (`users` collection)

- `id`: Firestore document ID
- `username`
- `createdAt`: Firestore server timestamp

### Post (`posts` collection)

- `id`: Firestore document ID
- `userId`, `title`, `description`, `category`, `location`
- `pictureUrl` (optional)
- `type`: `LOST` or `FOUND`
- `status`: `ACTIVE` or `RESOLVED`
- `currentCustody`
- `createdAt`: Firestore server timestamp

New Java `Post` instances default to `ACTIVE`. The TypeScript `postService.create` similarly assigns `ACTIVE`, an empty image URL when absent, empty custody, and the current Firebase timestamp.

## Backend API capabilities

- Firebase ID tokens are validated by the backend for all non-GET `/api/**` operations.
- `POST /api/auth/register` provisions one profile for the signed-in Firebase user; `GET /api/auth/me` retrieves it.
- Public endpoints list active posts or retrieve a post. Authenticated users can create posts and list their own posts.
- Only a post owner can resolve it through `PATCH /api/posts/{id}/resolve`; a Firestore transaction prevents a second resolution.
- Global validation and JSON error responses are provided by the REST exception handler.
- The included Dockerfile packages the service for Google Cloud Run.
- The TypeScript Firebase helpers remain as reference material for the future frontend.

## Current gaps and cautions

- Firestore uses Application Default Credentials. Set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON file (or otherwise configure ADC); set `FIREBASE_PROJECT_ID` when the project cannot be inferred.
- The frontend directory has source helpers only: no visible package manifest, build configuration, pages/components, or authentication flows.
- The Firestore queries that combine filters with `orderBy(createdAt)` may require composite indexes in Firebase.
- Firebase Authentication sign-up/sign-in is intentionally performed by the React client. The backend accepts Firebase ID tokens rather than user passwords.

## Run and test

Use the Maven wrapper from the repository root:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Running the application requires valid Application Default Credentials for the Firebase project.

See `setup.md` for the full API contract, Firebase configuration, Cloud Run deployment, and frontend handoff.
