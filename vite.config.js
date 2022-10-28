import { defineConfig, loadEnv } from 'vite'
import path from 'path'
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      __APP_ENV__: env.APP_ENV
    },
    root: path.resolve(__dirname, 'src'),
    build: {
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        main:path.resolve(__dirname, 'src/index.html'),
        login: path.resolve(__dirname, 'src/login/login.html'),
        dashboard: path.resolve(__dirname, 'src/dashboard/dashboard.html')
      }
    }
  }
  }

})