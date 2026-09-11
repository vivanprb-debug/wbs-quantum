# WBS Quantum AI deployment

The browser never contains the Gemini API key. The key must be stored as a Firebase Cloud Secret.

## 1. Install Firebase CLI

Use the Firebase CLI on a computer with access to the `wbs-quantam` Firebase project.

## 2. Set the Gemini secret

Run:

`firebase functions:secrets:set GEMINI_API_KEY`

When prompted, paste the Gemini API key. Do not put the key in `index.html`, `src/`, GitHub, or a committed `.env` file.

## 3. Deploy the function

From the project root:

`firebase deploy --only functions`

The frontend calls the `askGemini` callable function only after Firebase Authentication succeeds.

## 4. GitHub Pages

GitHub Pages hosts the PWA frontend. Firebase Cloud Functions hosts the private AI endpoint. The API secret therefore stays server-side.

## 5. Billing

Cloud Functions deployment may require a Firebase/Google Cloud billing-enabled project depending on the account and configuration. Check the Firebase console if deployment reports a billing requirement.
