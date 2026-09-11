WBS Quantum v10 — Firebase Stable Build

Upload all files in this folder to the ROOT of the GitHub Pages repository.
Replace index.html and sw.js from the previous build.

Important: after deploying, hard-refresh the site (Ctrl+Shift+R on desktop) once so the v10 service worker is installed.

Firebase login now initializes Auth independently of Firestore. A Firestore permission/network problem cannot keep the login page stuck on “Firebase is still loading”.
