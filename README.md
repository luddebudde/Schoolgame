# Schoolgame

## Development

`npm run dev` does not work in this repository right now because there is no `package.json`.

### Quick fix

1. Create or add the actual game project files first (`package.json`, source code, etc.).
2. Install dependencies with the package manager used by that project:
   - `npm install` if it has `package-lock.json`
   - `yarn install` if it has `yarn.lock`
3. Start the dev server (`npm run dev` or `yarn dev`).
4. Open the **Local** URL in your browser (usually `http://localhost:5173`).

Use the **Network** URL only for other devices on the same LAN.
