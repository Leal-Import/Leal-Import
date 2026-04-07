let privileges = [];

export const setUserPrivileges = (privilegeList = []) => {
    if (!Array.isArray(privilegeList)) return;
    privileges = privilegeList
        .filter(privilege => typeof privilege === 'string' && privilege.trim());
};

export const clearUserPrivileges = () => {
    privileges = [];
};

export const getUserPrivileges = () => privileges;

export const hasPrivilege = (privilege) => {
    if (!privilege || typeof privilege !== 'string') return false;
    return privileges.includes(privilege);
};

export const canAccess = (requiredPrivileges = []) => {
    if (!requiredPrivileges || requiredPrivileges.length === 0) return true;
    return requiredPrivileges.some(privilege => privileges.includes(privilege));
};

export const requireAccess = (requiredPrivileges = []) => {
    if (!canAccess(requiredPrivileges)) {
        const error = new Error('No tienes permiso para esta acción.');
        error.status = 403;
        throw error;
    }
};
