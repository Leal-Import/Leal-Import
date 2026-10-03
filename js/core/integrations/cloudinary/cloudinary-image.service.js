import config from '../../../config.js';
import { apiRequest } from '../../../utils/api.utils.js';

const SIGNATURE_URL = `${config.API_BASE_URL}/cloudinary/images/upload-signature`;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const SIGNATURE_VALIDITY_MS = 60 * 60 * 1000;
const SIGNATURE_SAFETY_WINDOW_MS = 60 * 1000;

let cachedSignature = null;
let signatureExpiresAt = 0;
let signatureRequest = null;

export const uploadImage = async (file) => {
    validateFile(file);
    const signature = await getSignature();
    const response = await fetch(signature.uploadUrl, createUploadRequest(file, signature));
    const payload = await response.json().catch(() => null);

    return toMediaReference(response, payload);
};

export const uploadImages = (files = []) => Promise.all(files.map(uploadImage));

const getSignature = () => {
    if (cachedSignature && Date.now() < signatureExpiresAt) {
        return cachedSignature;
    }

    if (signatureRequest) {
        return signatureRequest;
    }

    signatureRequest = apiRequest(
        SIGNATURE_URL,
        { method: 'GET', credentials: 'include' },
        'No fue posible obtener una firma temporal para la imagen'
    ).then((response) => {
        if (!response?.data) {
            throw new Error(response?.status || 'El API no devolvió una firma de Cloudinary.');
        }

        cachedSignature = response.data;
        signatureExpiresAt = cachedSignature.timestamp * 1000 + SIGNATURE_VALIDITY_MS - SIGNATURE_SAFETY_WINDOW_MS;
        return cachedSignature;
    }).finally(() => {
        signatureRequest = null;
    });

    return signatureRequest;
};

const createUploadRequest = (file, signature) => ({
    method: 'POST',
    body: createUploadFormData(file, signature)
});

const createUploadFormData = (file, signature) => {
    const formData = new FormData();

    Object.entries(signature.signedParams || {}).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    formData.append('api_key', signature.apiKey);
    formData.append('signature', signature.signature);
    formData.append('file', file, file.name);

    return formData;
};

const toMediaReference = (response, payload) => {
    if (!response.ok || !payload?.secure_url || !payload?.public_id) {
        throw new Error(payload?.error?.message || 'Cloudinary no pudo cargar la imagen.');
    }

    return {
        url: payload.secure_url,
        publicId: payload.public_id
    };
};

const validateFile = (file) => {
    if (!(file instanceof File)) {
        throw new Error('Debes seleccionar una imagen.');
    }
    if (!file.type.startsWith('image/')) {
        throw new Error('El archivo seleccionado debe ser una imagen.');
    }
    if (file.size <= 0) {
        throw new Error('La imagen no puede estar vacía.');
    }
    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error('La imagen supera el tamaño máximo de 20 MB.');
    }
};
