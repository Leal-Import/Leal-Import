
export const validateReason = (reason) => {
    if (reason.length === 0 || reason.length > 500) return "El motivo debe tener entre 1 y 500 caracteres";
    return null;
};
