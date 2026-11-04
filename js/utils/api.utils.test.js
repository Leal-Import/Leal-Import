import { beforeEach, describe, expect, test, vi } from 'vitest';
import { apiRequest } from './api.utils.js';

describe('apiRequest error payloads', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test('does not expose an HTML gateway error page to the UI', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(
            '<!DOCTYPE html><html><head><title>502</title></head><body>Bad Gateway</body></html>',
            { status: 502, headers: { 'content-type': 'text/html' } }
        ))));

        await expect(apiRequest('/api/auth/login', {}, 'Error al iniciar sesión'))
            .rejects.toMatchObject({
                status: 502,
                message: 'Error al iniciar sesión. Código: 502'
            });
    });

    test('keeps a useful JSON error message from the API', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(
            JSON.stringify({ message: 'Usuario o contraseña incorrectos.' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        ))));

        await expect(apiRequest('/api/auth/login', {}, 'Error al iniciar sesión'))
            .rejects.toMatchObject({
                status: 401,
                message: 'Usuario o contraseña incorrectos.'
            });
    });
});
