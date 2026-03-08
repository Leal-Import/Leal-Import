/* ═══════════════════════════════════════════════════════════════
   DARK MODE INIT - CARGA ANTES DE TODO
   Este script DEBE ir en el <head> de TODAS las páginas
   para evitar el "flash" de modo claro
═══════════════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    const STORAGE_KEY = 'app.theme.dark';
    
    /*
     * Aplica el modo oscuro inmediatamente
     * Se ejecuta ANTES de que se renderice la página
     */
    function applyDarkModeImmediately() {
        const isDark = localStorage.getItem(STORAGE_KEY) === 'true';
        
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
        }
    }
    
    // Ejecutar inmediatamente
    applyDarkModeImmediately();
})();