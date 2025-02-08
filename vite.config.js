import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';  // Import path module
import withMT from "@material-tailwind/react/utils/withMT";

// https://vite.dev/config/
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
      '@': path.resolve(__dirname, './src'),  // Alias for 'src' folder
    },
  },
}));
