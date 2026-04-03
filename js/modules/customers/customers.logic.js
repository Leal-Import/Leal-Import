import { highlightAndFocus } from '../../utils/dom.js';
import { isValidDui, isValidFullName, isValidPhone } from '../../utils/validators.js';

export const validateCustomer = (data) => {
    const fullName = data.fullName || '';

    if (fullName.length < 3 || fullName.length > 75) {
        highlightAndFocus('txtFullName');
        return 'El nombre debe tener entre 3 y 75 caracteres';
    }
    if (!isValidFullName(fullName)) {
        highlightAndFocus('txtFullName');
        return 'El nombre contiene caracteres no válidos';
    }
    if (!isValidPhone(data.personalPhone)) {
        highlightAndFocus('txtCustomerPhone');
        return 'Número de teléfono inválido (9 dígitos, comienza con 2, 6 o 7)';
    }
    if (!isValidDui(data.dui)) {
        highlightAndFocus('txtCustomerDUI');
        return 'El DUI debe tener el formato XXXXXXXX-Y';
    }
    return null;
};

export const mapCustomerForm = (formData) => {
    return {
        fullName: formData.txtFullName,
        dui: formData.txtCustomerDUI,
        personalPhone: formData.txtCustomerPhone
    };
};
