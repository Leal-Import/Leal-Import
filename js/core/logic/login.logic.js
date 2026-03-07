import { showMessage } from "../../utils/dom.js";
import { removeCountdown, updateCountdownUI } from "../dom/login.dom.js";

export function renderMaskedEmail(modalCodeBody, email) {
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
        state.countdown.remainingSeconds--;
        if (state.countdown.remainingSeconds <= 0) {
            clearCountdown(state, modalCodeBody);
            await showMessage("Codigo expirado", "El código ha expirado. Solicita uno nuevo.", "warning");
        } else {
            updateCountdownUI(modalCodeBody, state);
        }
    }, 1000);
}

export function validatePassword(pw) {
    if (!pw || pw.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
    }
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!re.test(pw)) {
        return 'La contraseña debe incluir 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.';
    }
    return null;
}

export function getScore(val) {
    const checks = [
        val.length >= 8,
        /[A-Z]/.test(val),
        /[a-z]/.test(val),
        /[0-9]/.test(val),
        /[^A-Za-z0-9]/.test(val),
    ];
    return checks.filter(Boolean).length; // 0–5
}

export function getPasswordStrengthOptions(score) {
    switch (score) {
        case 1: return { type: 'Muy débil', color: '#d9534f' };
        case 2: return { type: 'Débil', color: '#f0ad4e' };
        case 3: return { type: 'Regular', color: '#5cb85c' };
        case 4: return { type: 'Fuerte', color: '#5bc0de' };
        case 5: return { type: 'Muy fuerte', color: '#563d7c' };
        default: return { type: '', color: '' };
    }
}

export function validateMatch(pw1, pw2, hint) {
    const match = pw1.value === pw2.value && pw2.value.length > 0;
    if (hint) {
        hint.textContent = pw2.value.length === 0 ? '' : match ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden';
        hint.className = 'modalNewPasswordMatchHint' + (pw2.value.length === 0 ? '' : match ? ' ok' : ' err');
    }
    pw2.classList.toggle('inputValid', match);
    pw2.classList.toggle('inputInvalid', pw2.value.length > 0 && !match);
}