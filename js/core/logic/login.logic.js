import { showMessage } from "../../utils/dom.js";
import { removeCountdown, updateCountdownUI } from "../dom/login.dom.js";

export const renderMaskedEmail = (modalCodeBody, email) => {
    const span = modalCodeBody?.querySelector('p span b');
    if (span) span.textContent = maskEmailSimple(email);
};

export const maskEmailSimple = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    const first = name.charAt(0);
    return `${first}...@${domain}`;
};

export const clearCountdown = (state, modalCodeBody) => {
    if (state.countdown.timer) {
        clearInterval(state.countdown.timer);
        state.countdown.timer = null;
    }
    removeCountdown(modalCodeBody);
};

export const clearCurrentFlow = (state, modalCodeBody) => {
    state.auth.email = '';
    state.auth.resetId = '';
    state.auth.ticket = '';
    clearCountdown(state, modalCodeBody);
};

export const startCountdown = (minutes, state, modalCodeBody) => {
    clearCountdown(state, modalCodeBody);
    state.countdown.remainingSeconds = (minutes || 15) * 60;
    updateCountdownUI(modalCodeBody, state);

    state.countdown.timer = setInterval(async() => {
        state.countdown.remainingSeconds--;
        if (state.countdown.remainingSeconds <= 0) {
            clearCountdown(state, modalCodeBody);
            await showMessage("Codigo expirado", "El código ha expirado. Solicita uno nuevo.", "warning");
        } else {
            updateCountdownUI(modalCodeBody, state);
        }
    }, 1000);
};
