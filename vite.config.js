import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import withMT from "@material-tailwind/react/utils/withMT";

export default defineConfig(withMT({
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
      proxy: {
          '/api': {
              target: 'http://localhost:3001', // Correct URL and port!
              changeOrigin: true,
          },
      },
  },
}));