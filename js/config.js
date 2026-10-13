// Configuración centralizada de la aplicación.
// Vite carga automáticamente `.env`, `.env.local` y los archivos por modo.
// Solo las variables con prefijo VITE_ se exponen al navegador.
const viteEnv = import.meta.env || {};
const runtimeApiBaseUrl = globalThis.__LEAL_IMPORT_CONFIG__?.API_BASE_URL;
const configuredApiBaseUrl = viteEnv.VITE_API_BASE_URL
    || runtimeApiBaseUrl
    || "https://lealimportapiv2.onrender.com/api";

if (typeof configuredApiBaseUrl !== 'string' || !configuredApiBaseUrl.trim()) {
    throw new Error('VITE_API_BASE_URL no está configurada.');
}

export const config = {
    API_BASE_URL: configuredApiBaseUrl.trim().replace(/\/+$/, '')
};

export default config;
