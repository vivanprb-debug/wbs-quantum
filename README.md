# WBS Quantum — Recode Module 20

Module 8 rebuilds the Schedule experience around the modular academic engine.

## What changed
- Added a full Day / Week academic schedule interface using the same dark glass WBS Quantum design.
- Added day strip navigation, previous/next navigation, Today control, week badges and lesson counts.
- Added current / next lesson presentation with teacher, room and bell time.
- Added detailed lesson cards for Registration, normal lessons, Science and PE.
- Added inline timetable search by subject, teacher or room.
- Added PE activity display based on the profile's PE rotation.
- Fixed PE rotation selection so Week A uses the A activity and Week B uses the B activity.
- Fixed next-lesson calculation so Registration is not presented as the main next class.
- Rebuilt the schedule view dynamically instead of depending on a missing `academic-view` element.
- Retains exact student-specific academic data for Vivan, Shriyan, Ryan, Freddie and Fionan.
- Retains the PWA architecture and increments the service-worker cache to Module 8.

## Verification
The included test suite verifies all five known profiles have complete weekday schedules, checks Fionan's supplied Week B Friday schedule and teacher/room assignments, checks Fionan's PE activity, and verifies current/next lesson behaviour.

## Module 9
The productivity workspace now provides account-scoped task, exam, and note flows with edit/delete/complete actions, search, filters, modal forms, and offline-aware sync status while keeping the WBS Quantum glass design.


## Module 11 — Streaks, Achievements & Leaderboard

- Added a secure per-user daily streak record in `streaks/{uid}`.
- Daily claiming is idempotent, so tapping Claim Today twice cannot add two days.
- Consecutive-day logic continues a streak; missing a day resets the current streak while preserving total and longest records.
- Added six streak achievements from 3 days through 100 days.
- Added a points score and live leaderboard using `leaderboard/{uid}`.
- Leaderboard displays student display name, Premium badge, streak and score only; no email or timetable data is exposed.
- Added session-generation guards and cleanup so a previous account's streak/leaderboard listener cannot remain visible after logout or account switching.
- Added a dedicated Streak navigation tab while retaining Home, Schedule, Tasks and Ask AI.
- Kept the existing Firestore security model: streak writes are self-only and leaderboard reads require authentication.
- Added Module 11 date/streak/achievement/score tests and bumped the PWA cache/version.


## Module 12 — Settings & Preferences

- Added account-scoped preferences at `users/{uid}/preferences/settings`.
- Added schedule default view, task default priority, compact task cards, streak reminder and AI suggestion preferences.
- Preferences use a per-account local cache and attempt cloud sync without blocking the app.
- Added a dedicated Settings navigation tab while preserving all existing areas.
- Fixed the Streak navigation/view ID mismatch so the Streak tab renders correctly.
- Preferences and UI are cleaned during logout/account switches.
- Added Module 12 tests and bumped the PWA cache/version.

## Module 14 — Notifications & Reminders

- Added an account-scoped notification centre for overdue/due-today/due-tomorrow tasks and upcoming exams.
- Added streak protection reminders when today's streak claim has not been made and the user's preference allows reminders.
- Added an in-app alert bell in the top bar without overcrowding the bottom navigation.
- Added optional browser notifications; permission is requested only after the user chooses Enable.
- Notification refresh is session-bound and cleared on logout/account switching.
- Clicking an alert navigates directly to the relevant workspace.
- Added date/notification unit tests and bumped the PWA cache/version to Module 14.


## Module 15 — Revision Planner

- Added account-scoped revision sessions at `users/{uid}/revisionSessions`.
- Added exam countdowns and a one-click revision plan generator based on upcoming exams.
- Added complete / reopen / delete revision sessions.
- Added per-account local cache fallback for revision sessions.
- Added session-generation guards and logout cleanup.
- Added a dedicated Revision navigation tab while preserving all existing workspaces.
- Bumped the PWA cache/version to Module 15.


## Module 16 — Insights
Adds account-scoped progress insights for tasks, revision, exams, timetable subject load, and the current-week workload map.

## Module 17 — Profile customisation
The Settings area now supports account-scoped profile personalisation: display name, favourite subject, and study goal. Values are normalised, length-limited, cached per UID, and saved under `users/{uid}/preferences/settings` using the existing per-user Firestore rules. No profile crosses account boundaries.


## Module 18 — Developer/Admin Console
- Secure developer-only Admin tab for `dev@wbsquantum.app`.
- Cloud maintenance-mode configuration at `appConfig/maintenance`.
- Cloud feature flags at `appConfig/features`.
- Frontend checks developer identity for UI access; Firestore rules enforce developer-only writes.
- Configuration reads use a local cache fallback when the cloud is unavailable.
- Account/session cleanup prevents stale admin controls after logout or account switching.


## Module 20 — Final integration & release hardening
- Added a release-shell integrity check for required views, navigation and Firebase SDK scripts.
- Added global runtime error and unhandled-promise diagnostics without blocking authentication.
- Expanded the service-worker app shell to include every local JavaScript module for stronger offline coverage.
- Bumped the PWA cache/version to Module 20.
- Added final release/integration tests.
