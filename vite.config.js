/* global process */
import { defineConfig, loadEnv } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const pagesDirectory = resolve(projectRoot, 'pages');
const pageInputs = Object.fromEntries(
    readdirSync(pagesDirectory)
        .filter((fileName) => fileName.endsWith('.html'))
        .map((fileName) => [
            `pages/${fileName.slice(0, -'.html'.length)}`,
            resolve(pagesDirectory, fileName)
        ])
);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        build: {
            rollupOptions: {
                input: {
                    index: resolve(projectRoot, 'index.html'),
                    ...pageInputs
                }
            }
        },
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
