# Schoolgame

## Development

This repository currently only contains this README, so `npm run dev` will fail with:

- `ENOENT: no such file or directory, open '.../package.json'`

That means there is no frontend app configured here yet (with npm or yarn scripts).

### About "Network" in dev servers

If you are using a Vite/React project in another folder, use the **Local** URL (usually `http://localhost:5173`) in your browser first.  
The **Network** URL is for other devices on your LAN and may not load on your machine depending on setup/firewall.

You do **not** need yarn specifically; use whichever package manager the project is configured for (`npm` if it has `package-lock.json`, `yarn` if it has `yarn.lock`).
