import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true, // listen on 0.0.0.0 so other devices on the network can reach it
  },
});
