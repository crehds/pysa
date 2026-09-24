import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Without this guard a production bundle would silently call the
  // visitor's own localhost instead of the deployed backend.
  if (command === 'build' && mode === 'production' && !env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL must be set for production builds, e.g. VITE_API_URL=https://api.example.com npm run build'
    );
  }

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.js'],
    },
  };
});
