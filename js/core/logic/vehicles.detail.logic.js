import { $, fillForm, highlightAndFocus } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";
import { validateImageSize, validateImageType, validateImagesGeneral } from "../../utils/images.validators.js";
import { safeParseFloat } from "../../utils/validators.js";
import { vehicleDetailState } from "../state/vehicles.detail.state.js";


function validateMaxImages(currentImages = [], newFiles = [], max = 12) {
    if (currentImages.length + newFiles.length > max) {
        return `Máximo ${max} imágenes permitidas`;
    }
    return null;
}

function validateDuplicateImages(currentImages = [], newFiles = []) {
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

export function calculateTotal(txtCosts, txtTotal) {
    let total = 0;
    txtCosts.forEach(input => {
        const cleanValue = input.value.replace(/,/g, "");
        total += parseFloat(cleanValue) || 0;
    });
    txtTotal.value = formatWithCommas(total.toFixed(2));
}

export let validateImages = (currentImages, newFiles) => {
    return(validateImagesGeneral(newFiles) || validateDuplicateImages(currentImages, newFiles) || validateMaxImages(currentImages, newFiles));
};

export let validateCustomer = () => {
    if (!vehicleDetailState.customerId) {
        highlightAndFocus($("txtCustomer"));
        return "Debes seleccionar un cliente";
    }
    return null;
}

export function validateBaseVehicle({
    txtVin,
    txtBrand,
    txtModel,
    txtYear,
    txtMileage,
    txtLote
}) {

    if (!txtVin) {
        highlightAndFocus('txtVin');
        return 'El VIN es obligatorio.';
    }

    if (!txtBrand) {
        highlightAndFocus('txtBrand');
        return 'La marca es obligatoria.';
    }

    if (!txtModel) {
        highlightAndFocus('txtModel');
        return 'El modelo es obligatorio.';
    }

    if (!txtYear) {
        highlightAndFocus('txtYear');
        return 'El año es obligatorio.';
    }

    if (isNaN(txtYear) || txtYear < 1900) {
        highlightAndFocus('txtYear');
        return 'El año del vehículo no es válido.';
    }

    if (!txtMileage) {
        highlightAndFocus('txtMileage');
        return 'El millaje es obligatorio.';
    }

    if (isNaN(txtMileage) || txtMileage < 0) {
        highlightAndFocus('txtMileage');
        return 'El millaje no es válido.';
    }

    if (!txtLote) {
        highlightAndFocus('txtLote');
        return 'El lote es obligatorio.';
    }

    return null;
}

export let validateSizeTypeImage = (source) => {
    const messageSize = validateImageSize(source);
    const messageType = validateImageType(source);
    if (messageSize) return messageSize;
    if (messageType) return messageType;
    return null
}

export function validateVehicle({
    txtVin,
    txtBrand,
    txtModel,
    txtYear,
    txtMileage,
    txtLote,
    txtBill,
    txtTransfer,
    txtStorage,
    txtTowTruck,
    txtShip,
    txtTaxes,
    txtIva,
    txtPa,
    txtSuggestedPrice
}) {
    // Validación base
    const baseError = validateBaseVehicle({
        txtVin,
        txtBrand,
        txtModel,
        txtYear,
        txtMileage,
        txtLote
    });

    if (baseError) return baseError;

    const costs = {
        txtBill,
        txtTransfer,
        txtStorage,
        txtTowTruck,
        txtShip,
        txtTaxes,
        txtIva,
        txtPa,
        txtSuggestedPrice
    };
    for (const [key, rawValue] of Object.entries(costs)) {

        const value = safeParseFloat(rawValue);

        if (rawValue === '' || rawValue === null || rawValue === undefined) {
            highlightAndFocus(key);
            return 'Debe completar todos los costos del vehículo.';
        }

        if (isNaN(value) || value < 0) {
            highlightAndFocus(key);
            return `El valor de ${key.replace('txt', '')} no es válido.`;
        }
    }

    return null;
}

export let mapVehicleImages = (fd) => {
    vehicleDetailState.images.forEach(file => {
        fd.append("photos", file.file);
    })
}

export let mapVouchers = (fd) => {
    if (vehicleDetailState.uploads.bill) fd.append("billPhoto", vehicleDetailState.uploads.bill);
    if (vehicleDetailState.uploads.taxes) fd.append("taxesPhoto", vehicleDetailState.uploads.taxes);
    if (vehicleDetailState.uploads.ship) fd.append("TransferShipPhoto", vehicleDetailState.uploads.ship);
}


export function handleUploadFile(file) {
    const type = vehicleDetailState.currentUploadType;
    if (!type || !file) return;

    vehicleDetailState.uploads[type] = file;
}

export function mapVehicleData(formData) {
    return {
        vin: formData.txtVin,
        brand: formData.txtBrand,
        model: formData.txtModel,
        year: formData.txtYear,
        mileage: formData.txtMileage,
        description: formData.txtDescription,
        lote: {
            linkLote: formData.txtLink,
            numLote: formData.txtLote
        },
        costs: {
            bill: safeParseFloat(formData.txtBill),
            transfer: safeParseFloat(formData.txtTransfer),
            storage: safeParseFloat(formData.txtStorage),
            towTruck: safeParseFloat(formData.txtTowTruck),
            ship: safeParseFloat(formData.txtShip),
            taxes: safeParseFloat(formData.txtTaxes),
            iva: safeParseFloat(formData.txtIva),
            pa: safeParseFloat(formData.txtPa),
            suggestedPrice: safeParseFloat(formData.txtSuggestedPrice)
        }
    };
}

export let fillVehiclesBaseForm = (vehicle) => {
    fillForm('#frmVehicles', {
        txtVin: vehicle.vin,
        txtBrand: vehicle.brand,
        txtModel: vehicle.model,
        txtYear: vehicle.year,
        txtMileage: vehicle.mileage,
        txtLote: vehicle.lote.numLote,
        txtLink: vehicle.lote.linkLote,
        txtDescription: vehicle.description,
    });
}

export let fillVehicleCosts = (costs) => {
    fillForm('#frmVehicles', {
        txtBill: formatWithCommas(costs.bill),
        txtTransfer: formatWithCommas(costs.transfer),
        txtStorage: formatWithCommas(costs.storage),
        txtTowTruck: formatWithCommas(costs.towTruck),
        txtShip: formatWithCommas(costs.ship),
        txtTaxes: formatWithCommas(costs.taxes),
        txtIva: formatWithCommas(costs.iva),
        txtPa: formatWithCommas(costs.pa),
        txtTotal: formatWithCommas(costs.total),
        txtSuggestedPrice: formatWithCommas(costs.suggestedPrice)
    })
}

export let loadBackendImages = (photos) => {
    vehicleDetailState.images = photos.map(p => ({
        id: p.idPhoto,
        url: p.photoUrl,
        file: null,
        isNew: false
    }));
}

export function mapExternalVehicle(formData) {
    return {
        vin: formData.txtVin,
        brand: formData.txtBrand,
        model: formData.txtModel,
        year: formData.txtYear,
        mileage: formData.txtMileage,
        description: formData.txtDescription,
        idOwnerCustomer: vehicleDetailState.customerId,
        lote: {
            linkLote: formData.txtLink,
            numLote: formData.txtLote
        }
    };
}

export function validateVehicleImages() {
    const images = vehicleDetailState.images;
    // 🔹 Al menos una imagen
    if (images.length === 0) {
        return {
            title: "Imagen requerida",
            message: "Se debe incluir al menos una imagen del vehículo."
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
}

export function validateEditImages() {
    const totalFinal = vehicleDetailState.images.length;

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
}




export function applyExternalMode(isExternal) {
    if (isExternal) {
        return {
            readOnlyCosts: true,
            clearCosts: true,
            costsRequired: false,
            hideImages: true,
            showCustomer: true,
            customerRequired: true
        };
    }

    return {
        readOnlyCosts: false,
        clearCosts: false,
        costsRequired: true,
        hideImages: false,
        showCustomer: false,
        customerRequired: false
    };
}
