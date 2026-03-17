// core/logic/employees.logic.js
import { isValidEmail, isValidPhone } from '../../utils/validators.js';

export const validateEmployee = (data) => {
    if (!data.fullName) return 'El nombre es requerido';
    if (data.fullName.length > 64) return 'El nombre no puede tener más de 64 caracteres';
    if (data.email.length > 125) return 'El email no puede tener más de 125 caracteres';
    if (data.email.length <= 5) return 'El email no puede tener menos de 5 caracteres';
    if (data.username?.username.length > 30) return 'El nombre de usuario no puede tener más de 30 caracteres';
    if (!isValidEmail(data.email)) return 'El email no es válido';
    if (!isValidPhone(data.phoneEmployee)) return 'El teléfono no es válido';
    if (!data.username?.username) return 'El usuario es requerido';
    if (!data.idRole) return 'El rol es requerido';
    return null;
};

export const mapEmployeeForm = (formData) => {
    return {
        fullName: formData.txtFullName,
        email: formData.txtEmployeeEmail,
        phoneEmployee: formData.txtEmployeePhone,
        username: {
            username: formData.txtUsername
        },
        idRole: formData.cmbUserRole
    };
};
