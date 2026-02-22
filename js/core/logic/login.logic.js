import { showMessage } from "../../utils/dom.js";
import { removeCountdown, updateCountdownUI } from "../dom/login.dom.js";

export function renderMaskedEmail(email) {
    const span = modalCodeBody?.querySelector('p span b');
    if (span) span.textContent = maskEmailSimple(email);
}

export function maskEmailSimple(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    const first = name.charAt(0);
    return `${first}...@${domain}`;
}

export function clearCountdown(state, modalCodeBody) {
    if (state.countdown.timer) {
        clearInterval(state.countdown.timer);
        state.countdown.timer = null;
    }
    removeCountdown(modalCodeBody);
}

export function clearCurrentFlow(state, modalCodeBody) {
    state.auth.email = '';
    state.auth.resetId = '';
    state.auth.ticket = '';
    clearCountdown(state, modalCodeBody);
}


export function startCountdown(minutes, state, modalCodeBody) {
    clearCountdown(state, modalCodeBody);
    state.countdown.remainingSeconds = (minutes || 15) * 60;
    updateCountdownUI(modalCodeBody, state);

    state.countdown.timer = setInterval(async () => {
        countdownRemainingSeconds--;
        if (countdownRemainingSeconds <= 0) {
            clearCountdown();
            await showMessage("Codigo expirado", "El código ha expirado. Solicita uno nuevo.", "warning");
        } else {
            updateCountdownUI(modalCodeBody, state);
        }
    }, 1000);
}

export function validatePassword(pw) {
    if (!pw || pw.length < 10) {
        return 'La contraseña debe tener al menos 10 caracteres.';
    }
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    if (!re.test(pw)) {
        return 'La contraseña debe incluir 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.';
    }
    return null;
}