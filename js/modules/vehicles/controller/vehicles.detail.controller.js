import { vehicleDetailState } from "../../../core/state/vehicles.detail.state.js";
import { initVehicleDetailEvents } from "../event/vehicles.detail.events.js";
import { $, qs, qsa, toggleModal } from "../../../utils/dom.js";
import { closeAndCleanUpdateModal, openUploadModal, renderCustomersSuggestions, renderExternalMode, renderImages, renderUploadPreview } from "../../../core/dom/vehicles.detail.dom.js";
import { applyExternalMode, fillVehicleCosts, fillVehiclesBaseForm, handleUploadFile, hydrateContextFromURL, loadBackendImages, mapExternalVehicle, mapVehicleData, mapVehicleImages, mapVouchers, validateBaseVehicle, validateCustomer, validateEditImages, validateImages, validateSizeTypeImage, validateVehicle, validateVehicleImages } from "../../../core/logic/vehicles.detail.logic.js";
import { getCustomers } from "../../../service/customers.service.js"
import { showMessage } from "../../../utils.js";
import { formatWithCommas } from "../../../utils/formatters.js";
import { safeParseFloat } from "../../../utils/validators.js";
import { initUploadModalEvents } from "../event/vehicles.uploads.events.js";
import { getVehicles, postVehicle, putVehicle } from "../../../service/vehicles.detail.service.js";

const previewImage = qs("#mainSwiper .previewImg");
const txtCosts = qsa(".txtCosts");
const txtTotal = $('txtTotal');
const mainSwiperWrapper = $('mainSwiperWrapper');
const thumbsWrapper = $('thumbsWrapper');
const frmVehicles = $('frmVehicles');
const boxCustomer = $('suggestionsCustomer');
const imageInput = $('imageInput');
const isExternalOpt = $("isExternalOpt");
const txtCustomer = $("txtCustomer");

export async function loadVehicle() {
    const vehicle = await getVehicles(vehicleDetailState.context.currentId);
    $("typeAction").textContent = "Actualizar vehiculo";
    $("btnSaveData").value = "Actualizar"
    fillVehiclesBaseForm(vehicle);
    if (vehicle.costs) {
        fillVehicleCosts(vehicle.costs)
        vehicleDetailState.urls.bill = vehicle.costs.costPhoto.billPhoto;
        vehicleDetailState.urls.taxes = vehicle.costs.costPhoto.taxesPhoto;
        vehicleDetailState.urls.ship = vehicle.costs.costPhoto.shipPhoto;
        vehicleDetailState.costsId = vehicle.costs.idCost
    } else {
        isExternalOpt.checked = true;
        isExternalOpt.dispatchEvent(new Event('change'));
        vehicleDetailState.customerId = vehicle.idOwnerCustomer;
        txtCustomer.value = vehicle.customerName;
    }
    vehicleDetailState.loteId = vehicle.lote.idLote;
    loadBackendImages(vehicle.photos);
    renderImages(vehicleDetailState.images, mainSwiperWrapper, thumbsWrapper, deleteImage, () => imageInput.click())
}

export function onExternalChange(isExternal) {
    vehicleDetailState.isExternal = isExternal;

    const uiState = applyExternalMode(isExternal);
    renderExternalMode(uiState);
}

export async function onSubmitVehicle(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(frmVehicles));
    const fd = new FormData();

    let payloadVehicle;
    let vehiclesImagesValid;
    if (vehicleDetailState.context.currentId) {
        vehiclesImagesValid = validateEditImages();
    } else {
        vehiclesImagesValid = validateVehicleImages();
    }
    if (vehiclesImagesValid) {
        showMessage(vehiclesImagesValid.title, vehiclesImagesValid.message, 'warning');
        return;
    }
    if (vehicleDetailState.isExternal) {
        const error = validateBaseVehicle(formData);
        if (error) {
            showMessage('Datos no validos', error, 'warning');
            return;
        }
        const customerValid = validateCustomer();
        if (customerValid) {
            showMessage('Sin cliente', customerValid, 'warning');
            return;
        }
        payloadVehicle = mapExternalVehicle(formData)
    } else {
        const error = validateVehicle(formData);
        if (error) {
            showMessage('Datos no validos', error, 'warning');
            return;
        }
        mapVouchers(fd);
        payloadVehicle = mapVehicleData(formData);
        if (vehicleDetailState.costsId) {
            payloadVehicle.costs.idCost = vehicleDetailState.costsId
        }
    }

    if (vehicleDetailState.context.currentId) {
        payloadVehicle.photosToDeleteIds = vehicleDetailState.photosToDeleteIds;
    }

    if (vehicleDetailState.loteId) {
        payloadVehicle.lote.idLote = vehicleDetailState.loteId;
    }

    mapVehicleImages(fd);
    fd.append("vehicleData", JSON.stringify(payloadVehicle));

    try {
        let response;
        if (vehicleDetailState.context.currentId != null) {
            response = await putVehicle(fd, vehicleDetailState.context.currentId);
            await showMessage('Vehiculo actualizado con éxito!', 'Exito', 'success');
        } else {
            response = await postVehicle(fd);
            await showMessage('Vehiculo agregado con éxito!', 'Exito', 'success');
        }

        if (vehicleDetailState.context.hasSale) {
            window.location.href = `vehicleSale.html?idCustomer=${vehicleDetailState.context.idCustomer}&customerName=${vehicleDetailState.context.customerName}&idVehicle=${response.data.idVehicle}`;
            return;
        }

        if (vehicleDetailState.context.hasWorkOrder) {
            window.location.href = `addWorkOrder.html?idVehicle=${response.data.idVehicle}`
            return;
        }

        window.location.href = "vehicle.html";
    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el vehiculo.';
        showMessage(errorMessage, 'error', 'error');
    }
}

