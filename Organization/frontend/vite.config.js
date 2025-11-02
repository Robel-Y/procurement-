import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["maplibre-gl"], // Force Vite to pre-bundle maplibre-gl
  },
  build: {
    commonjsOptions: {
      include: [/maplibre-gl/, /node_modules/],
    },
  },
});
