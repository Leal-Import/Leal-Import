import { formatWithCommas } from "../../utils.js";
import { fillForm } from "../../utils/dom.js"
import { IMAGE_CONFIG } from "../../utils/images.validators.js";

export function validateImage(file) {
    if (!(file instanceof File)) {
        return "Archivo inválido";
    }

    // Tipo
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
        return "Formato de imagen no permitido (jpg, png)";
    }

    // Tamaño
    const maxBytes = IMAGE_CONFIG.MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
        return `La imagen debe pesar máximo ${IMAGE_CONFIG.MAX_SIZE_MB}MB`;
    }

    return null;
}

export let fillSparePartsBaseForm = (sparePart) => {
    fillForm('#frmSpareParts', {
        txtPartName: sparePart.nameSpareParts,
        txtLinkName: sparePart.billUrl,
        txtPartBrand: sparePart.brand,
        txtPartModel: sparePart.model,
        txtPartYear: sparePart.yearPart,
        cmbPartStatus: sparePart.idPartsState,
        txtTracking: sparePart.tracking.numTracking,
        txtLinkTracking: sparePart.tracking.linkTracking,
        txtPurchasePrice: formatWithCommas(sparePart.sparePartsCosts.purchasePrice),
        txtTaxes: formatWithCommas(sparePart.sparePartsCosts.taxes),
        txtSuggestedPrice: formatWithCommas(sparePart.sparePartsCosts.suggestedPrice),
        txtTotalCost: formatWithCommas(sparePart.sparePartsCosts.totalCost),
    });
}

export let validateBaseSparePart = ({
    txtPartName,
    txtPartBrand,
    txtPartModel,
    txtPartYear,
    cmbPartStatus,
    txtPurchasePrice,
    txtTaxes,
    txtSuggestedPrice
}) => {

    if (!txtPartName) {
        highlightAndFocus('txtPartName');
        return 'El nombre del repuesto es obligatorio.';
    }

    if (!txtPartBrand) {
        highlightAndFocus('txtPartBrand');
        return 'La marca del repuesto es obligatoria.';
    }

    if (!txtPartModel) {
        highlightAndFocus('txtPartModel');
        return 'El modelo del repuesto es obligatorio.';
    }

    if (!txtPartYear) {
        highlightAndFocus('txtPartYear');
        return 'El año del repuesto es obligatorio.';
    }

    if (!cmbPartStatus) {
        highlightAndFocus('cmbPartStatus');
        return 'Debe seleccionar el estado del repuesto.';
    }

    // 🔢 Validación de costos
    const costs = {
        txtPurchasePrice,
        txtTaxes,
        txtSuggestedPrice
    };

    for (const [key, rawValue] of Object.entries(costs)) {
        const value = safeParseFloat(rawValue);

        if (rawValue === '' || rawValue === null || rawValue === undefined) {
            highlightAndFocus(key);
            return 'Debe completar todos los costos del repuesto.';
        }

        if (isNaN(value) || value < 0) {
            highlightAndFocus(key);
            return `El valor de ${key.replace('txt', '')} no es válido.`;
        }
    }

    return null;
}