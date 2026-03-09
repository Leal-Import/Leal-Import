import { isValidEmail, isValidPhone } from "../../utils/validators.js";

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

export function validatePassword(pw1, pw2) {
    if (pw1 !== pw2) {
        return 'Las contraseñas no coinciden.';
    }
    if (!pw1 || pw1.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!pw1 || pw1.length > 20) {
        return 'La contraseña debe tener hasta 20 caracteres.';
    }
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!re.test(pw1)) {
        return 'La contraseña debe incluir 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.';
    }
    return null;
}

export const validateUsernameChange = (currentUsername, newUsername, password) => {
    if (!currentUsername || !newUsername || !password) {
        return 'Todos los campos son obligatorios.';
    }
    if (newUsername.length < 4) {
        return 'El nuevo nombre de usuario debe tener al menos 4 caracteres.';
    }
    if (newUsername === currentUsername) {
        return 'El nuevo nombre de usuario debe ser diferente al actual.';
    }
    return null;
}

export const validateProfile = (fullName, email, phone) => {
    if (!fullName || !email || !phone) {
        return 'Todos los campos son obligatorios.';
    }

    if (!isValidEmail(email)) {
        return 'El correo electrónico no es válido.';
    }

    if (!isValidPhone(phone)) {
        return 'El número de teléfono no es válido. Debe contener 8 dígitos.';
    }
    return null;
}