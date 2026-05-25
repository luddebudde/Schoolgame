import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true, // listen on 0.0.0.0 so other devices on the network can reach it
    proxy: {
      // Forward all socket.io traffic to the game server.
      // This means only ONE port (Vite's) needs to be open/forwarded.
      "/socket.io": {
        target: "http://localhost:3001",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