export let onSearchCustomer = async (e) => {
    const q = e.target.value.trim();
    if (!q) { boxCustomer.classList.add("hide"); return; }
    try {
        const res = await getCustomers(0, 15, q);
        renderCustomersSuggestions(boxCustomer, res.content || [], onSelectCustomer);
    } catch (err) { console.error(err); }
};

let onSelectCustomer = (customer) => {
    $("txtCustomer").value = customer.fullName;
    vehicleDetailState.customerId = customer.idCustomer;
    boxCustomer.classList.add("hide");
    boxCustomer.classList.remove("show");
}

export let onAddImage = (e) => {
    const files = [...e.target.files];
    const error = validateImages(vehicleDetailState.images, files);
    if (error) {
        showMessage("Error", error, "warning");
        console.warn(error);
        return;
    }

    files.forEach(file => {
        vehicleDetailState.images.push({
            id: null,
            url: URL.createObjectURL(file),
            file: file,
            isNew: true
        });
    });


    renderImages(vehicleDetailState.images, mainSwiperWrapper, thumbsWrapper, deleteImage, () => imageInput.click());
    previewImage ? mainSwiperWrapper.classList.add("mainSwiperUsed") : mainSwiperWrapper.classList.remove("mainSwiperUsed")
    imageInput.value = "";
}

export let cleanCustomer = () => {
    if (vehicleDetailState.customerId) vehicleDetailState.customerId = null;
}

function onCalculateTotal() {
    let total = 0;

    txtCosts.forEach(input => {
        // Quitar comas antes de convertir a número
        const cleanValue = safeParseFloat(input.value);

        total += cleanValue;
    });
    txtTotal.value = formatWithCommas(total);
}

let openLinkLoteModal = () => {
    toggleModal($('modalLinkLote'), true);
}

let closeLinkLoteModal = () => {
    toggleModal($('modalLinkLote'), false);
}

let initCloseModalUpload = () => {
    closeAndCleanUpdateModal(vehicleDetailState);
}

let initOpenModalUpload = (type) => {
    openUploadModal(type, vehicleDetailState)
}

let onChangeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const invalidate = validateSizeTypeImage(file);
    if (invalidate) {
        showMessage('Datos no validos', invalidate, 'warning');
        return;
    }
    handleUploadFile(file);
    const urlImage = renderUploadPreview(file);
    vehicleDetailState.urls[vehicleDetailState.currentUploadType] = urlImage

    e.target.value = "";
}

let onDropModal = (e) => {
    e.preventDefault();
    $("uploadDropArea").classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (!file) return;

    handleUploadFile(file);
    renderUploadPreview(file);
}


let deleteImage = (index) => {
    const img = vehicleDetailState.images[index];
    if (!img.isNew && img.id) {
        vehicleDetailState.photosToDeleteIds.push(img.id);
    }

    vehicleDetailState.images.splice(index, 1);
    renderImages(vehicleDetailState.images, mainSwiperWrapper, thumbsWrapper, deleteImage, () => imageInput.click());
};

document.addEventListener("DOMContentLoaded", async () => {
    hydrateContextFromURL(vehicleDetailState);
    initVehicleDetailEvents({
        onSubmit: onSubmitVehicle,
        onSearchCustomer: onSearchCustomer,
        onAddImage: onAddImage,
        onExternalChange: onExternalChange,
        onCalculateTotal,
        openLinkLoteModal,
        closeLinkLoteModal,
        cleanCustomer
    });
    initUploadModalEvents({ onChangeUpload, onDropModal, closeModalUpload: initCloseModalUpload, openUploadModal: initOpenModalUpload });
    if (vehicleDetailState.context.currentId) {
        await loadVehicle();
    } else {
        renderImages(vehicleDetailState.images, mainSwiperWrapper, thumbsWrapper, deleteImage, () => imageInput.click());
    }
});