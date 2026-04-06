import { asUUID, fillForm, highlightAndFocus } from "../../../utils/dom.js";
import { formatWithCommas } from "../../../utils/formatters.js";
import { validateImageSize, validateImageType } from "../../../utils/images.validators.js";
import { isValidDecimal, isValidURL, isValidYear, safeParseFloat } from "../../../utils/validators.js";
import { sanitizeURLParam } from "../../../utils/sanitizer.js";
import { vehiclesFormState } from "./vehicles.form.state.js";

export const calculateTotal = (txtCosts, txtTotal) => {
    let total = 0;
    txtCosts.forEach(input => {
        const cleanValue = safeParseFloat(input.value) || 0;
        total += parseFloat(cleanValue) || 0;
    });

    txtTotal.value = formatWithCommas(total.toFixed(2));
};

export const validateCustomer = () => {
    if (!vehiclesFormState.customerId) {
        highlightAndFocus('txtCustomer');
        return "Debes seleccionar un cliente";
    }
    return null;
};

export const validateBaseVehicle = ({
    txtVin,
    txtBrand,
    txtModel,
    txtYear,
    txtMileage,
    txtLote,
    txtLink,
    txtDescription
}) => {

    if (txtVin.length < 5 || txtVin.length > 50) {
        highlightAndFocus('txtVin');
        return 'El VIN debe tener entre 5 y 50 caracteres.';
    }

    if (txtBrand.length > 50 || txtBrand.length < 2) {
        highlightAndFocus('txtBrand');
        return 'La marca debe tener entre 2 y 50 caracteres.';
    }

    if (txtModel.length > 50 || txtModel.length < 1) {
        highlightAndFocus('txtModel');
        return 'El modelo debe tener entre 1 y 50 caracteres.';
    }

    if (!isValidYear(txtYear)) {
        highlightAndFocus('txtYear');
        return 'El año del vehículo no es válido.';
    }

    if (txtMileage.length > 50 || txtMileage.length < 1) {
        highlightAndFocus('txtMileage');
        return 'El millaje debe tener entre 1 y 50 caracteres.';
    }

    if (txtLote.length > 50 || txtLote.length < 1) {
        highlightAndFocus('txtLote');
        return 'El número de lote debe tener entre 1 y 50 caracteres.';
    }

    if (txtLink.trim() !== "") {
        if (!isValidURL(txtLink)) return "Enlace del lote no valido";
    }

    if (txtDescription.length > 500 || txtDescription.length < 1) {
        highlightAndFocus('txtDescription');
        return 'La descripción debe tener entre 1 y 500 caracteres.';
    }

    return null;
};

export const validateSizeTypeImage = (source) => {
    const messageSize = validateImageSize(source);
    const messageType = validateImageType(source);
    if (messageSize) return messageSize;
    if (messageType) return messageType;
    return null;
};

export const validateVehicle = ({
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
    txtSuggestedPrice,
    txtLink,
    txtDescription
}) => {
    // Validación base
    const baseError = validateBaseVehicle({
        txtVin,
        txtBrand,
        txtModel,
        txtYear,
        txtMileage,
        txtLote,
        txtLink,
        txtDescription
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

        if (!isValidDecimal(value)) {
            highlightAndFocus(key);
            return `El valor de ${key.replace('txt', '')} no es válido.`;
        }
    }

    return null;
};

export const mapVouchers = (fd) => {
    if (vehiclesFormState.uploads.bill) fd.append("billPhoto", vehiclesFormState.uploads.bill);
    if (vehiclesFormState.uploads.taxes) fd.append("taxesPhoto", vehiclesFormState.uploads.taxes);
    if (vehiclesFormState.uploads.ship) fd.append("transferShipPhoto", vehiclesFormState.uploads.ship);
};

export const handleUploadFile = (file) => {
    const type = vehiclesFormState.currentUploadType;
    if (!type || !file) return;

    vehiclesFormState.uploads[type] = file;
};

export const mapVehicleData = (formData) => {
    return {
        vin: formData.txtVin,
        brand: formData.txtBrand,
        model: formData.txtModel,
        year: formData.txtYear,
        mileage: formData.txtMileage,
        description: formData.txtDescription,
        lot: {
            linkLot: formData.txtLink,
            numLot: formData.txtLote
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
};

export const fillVehiclesBaseForm = (vehicle) => {
    fillForm('#frmVehicles', {
        txtVin: vehicle.vin,
        txtBrand: vehicle.brand,
        txtModel: vehicle.model,
        txtYear: vehicle.year,
        txtMileage: vehicle.mileage,
        txtLote: vehicle.lot.numLot,
        txtLink: vehicle.lot.linkLot,
        txtDescription: vehicle.description
    });
};

export const fillVehicleCosts = (costs) => {
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
    });
};

export const mapExternalVehicle = (formData) => {
    return {
        vin: formData.txtVin,
        brand: formData.txtBrand,
        model: formData.txtModel,
        year: formData.txtYear,
        mileage: formData.txtMileage,
        description: formData.txtDescription,
        idOwnerCustomer: vehiclesFormState.customerId,
        lot: {
            linkLot: formData.txtLink,
            numLot: formData.txtLote
        }
    };
};

export const applyExternalMode = (isExternal) => {
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
};

export const hydrateContextFromURL = (state) => {
    const params = new URLSearchParams(window.location.search);

    state.context.currentId = asUUID(params.get('id'));
    state.context.customerName = sanitizeURLParam(params.get('customerName'), '');
    state.context.idCustomer = asUUID(params.get('idCustomer'));
    state.context.hasSale = params.get('sale') === 'true';
    state.context.hasWorkOrder = params.get('workOrder') === 'true';
};
