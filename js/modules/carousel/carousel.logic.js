import { validateImagesGeneral, validateImageSize, validateImageType } from "../../utils/images.validators.js";

export const addImageToCarouselState = (state, imageArrayName, file) => {
    state[imageArrayName].push({
        id: file.id || null,
        url: file.url || URL.createObjectURL(file),
        file: file instanceof File ? file : null,
        isNew: file instanceof File
    });
};

export const addMultipleImagesToCarouselState = (state, imageArrayName, files) => {
    files.forEach(file => addImageToCarouselState(state, imageArrayName, file));
};

export const removeImageFromCarouselState = (state, imageArrayName, imagesToDeleteIdsArrayName, index) => {
    const images = state[imageArrayName];
    const img = images[index];

    if (!img.isNew && img.id) {
        state[imagesToDeleteIdsArrayName].push(img.id);
    }

    images.splice(index, 1);
};

export const validateNewImages = (currentImages = [], newFiles = null, max = 12) => {
    // Normalizar siempre a array
    const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];

    // Filtrar solo los File reales para validaciones de formato/duplicados
    const realFiles = filesArray.filter(f => f instanceof File);

    if (realFiles.length > 0) {
        const formatError = validateImagesGeneral(realFiles);
        if (formatError) return formatError;

        const duplicateError = validateDuplicateImages(currentImages, realFiles);
        if (duplicateError) return duplicateError;
    }

    // El máximo aplica para todo (Files y objetos del servidor)
    const maxError = validateMaxImages(currentImages, filesArray, max);
    if (maxError) return maxError;

    return null;
};

export const validateMaxImages = (currentImages = [], newFiles = [], max = 12) => {
    if (currentImages.length + newFiles.length > max) {
        return `Máximo ${max} imágenes permitidas`;
    }
    return null;
};

export const validateDuplicateImages = (currentImages = [], newFiles = []) => {
    console.log("Validando duplicados entre:", currentImages, "y", newFiles);
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
};

export const cleanupObjectUrls = (images) => {
    images.forEach(img => {
        if (img.url && img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
        }
    });
};

export const validateBaseImages = (images) => {
    // 🔹 Al menos una imagen
    if (images.length === 0) {
        return {
            title: "Imagen requerida",
            message: "Se debe incluir al menos una imagen."
        };
    }
    // 🔹 Máximo permitido
    if (images.length > 12) {
        return {
            title: "Límite de imágenes",
            message: "El máximo de imágenes permitidas es de 12."
        };
    }
    // 🔹 Validar tamaño (usa normalización interna)
    const sizeError = validateImageSize(images);
    if (sizeError) {
        return {
            title: "Tamaño de imagen inválido",
            message: sizeError
        };
    }
    // 🔹 Validar tipo (usa normalización interna)
    const typeError = validateImageType(images);
    if (typeError) {
        return {
            title: "Formato de imagen inválido",
            message: typeError
        };
    }
    return null;
};

export const mapCarouselImages = (fd, images ) => {
    images.filter(img => img.isNew).forEach(img => fd.append("photos", img.file));
};

export const validateEditImages = (totalFinal) => {
    if (totalFinal === 0) {
        return {
            title: 'Imagen validación',
            message: 'Debes mantener al menos una imagen'
        };
    }

    if (totalFinal > 12) {
        return {
            title: 'Límite de imágenes',
            message: `Máximo 12 imágenes`
        };
    }

    return null;
};
