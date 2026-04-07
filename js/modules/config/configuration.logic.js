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

export const validatePaymentMethod = (method) => {
    if (method.length < 3 || method.length > 50) {
        return 'El método de pago debe tener entre 3 y 50 caracteres.';
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]+$/.test(method)) {
        return 'El método de pago solo puede contener letras, números, espacios y guiones.';
    }
};

export const getAllPrivileges = (roles) => {
    const adminRole = roles.find(role => role.roleName === 'Administrador');
    return adminRole ? (adminRole.privileges || adminRole.privilegeList || []) : [];
};

export const getPrivilegeNameInSpanish = (privilegeName) => {
    const translations = {
        "READ_VEHICLES": "Leer Vehículos",
        "WRITE_VEHICLES": "Manipular Vehículos",
        "DELETE_VEHICLES": "Eliminar Vehículos",
        "READ_SPAREPARTS": "Leer Repuestos",
        "WRITE_SPAREPARTS": "Manipular Repuestos",
        "READ_SALES": "Leer Ventas",
        "WRITE_SALES": "Manipular Ventas",
        "CANCEL_SALE": "Cancelar Venta",
        "READ_EMPLOYEES": "Leer Empleados",
        "WRITE_EMPLOYEES": "Manipular Empleados",
        "READ_CUSTOMERS": "Leer Clientes",
        "WRITE_CUSTOMERS": "Manipular Clientes",
        "READ_WORK_ORDERS": "Leer Órdenes de Trabajo",
        "WRITE_WORK_ORDERS": "Manipular Órdenes de Trabajo",
        "MANAGE_SECURITY": "Gestionar Seguridad",
        "MANAGE_CONFIG": "Gestionar Configuración",
        "VIEW_DASHBOARD": "Ver Dashboard"
    };
    return translations[privilegeName] || privilegeName;
};
