export const IMAGE_CONFIG = {
    MAX_IMAGES: 12,
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    MIN_WIDTH: 300,
    MIN_HEIGHT: 300,
    MAX_WIDTH: 6000,
    MAX_HEIGHT: 6000
};

export function validateMaxImages(currentImages = [], newFiles = [], max = IMAGE_CONFIG.MAX_IMAGES) {
    if (currentImages.length + newFiles.length > max) {
        return `Máximo ${max} imágenes permitidas`;
    }
    return null;
}

export function validateImageType(files = [], allowedTypes = IMAGE_CONFIG.ALLOWED_TYPES) {
    const normalized = normalizeFiles(files);
    const invalid = normalized.find(f => !allowedTypes.includes(f.type));
    if (invalid) {
        return 'Formato de imagen no permitido (jpg, png, jpg)';
    }
    return null;
}

export function validateImageSize(files = [], maxSizeMB = IMAGE_CONFIG.MAX_SIZE_MB) {
    const normalized = normalizeFiles(files);
    const maxBytes = maxSizeMB * 1024 * 1024;

    const invalid = normalized.find(f => f.size > maxBytes);
    if (invalid) {
        return `Cada imagen debe pesar máximo ${maxSizeMB}MB`;
    }
    return null;
}

export function validateDuplicateImages(currentImages = [], newFiles = []) {
    const exists = newFiles.find(file =>
        currentImages.some(img =>
            img.file?.name === file.name &&
            img.file?.size === file.size
        )
    );

    if (exists) {
        return 'Una o más imágenes ya fueron agregadas';
    }
    return null;
}

export function validateImagesGeneral(currentImages, newFiles) {
    return (
        validateMaxImages(currentImages, newFiles) ||
        validateImageType(newFiles) ||
        validateImageSize(newFiles) ||
        validateDuplicateImages(currentImages, newFiles)
    );
}

function normalizeFiles(input) {
    if (!input) return [];

    const filesArray = Array.isArray(input) ? input : [input];

    return filesArray
        .map(item => {
            if (item instanceof File) return item;
            if (item?.file instanceof File) return item.file;
            return null;
        })
        .filter(Boolean);
}

