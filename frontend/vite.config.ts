import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const envFiles = {
  development: '.env.development',
  mobile: '.env.local',
};
dotenv.config({ path: envFiles[process.env.MODE] });

export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./frontend", import.meta.url))
    }
  },
  define: {
    'process.env': process.env
  }
});