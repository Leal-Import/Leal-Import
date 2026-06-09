// core/logic/employees.logic.js
import { highlightAndFocus } from '../../utils/dom.js';
import { isValidEmail, isValidFullName, isValidPhone } from '../../utils/validators.js';

export const validateEmployee = (data, selectedId = null) => {

    if (data.fullName.length > 75 || data.fullName.length <= 3) {
        highlightAndFocus('txtFullName');
        return 'El nombre debe tener entre 3 y 75 caracteres';
    }
    if (!isValidFullName(data.fullName)) {
        highlightAndFocus('txtFullName');
        return 'El nombre contiene caracteres no válidos';
    }
    if (data.email.length > 125 || data.email.length <= 5) {
        highlightAndFocus('txtEmployeeEmail');
        return 'El email no puede tener más de 125 caracteres ni menos de 5';
    }
    if (!isValidEmail(data.email)) {
        highlightAndFocus('txtEmployeeEmail');
        return 'El email no es válido';
    }
    if (!isValidPhone(data.phoneEmployee)) {
        highlightAndFocus('txtEmployeePhone');
        return 'El teléfono no es válido';
    }
    if (!data.idRole) {
        highlightAndFocus('cmbUserRole');
        return 'El rol es requerido';
    }
    if (selectedId === null) {
        if (data.user?.username.length > 30 || data.user?.username.length < 6) {
            highlightAndFocus('txtUsername');
            return 'El nombre de usuario no puede tener más de 30 caracteres ni menos de 6';
        }
    }
    return null;
};

export const mapEmployeeForm = (formData) => {
    return {
        fullName: formData.txtFullName,
        email: formData.txtEmployeeEmail,
        phoneEmployee: formData.txtEmployeePhone,
        idRole: formData.cmbUserRole,
        user: {
            username: formData.txtUsername
        }
    };
};
