export const validatePassword = (pw1, pw2) => {
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
};

export const getScore = (val) => {
    const checks = [
        val.length >= 8,
        /[A-Z]/.test(val),
        /[a-z]/.test(val),
        /[0-9]/.test(val),
        /[^A-Za-z0-9]/.test(val)
    ];
    return checks.filter(Boolean).length; // 0–5
};

export const getPasswordStrengthOptions = (score) => {
    switch (score) {
    case 1: return { type: 'Muy débil', color: '#d9534f' };
    case 2: return { type: 'Débil', color: '#f0ad4e' };
    case 3: return { type: 'Regular', color: '#5cb85c' };
    case 4: return { type: 'Fuerte', color: '#5bc0de' };
    case 5: return { type: 'Muy fuerte', color: '#563d7c' };
    default: return { type: '', color: '' };
    }
};

export const validateMatch = (pw1, pw2, hint) => {
    const match = pw1.value === pw2.value && pw2.value.length > 0;
    if (hint) {
        hint.textContent = pw2.value.length === 0 ? '' : match ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden';
        hint.className = 'modalNewPasswordMatchHint' + (pw2.value.length === 0 ? '' : match ? ' ok' : ' err');
    }
    pw2.classList.toggle('inputValid', match);
    pw2.classList.toggle('inputInvalid', pw2.value.length > 0 && !match);
};
