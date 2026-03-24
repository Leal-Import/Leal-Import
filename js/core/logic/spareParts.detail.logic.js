import { formatWithCommas } from "../../utils/formatters.js";
import { asUUID, fillForm, highlightAndFocus } from "../../utils/dom.js";
import { validateImageSize, validateImageType } from "../../utils/images.validators.js";
import { isValidURL, safeParseFloat } from "../../utils/validators.js";
import { sparePartDetailState } from "../state/spareParts.detail.state.js";

export const validateImage = (file) => {
    if (!(file instanceof File)) {
        return "Archivo inválido";
    }
    const type = validateImageType(file);
    const size = validateImageSize(file);

    // Tipo
    if (type) {
        return type;
    }
    // Tamaño
    if (size) {
        return size;
    }

    return null;
};

export const fillSparePartsBaseForm = (sparePart) => {
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
        txtTotalCost: formatWithCommas(sparePart.sparePartsCosts.totalCost)
    });
};

export const validateBaseSparePart = ({
    txtPartName,
    txtPartBrand,
    txtPartModel,
    txtPartYear,
    cmbPartStatus,
    txtPurchasePrice,
    txtTaxes,
    txtSuggestedPrice,
    txtTracking
}, billLink, trackingLink) => {

    if (txtPartName.length > 250 || txtPartName.length < 1) {
        highlightAndFocus('txtPartName');
        return 'El nombre del repuesto debe tener entre 1 y 250 caracteres.';
    }

    if (txtPartBrand.length > 50 || txtPartBrand.length < 1) {
        highlightAndFocus('txtPartBrand');
        return 'La marca del repuesto debe tener entre 1 y 50 caracteres.';
    }

    if (txtPartModel.length > 50 || txtPartModel.length < 1) {
        highlightAndFocus('txtPartModel');
        return 'El modelo del repuesto debe tener entre 1 y 50 caracteres.';
    }

    if (txtPartYear.trim() === '') {
        highlightAndFocus('txtPartYear');
        return 'El año del repuesto es obligatorio.';
    }

    if (!cmbPartStatus) {
        highlightAndFocus('cmbPartStatus');
        return 'Debe seleccionar el estado del repuesto.';
    }

    if (billLink !== '') {
        if (!isValidURL(billLink)) return 'El enlace de la factura no es válido.';
    }

    if (trackingLink !== '') {
        if (!isValidURL(trackingLink)) return 'El enlace del tracking no es válido.';
    }

    if (txtTracking.length > 50 || txtTracking.length < 1) {
        highlightAndFocus('txtTracking');
        return 'El número de tracking debe tener entre 1 y 50 caracteres.';
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
};

export const mapSparePart = (formData) => {
    const sparePart = {
        nameSpareParts: formData.txtPartName,
        brand: formData.txtPartBrand,
        model: formData.txtPartModel,
        yearPart: formData.txtPartYear,
        idPartsState: formData.cmbPartStatus,
        billUrl: sparePartDetailState.links.bill || null,
        tracking: {
            numTracking: formData.txtTracking || null,
            linkTracking: sparePartDetailState.links.tracking || null
        },
        sparePartsCosts: {
            purchasePrice: safeParseFloat(formData.txtPurchasePrice),
            taxes: safeParseFloat(formData.txtTaxes),
            suggestedPrice: safeParseFloat(formData.txtSuggestedPrice)
        }
    };

    return sparePart;
};

export const hydrateContextFromURL = (state) => {
    const params = new URLSearchParams(window.location.search);

    state.context.currentId = asUUID(params.get('id'));
    state.context.hasSale = params.get('sale') === 'true';
    state.context.hasWorkOrder = params.get('workOrder') === 'true';
    state.context.customerName = params.get('customerName')?.trim() || '';
    state.context.idCustomer = asUUID(params.get('idCustomer'));
    state.context.idSale = asUUID(params.get('idSale'));
    state.context.totalPrice = params.get('totalPrice');
    state.context.idVehicle = asUUID(params.get('idVehicle'));
    state.context.idWorkOrder = asUUID(params.get('idWorkOrder'));
};
