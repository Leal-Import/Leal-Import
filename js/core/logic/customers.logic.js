import { isValidDui, isValidFullName, isValidPhone } from '../../utils/validators.js';

export const validateCustomer = (data) => {
    const fullName = data.fullName || '';

    if (!fullName) return 'El nombre es requerido';
    if (fullName.length < 3 || fullName.length > 75) return 'El nombre debe tener entre 3 y 75 caracteres';
    if (!isValidFullName(fullName)) return 'El nombre contiene caracteres no válidos';

    if (!isValidDui(data.dui)) return 'El DUI debe tener el formato XXXXXXXX-Y';

    if (!isValidPhone(data.personalPhone)) return 'Número de teléfono inválido (9 dígitos, comienza con 2, 6 o 7)';

    return null;
};

export const mapCustomerForm = (formData) => {
    return {
        fullName: formData.txtFullName,
        dui: formData.txtCustomerDUI,
        personalPhone: formData.txtCustomerPhone
    };
};
