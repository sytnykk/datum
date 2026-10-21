import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves the site at sytnykk.github.io/datum/, so assets need that base path.
export default defineConfig({
  base: '/datum/',
  plugins: [react(), tailwindcss()],
});
