$ErrorActionPreference = 'Stop'

$javaVersionLine = (& java -version 2>&1 | Select-Object -First 1)
if ($javaVersionLine -notmatch '"(\d+)') {
    throw "Could not determine the installed Java version. Firebase emulators require Java 21 or later."
}
if ([int]$Matches[1] -lt 21) {
    throw "Firebase emulators require Java 21 or later. Found: $javaVersionLine"
}

$env:FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081'
$env:FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199'

npx.cmd --yes firebase-tools emulators:start --project mjolnir-local --only auth,firestore,storage
