// core/logic/employees.logic.js
import { isValidEmail, isValidPhone } from '../../utils/validators.js';

export function validateEmployee(data) {
    if (!data.fullName) {
        return 'El nombre es requerido';
    }
    if (!isValidEmail(data.email)) {
        return 'El email no es válido';
    }
    if (!isValidPhone(data.phoneEmployee)) {
        return 'El teléfono no es válido';
    }
    return null; // ✔ todo OK
}

export function mapEmployeeForm(formData) {
    return {
        fullName: formData.txtFullName,
        email: formData.txtEmployeeEmail,
        phoneEmployee: formData.txtEmployeePhone,
        username: {
            username: formData.txtUsername
        },
        idRole: formData.cmbUserRole
    };
}