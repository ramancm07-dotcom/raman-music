# Raman Music

A Spotify-inspired music web app starter built with React + Vite.

## Features
- Responsive dark music-player interface
- Search the demo catalog
- Play/pause, previous/next, seek and volume controls
- Like tracks and create local playlists
- Jamendo API integration when a client ID is configured
- Free demo audio stream for testing

## Run on your Windows laptop
1. Install Node.js LTS from https://nodejs.org/
2. Extract this ZIP.
3. Open the extracted folder in VS Code.
4. Open Terminal > New Terminal.
5. Run:
   ```bash
   npm install
   npm run dev
   ```
6. Open the local URL printed in the terminal (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Optional real catalog
Create a Jamendo developer application and get a client ID from https://devportal.jamendo.com/.
Create `.env.local` in the project root:
```env
VITE_JAMENDO_CLIENT_ID=your_client_id_here
```
Restart the dev server. The app will query Jamendo's public track API. Track availability and playback depend on Jamendo's API terms and individual track licences.

## Deploy publicly
1. Push this project to a GitHub repository you own.
2. Sign in at https://vercel.com/ and import the repository.
3. Vercel should detect Vite automatically. Build command: `npm run build`; output directory: `dist`.
4. Add `VITE_JAMENDO_CLIENT_ID` under Project Settings > Environment Variables if using the API, then redeploy.
5. Open the production URL and test playback on desktop and mobile.

This is an independent music app, not the official Spotify service. It does not include Spotify's catalogue or account system. Do not upload copyrighted music without the necessary rights.
