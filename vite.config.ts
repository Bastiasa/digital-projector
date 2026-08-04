import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs';
import path from 'path';

const packageJson = JSON.parse(
  readFileSync('./package.json', 'utf8')
);

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir:"dist-ui"
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [react(), tailwindcss()],
    define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  }
})
