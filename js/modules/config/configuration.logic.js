import { isValidEmail, isValidPhone } from "../../utils/validators.js";

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
};

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
};

