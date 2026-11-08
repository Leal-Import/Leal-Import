/* global process */
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            allowedHosts: (env.VITE_ALLOWED_HOSTS || '')
                .split(',')
                .map((host) => host.trim())
                .filter(Boolean),
            proxy: {
                '/api': {
                    target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
                    changeOrigin: true,
                    secure: false
                }
            }
        }
    };
});
