# Template project for Firebase and Angular

## Setup

1. Install Node.js (LTS) - <https://nodejs.org/en/>
3. Install Firebase CLI - <https://github.com/firebase/firebase-tools>
4. `firebase login`
5. [Set GOOGLE_APPLICATION_CREDENTIALS](#setting-google_application_credentials-for-testing) if needed for emulator or testing

### Setting GOOGLE_APPLICATION_CREDENTIALS for testing

If you need this for emulator or testing. Get servicekey ([blaz]) and save it to `./environment/developer-access.<project-name>.servicekey.json`

Add environmental variable `GOOGLE_APPLICATION_CREDENTIALS = "<path-to>/environment/developer-access.<project-name.servicekey.json"`

Power-Shell:
```ps
[System.Environment]::SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", (Join-Path (Get-Location) "environment\developer-access-<project-name-servicekey.json"), [System.EnvironmentVariableTarget]::User)
```
