// core/logic/employees.logic.js
import { isValidEmail, isValidPhone } from '../../utils/validators.js';

export const validateEmployee = (data) => {
    if (!data.fullName) return 'El nombre es requerido';
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
