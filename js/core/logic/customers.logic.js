import { isValidPhone } from '../../utils/validators.js';

export const validateCustomer = (data) => {
    const fullName = data.fullName || '';
    if (!fullName) {
        return 'El nombre es requerido';
    }
    if (fullName.length < 3 || fullName.length > 75) {
        return 'El nombre debe tener entre 3 y 75 caracteres';
    }
    const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’ ]{3,75}$/;
    if (!namePattern.test(fullName)) {
        return 'El nombre contiene caracteres no válidos';
    }

    if (!/^[0-9]{8}-[0-9]$/.test(data.dui)) {
        return 'El DUI debe tener el formato XXXXXXXX-Y';
    }

    if (!isValidPhone(data.personalPhone)) {
        return 'Número de teléfono inválido (9 dígitos, comienza con 2, 6 o 7)';
    }

    return null; // ✔ todo OK
};

export const mapCustomerForm = (formData) => {
    return {
        fullName: formData.txtFullName,
        dui: formData.txtCustomerDUI,
        personalPhone: formData.txtCustomerPhone
    };
};
