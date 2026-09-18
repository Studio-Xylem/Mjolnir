# Mjolnir project context

Mjolnir is a lost-and-found application built for low-cost local development and later deployment with Spring Boot, PostgreSQL, JWT authentication, Cloudinary, GitHub Pages, and Render.

## Stack

- Java 17 and Spring Boot 4 backend
- Spring Data JPA with PostgreSQL-compatible persistence
- Neon PostgreSQL for hosted persistence
- Spring Security with stateless JWT email/password authentication
- Cloudinary for image storage
- React and Vite frontend
- GitHub Pages frontend deployment
- Render backend deployment

Firebase, Firestore, Google authentication, and emulator services are not used.

## Local development

The backend uses file-based H2 by default for a zero-setup smoke test. For PostgreSQL-compatible local development:

```powershell
$env:JDBC_DATABASE_URL = 'jdbc:postgresql://localhost:5432/mjolnir'
$env:DB_USERNAME = 'postgres'
$env:DB_PASSWORD = 'postgres'
$env:JWT_SECRET = 'replace-with-at-least-32-characters'
.\mvnw.cmd spring-boot:run
```

Set `CLOUDINARY_URL` before testing image uploads. Without it, the API starts but upload requests return a clear configuration error.

## Authentication API

- `POST /api/auth/register` accepts `username`, `email`, and `password` and returns `{ token, user }`.
- `POST /api/auth/login` accepts `email` and `password` and returns `{ token, user }`.
- `GET /api/auth/me` requires `Authorization: Bearer <jwt>`.

Passwords are stored as BCrypt hashes. JWTs are stateless and expire according to `JWT_LIFETIME`.

## Post API

Public reads:

- `GET /api/posts`
- `GET /api/posts/public`
- `GET /api/posts/{id}`
- `GET /api/posts/{id}/matches`

Authenticated operations:

- `POST /api/posts`
- `POST /api/posts/lost`
- `GET /api/posts/mine`
- `PATCH /api/posts/{id}`
- `DELETE /api/posts/{id}`
- `PATCH /api/posts/{id}/resolve`

`FOUND` posts use `currentCustody` values `SELF` or `CUSTODY`. Self custody requires `contactType` and `contactValue`; custody requires `custodyLocation`. Lost posts use `lostAt`, found posts use `foundAt`.

## Configuration

Backend settings are environment-driven:

- `JDBC_DATABASE_URL` or `DATABASE_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JPA_DDL_AUTO`
- `JWT_SECRET`
- `JWT_LIFETIME`
- `CLOUDINARY_URL`
- `CORS_ALLOWED_ORIGIN`

The frontend uses `VITE_API_BASE_URL`. For a GitHub Pages project site, set `VITE_API_BASE_URL` to the Render API URL and `VITE_BASE_PATH` to `/<repository-name>/`.

## Deployment notes

- Render should provide the database URL, `JWT_SECRET`, `CLOUDINARY_URL`, and `CORS_ALLOWED_ORIGIN`.
- Neon connections should use SSL and a small connection pool.
- Render filesystem storage is ephemeral; images must remain in Cloudinary.
- H2 is for local smoke tests only. Use PostgreSQL locally when validating SQL behavior.
