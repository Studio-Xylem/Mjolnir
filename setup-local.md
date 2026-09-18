# Local setup

## Backend

The application defaults to a file-based H2 database for quick startup. To use local PostgreSQL or Neon, set:

```powershell
$env:JDBC_DATABASE_URL = 'jdbc:postgresql://localhost:5432/mjolnir?sslmode=disable'
$env:DB_USERNAME = 'postgres'
$env:DB_PASSWORD = 'postgres'
$env:JPA_DDL_AUTO = 'update'
$env:JWT_SECRET = 'local-secret-at-least-32-characters-long'
$env:CORS_ALLOWED_ORIGIN = 'http://localhost:5173'
$env:CLOUDINARY_URL = 'cloudinary://key:secret@cloud'
.\mvnw.cmd spring-boot:run
```

Use a Cloudinary upload preset or `CLOUDINARY_URL` credentials from the Cloudinary dashboard. Do not commit credentials.

## Frontend

```powershell
Push-Location frontend
Copy-Item .env.example .env.local
npm install
npm run dev
Pop-Location
```

For production builds:

```powershell
$env:VITE_API_BASE_URL = 'https://<render-service>.onrender.com'
$env:VITE_BASE_PATH = '/<github-repository>/'
Push-Location frontend
npm run build
Pop-Location
```

## API smoke test

Register:

```powershell
$register = @{ username = 'Local User'; email = 'user@example.test'; password = 'password123' } | ConvertTo-Json
$session = Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/auth/register' -ContentType 'application/json' -Body $register
$headers = @{ Authorization = "Bearer $($session.token)" }
```

Create a lost post:

```powershell
$post = @{
  title = 'Black wallet'
  description = 'Leather wallet with an ID card'
  category = 'Personal items'
  type = 'LOST'
  location = 'Library'
  lostAt = '2026-09-17T10:00:00Z'
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/api/posts/lost' -Headers $headers -ContentType 'application/json' -Body $post
```

Anonymous reads do not require a token:

```powershell
Invoke-RestMethod 'http://localhost:8080/api/posts/public'
```
