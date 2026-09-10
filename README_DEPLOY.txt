WBS Quantum Dashboard — 2026-2027 final bundle

Included updates:
- Freddie's exact 2026-2027 Week A / Week B timetable.
- Freddie's exact teachers and rooms, including Science rooms S4/S9/S13.
- Freddie's exact PE activity rotation.
- West Bridgford weather card using the existing Open-Meteo / UK Met Office UKV setup.
- Daily streak saved per Firebase UID.
- Shared Streak Leaderboard for Vivan, Shriyan, Ryan and Freddie, plus any additional authenticated streak records.
- Developer homework recipient selector for the four known student UIDs.
- Developer maintenance mode with a Firebase appConfig/maintenance flag.
- Updated service-worker cache version so the new build replaces the previous cached app.

Firebase setup required:
1. Deploy firestore.rules.txt in the Firebase Firestore Rules panel.
2. The maintenance controls are available only when the signed-in Firebase account email is exactly dev@wbsquantum.app.
3. Students can only write their own streak record. Authenticated users can read the leaderboard.
4. The developer account is allowed to distribute homework to the selected student user documents.
5. After replacing the hosted files, reload the PWA once so the new service worker activates.

Important: the Firebase web configuration is intentionally included in the frontend because Firebase web apps require it. Do not put private server secrets in index.html.


Version 5 upgrades:
- Weather now includes a simple clothing suggestion based on feels-like temperature, rain chance, and wind.
- Local developer-mode unlock in Settings > Developer Panel: type the configured developer email on your signed-in account. This is a front-end convenience only, not a security boundary. Firebase-protected admin actions still require the real developer Firebase account.
- Added AI-only maintenance screen and separate app maintenance controls.
- Added online/offline status, PWA install handling, smoother card/view animations, and reduced-motion support.
