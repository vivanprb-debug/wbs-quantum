WBS Quantum Dashboard — 2026-2027 v9

Key fixes:
- Fionan now correctly uses the Vivan/base timetable as requested. The broken duplicate Fionan object that caused profile/greeting corruption has been removed.
- Greeting lookup is type-safe, so a timetable object cannot accidentally appear as the student's name.
- Maintenance mode now applies the local developer change immediately and treats Firestore permission failures as a non-blocking cloud-sync issue. Local developer access can therefore get past the maintenance screen without an "insufficient permissions" popup.
- Cloud maintenance still needs the real developer Firebase account and deployed Firestore rules to change the maintenance state for every student.
- Service-worker cache bumped to v9 so GitHub Pages/PWA clients refresh the new build.

Premium features:
- Focus Timer
- Quick Note
- Next Class
- Streak Achievements
- Task Pulse
- Exam Countdown
- Quick Study Plan
- Timetable Search

Accounts/profiles:
- Vivan
- Shriyan
- Ryan
- Freddie
- Fionan

Firebase setup:
1. Deploy firestore.rules.txt in Firebase Console > Firestore Database > Rules.
2. For cloud-wide maintenance changes, sign in with the actual Firebase developer account whose email is dev@wbsquantum.app.
3. Students can write only their own streak record; authenticated users can read streaks.
4. After replacing the GitHub Pages files, hard-refresh/reopen the PWA once so service worker v9 activates.

Security note:
- The local developer email unlock is only a convenience for this device. It is not a security boundary. Protected Firebase operations still depend on Firebase Authentication + Firestore Rules.
- Never place private server/API secrets or user passwords in index.html.


Important v9 fixes:
- Fionan profile timetable is isolated from other users and mapped by UID plus email fallback.
- Profile switching resets the timetable to the base schedule before applying the signed-in profile.
- Developer maintenance controls now support a local override so a non-admin signed-in account is not trapped by Firestore permission errors.
- Service worker cache bumped to v9.
