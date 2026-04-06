/**
 * DraftManager - Patrón centralizado para manejar borradores en localStorage
 * Consolida save, load, exists, clear, y restore en una sola clase
 * @module draftManager
 */

export class DraftManager {
    /**
     * @param {string} storageKey - Clave para localStorage
     * @param {object} initialState - Estado inicial por defecto
     */
    constructor(storageKey, initialState = {}) {
        this.key = storageKey;
        this.initial = structuredClone(initialState); // Deep copy
    }

    /**
     * Guarda datos en localStorage
     * @param {object} data - Datos a guardar
     */
    save(data) {
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch (error) {
            console.error(`[DraftManager] Error saving to ${this.key}:`, error);
        }
    }

    /**
     * Carga datos de localStorage
     * @returns {object} Datos guardados o estado inicial
     */
    load() {
        try {
            const saved = localStorage.getItem(this.key);
            return saved ? JSON.parse(saved) : this.initial;
        } catch (error) {
            console.error(`[DraftManager] Error loading from ${this.key}:`, error);
            return this.initial;
        }
    }

    /**
     * Verifica si existen datos guardados
     * @returns {boolean}
     */
    exists() {
        return !!localStorage.getItem(this.key);
    }

    /**
     * Elimina los datos guardados
     */
    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch (error) {
            console.error(`[DraftManager] Error clearing ${this.key}:`, error);
        }
    }

    /**
     * Restaura el borrador a un objeto state
     * Realiza un merge con Object.assign
     * @param {object} state - Objeto state a restaurar
     */
    restore(state) {
        const draft = this.load();
        Object.assign(state, draft);
    }

    /**
     * Obtiene tamaño aproximado en bytes
     * @returns {number}
     */
    size() {
        const data = localStorage.getItem(this.key);
        return data ? new Blob([data]).size : 0;
    }

    /**
     * Exporta borrador como JSON string
     * @returns {string}
     */
    export() {
        const draft = this.load();
        return JSON.stringify(draft, null, 2);
    }
}

/**
 * Limpia parámetros URL específicos del historial sin recarga
 * @param {string[]} params - Array de nombres de params a eliminar
 * @example
 * cleanOneShotParams(['isNewPart', 'idNewPart']);
 */
export const cleanOneShotParams = (params = []) => {
    const url = new URL(window.location.href);
    params.forEach(p => url.searchParams.delete(p));
    window.history.replaceState({}, document.title, url.toString());
};

/**
 * Promise-based wrapper para múltiples drafts
 * Útil para sincronizar varios borradores a la vez
 */
export class DraftManagerSync {
    constructor() {
        this.drafts = new Map();
    }

    register(key, initialState) {
        this.drafts.set(key, new DraftManager(key, initialState));
    }

    saveAll(data) {
        Object.entries(data).forEach(([key, value]) => {
            const draft = this.drafts.get(key);
            if (draft) draft.save(value);
        });
    }

    loadAll() {
        const result = {};
        this.drafts.forEach((draft, key) => {
            result[key] = draft.load();
        });
        return result;
    }

    clearAll() {
        this.drafts.forEach(draft => draft.clear());
    }

    existsAny() {
        return Array.from(this.drafts.values()).some(draft => draft.exists());
    }
}
