# Mjolnir local setup

The local profile uses MySQL for persistence and the local filesystem for uploaded images. Firebase is not required for local development. Firebase Authentication remains available as an optional provider for a future deployment; Firestore and Firebase Storage are not used by the API.

## Prerequisites

- JDK 17+
- MySQL 8+
- Node.js only if building the frontend

Create a local MySQL user and database, or let the configured connection create the database:

```sql
CREATE USER 'mjolnir'@'localhost' IDENTIFIED BY 'mjolnir';
GRANT ALL PRIVILEGES ON mjolnir.* TO 'mjolnir'@'localhost';
FLUSH PRIVILEGES;
```

Override the defaults when needed:

```powershell
$env:MYSQL_URL = "jdbc:mysql://localhost:3306/mjolnir?createDatabaseIfNotExist=true&serverTimezone=UTC"
$env:MYSQL_USER = "mjolnir"
$env:MYSQL_PASSWORD = "mjolnir"
$env:LOCAL_STORAGE_PATH = "D:\data\mjolnir-uploads"
```

## Run locally

Start the API with the local profile:

```powershell
.\scripts\run-backend-local.ps1
```

The API runs at `http://localhost:8080`. The first local write request must include a development identity header:

```http
X-User-Id: local-user
X-User-Name: Local User
X-User-Email: local@example.test
```

Public `GET /api/posts` and `GET /api/posts/{id}` do not require authentication. Protected writes, profile operations, and uploads require `X-User-Id` in local mode.

Set `VITE_API_BASE_URL=http://localhost:8080` and `VITE_LOCAL_USER_ID=local-user` in the frontend environment. Frontend post/profile operations call the API, and image uploads use `POST /api/uploads` with `multipart/form-data` field `file`. Uploaded files are served below `/uploads/`.

Run tests without MySQL:

```powershell
.\mvnw.cmd test
```

Tests use an in-memory H2 database.

## Optional Firebase Authentication

To use Firebase Authentication later, run without the local profile and configure Application Default Credentials plus `FIREBASE_PROJECT_ID`. The default authentication mode is Firebase, and the backend verifies Firebase ID tokens from `Authorization: Bearer <token>`. Firebase Auth can remain on its no-cost Spark plan within its documented limits; do not enable billing or use Firestore/Storage unless deployment requirements change.

```powershell
$env:FIREBASE_PROJECT_ID = "your-project-id"
.\mvnw.cmd spring-boot:run
```

The frontend keeps Firebase Auth support in `src/main/resources/frontend/src/services/firebase.ts`, but it does not write directly to Firestore or Firebase Storage.
