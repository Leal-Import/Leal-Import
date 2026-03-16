export const IMAGE_CONFIG = {
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg']
};

export const validateImageType = (files = [], allowedTypes = IMAGE_CONFIG.ALLOWED_TYPES) => {
    const normalized = normalizeFiles(files);
    const invalid = normalized.find(f => !allowedTypes.includes(f.type));
    return invalid ? 'Formato de imagen no permitido (jpg, png, jpeg)' : null;
};

export const validateImageSize = (files = [], maxSizeMB = IMAGE_CONFIG.MAX_SIZE_MB) => {
    const normalized = normalizeFiles(files);
    const maxBytes = maxSizeMB * 1024 * 1024;
    const invalid = normalized.find(f => f.size > maxBytes);
    return invalid ? `Cada imagen debe pesar máximo ${maxSizeMB}MB` : null;
};

export const validateImagesGeneral = (files) => {
    return validateImageType(files) || validateImageSize(files);
};

const normalizeFiles = (input) => {
    if (!input) return [];
    const filesArray = Array.isArray(input) ? input : [input];
    return filesArray
        .map(i => i instanceof File ? i : i?.file instanceof File ? i.file : null)
        .filter(Boolean);
};
