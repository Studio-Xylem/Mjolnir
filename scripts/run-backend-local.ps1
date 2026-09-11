$ErrorActionPreference = 'Stop'

$env:FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081'
$env:FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199'
$env:FIREBASE_PROJECT_ID = 'mjolnir-local'

.\mvnw.cmd spring-boot:run
