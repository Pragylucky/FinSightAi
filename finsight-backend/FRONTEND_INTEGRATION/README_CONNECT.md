# How to connect your Frontend to this Backend

## STEP 1 — Copy these files into your frontend

Copy the entire FRONTEND_INTEGRATION/ folder contents into your frontend:

  api.js          → finsight-ai/src/services/api.js        (NEW folder)
  AuthContext.jsx → finsight-ai/src/context/AuthContext.jsx (already exists, REPLACE)
  .env.local      → finsight-ai/.env.local                  (root of frontend)

## STEP 2 — Wrap your App in AuthProvider

In your frontend: finsight-ai/src/main.jsx

Change:
  <StrictMode><App /></StrictMode>

To:
  <StrictMode><AuthProvider><App /></AuthProvider></StrictMode>

And add the import at the top:
  import { AuthProvider } from './context/AuthContext';

## STEP 3 — Replace mock calls in each page

See the CHANGES_NEEDED.md file for every exact change per page.

## STEP 4 — Add .env.local to frontend root

Create finsight-ai/.env.local:
  VITE_API_URL=http://localhost:5000/api

## STEP 5 — Start both servers

Terminal 1 (backend):
  cd finsight-backend
  npm run dev

Terminal 2 (frontend):
  cd finsight-ai
  npm run dev

Backend runs on :5000, frontend on :3000. They talk via the API client.
