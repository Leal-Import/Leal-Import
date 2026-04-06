/**
 * Utilidades de Sanitización
 * Este módulo proporciona funciones para prevenir XSS (Cross-Site Scripting)
 * al sanitizar entradas de usuario, especialmente desde URL parameters.
 * @module sanitizer
 */

/**
 * Sanitiza entrada de texto eliminando posible contenido HTML/JS malicioso
 * Usa creación de elemento DOM para escapar caracteres especiales
 * @param {string|null|undefined} input - Texto a sanitizar
 * @returns {string} Texto sanitizado o cadena vacía
 * @example
 * const malicious = '<img src=x onerror="alert(1)">';
 * sanitizeHTMLInput(malicious); // Devuelve el texto sin ejecutar script
 */
export const sanitizeHTMLInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input; // Escapa HTML automáticamente
    return div.innerHTML;
};

/**
 * Sanitiza parámetros de URL específicamente
 * Los parámetros de URL pueden contener valores manipulados manualmente
 * @param {string|null} param - Parámetro de URL obtenido con URLSearchParams
 * @param {string} defaultValue - Valor por defecto si el parámetro está vacío
 * @returns {string} Parámetro sanitizado
 * @example
 * const customerName = sanitizeURLParam(
 *     params.get('customerName'),
 *     'Cliente'  // default value
 * );
 */
export const sanitizeURLParam = (param, defaultValue = '') => {
    if (!param || typeof param !== 'string') return defaultValue;
    const trimmed = param.trim();
    if (trimmed.length === 0) return defaultValue;
    return sanitizeHTMLInput(trimmed);
};

/**
 * Valida y sanitiza números desde URL parameters
 * Previene inyección mientras retorna números válidos
 * @param {string|null} param - Parámetro numérico de URL
 * @param {number} defaultValue - Valor por defecto
 * @returns {number} Número validado o default
 */
export const sanitizeURLNumber = (param, defaultValue = 0) => {
    if (!param) return defaultValue;
    const num = parseFloat(param);
    return Number.isFinite(num) ? num : defaultValue;
};

/**
 * Valida que un string sea seguro para usar en atributos HTML
 * Verifica que no contenga caracteres especiales peligrosos
 * @param {string} input - String a validar
 * @returns {boolean} true si es seguro
 */
export const isHTMLSafe = (input) => {
    if (!input) return true;
    // Caracteres peligrosos para HTML
    const dangerousChars = /[<>"'&]/g;
    return !dangerousChars.test(input);
};

/**
 * Escapa caracteres especiales HTML
 * Alternativa a sanitizeHTMLInput si solo necesitas escapar
 * @param {string} input - Text a escapar
 * @returns {string} HTML escapado
 */
export const escapeHTML = (input) => {
    if (!input) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(input).replace(/[&<>"']/g, char => map[char]);
};
