import { resetVehiclesFormState, vehiclesFormState } from "./vehicles.form.state.js";
import { initVehicleDetailEvents } from "./events/vehicles.form.events.js";
import { disableElement, hideElement, removeDisable, showElement, toggleModal, showMessage, buildParams, createModuleInitializer } from "../../../utils/dom.js";
import { replaceTo, ROUTES } from "../../../utils/router.js";
import { closeAndCleanUpdateModal, DOMRefs, loadDomData, renderCustomersSuggestions, renderExternalMode, renderUploadPreview, UPLOAD_CONFIG } from "./vehicles.form.dom.js";
import { applyExternalMode, calculateTotal, fillVehicleCosts, fillVehiclesBaseForm, handleUploadFile, hydrateContextFromURL, mapExternalVehicle, mapVehicleData, mapVouchers, validateBaseVehicle, validateCustomer, validateSizeTypeImage, validateVehicle } from "./vehicles.form.logic.js";
import { getCustomers } from "../../customers/customers.service.js";
import { isValidURL } from "../../../utils/validators.js";
import { initUploadModalEvents } from "./events/vehicles.form.uploads.events.js";
import { getVehicles, postVehicle, putVehicle } from "./vehicles.form.service.js";
import { handleApiError } from "../../../utils/api.utils.js";
import { handleAddImage, initCarouselController } from "../../carousel/carousel.controller.js";
import { mapCarouselImages, validateBaseImages, validateEditImages } from "../../carousel/carousel.logic.js";

const loadVehicle = async () => {
    const vehicle = await getVehicles(vehiclesFormState.context.currentId);
    loadDomData(DOMRefs.refs.typeAction, DOMRefs.refs.btnSaveData);
    DOMRefs.refs.externalElements.forEach(el => {
        hideElement(el);
    });
    fillVehiclesBaseForm(vehicle);
    onValidateUrl(vehicle.lot.linkLot);
    if (vehicle.vehicleCosts) {
        fillVehicleCosts(vehicle.vehicleCosts);
        vehiclesFormState.urls.bill = vehicle.vehicleCosts.costPhoto.billPhoto;
        vehiclesFormState.urls.taxes = vehicle.vehicleCosts.costPhoto.taxesPhoto;
        vehiclesFormState.urls.ship = vehicle.vehicleCosts.costPhoto.shipPhoto;
        vehiclesFormState.costsId = vehicle.vehicleCosts.idCost;
    } else {
        DOMRefs.refs.isExternalOpt.checked = true;
        DOMRefs.refs.isExternalOpt.dispatchEvent(new Event('change'));
        vehiclesFormState.customerId = vehicle.idOwnerCustomer;
        DOMRefs.refs.txtCustomer.value = vehicle.customerName;
        showElement(DOMRefs.refs.selectedCustomerText);
    }
    vehiclesFormState.loteId = vehicle.lot.idLot;
    vehicle.vehiclePhotos.forEach(photo => {
        handleAddImage(vehiclesFormState, {
            id: photo.idPhoto,
            url: photo.photoUrl
        });
    });
};

const onExternalChange = (isExternal) => {
    vehiclesFormState.isExternal = isExternal;
    const uiState = applyExternalMode(vehiclesFormState.isExternal);
    renderExternalMode(uiState, DOMRefs.refs.txtCosts, DOMRefs.refs.btnImgs, DOMRefs.refs.groupCustomer, DOMRefs.refs.txtCustomer, DOMRefs.refs.txtTotal);
    if (vehiclesFormState.isExternal) {
        vehiclesFormState.urls = {
            bill: null,
            taxes: null,
            ship: null
        };
        vehiclesFormState.uploads = {
            bill: null,
            taxes: null,
            ship: null
        };
        hideElement(DOMRefs.refs.costsSection);
    } else {
        showElement(DOMRefs.refs.costsSection);
    }

};

const onSubmitVehicle = async (e) => {
    e.preventDefault();
    let vehiclesImagesValid;
    if (vehiclesFormState.context.currentId) {
        vehiclesImagesValid = validateEditImages(vehiclesFormState.images.length);
    } else {
        vehiclesImagesValid = validateBaseImages(vehiclesFormState.images);
    }
    if (vehiclesImagesValid) {
        await showMessage(vehiclesImagesValid.title, vehiclesImagesValid.message, 'warning');
        return;
    }
    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmVehicles));
    const fd = new FormData();
    let payloadVehicle;
    if (vehiclesFormState.isExternal) {
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
        payloadVehicle = mapExternalVehicle(formData);
    } else {
        const error = validateVehicle(formData);
        if (error) {
            showMessage('Datos no validos', error, 'warning');
            return;
        }
        mapVouchers(fd);
        payloadVehicle = mapVehicleData(formData);
        if (vehiclesFormState.costsId) {
            payloadVehicle.costs.idCost = vehiclesFormState.costsId;
        }
    }
    showElement(DOMRefs.refs.loaderSaveVehicle);
    DOMRefs.refs.camps.forEach(disableElement);

    if (vehiclesFormState.context.currentId) {
        payloadVehicle.photosToDeleteIds = vehiclesFormState.photosToDeleteIds;
    }

    if (vehiclesFormState.loteId) {
        payloadVehicle.lot.idLot = vehiclesFormState.loteId;
    }

    mapCarouselImages(fd, vehiclesFormState.images);
    fd.append("vehicleData", JSON.stringify(payloadVehicle));
    try {
        let response;
        if (vehiclesFormState.context.currentId !== null) {
            response = await putVehicle(fd, vehiclesFormState.context.currentId);
            await showMessage('Vehiculo actualizado con éxito!', 'Exito', 'success');
        } else {
            response = await postVehicle(fd);
            await showMessage('Vehiculo agregado con éxito!', 'Exito', 'success');
        }

        if (vehiclesFormState.context.hasSale) {
            const paramsSale = buildParams({
                idCustomer: vehiclesFormState.context.idCustomer,
                customerName: vehiclesFormState.context.customerName,
                idVehicle: response.data.idVehicle,
                suggestedPrice: response.data.suggestedPrice
            });
            replaceTo(ROUTES.VEHICLE_SALE, Object.fromEntries(paramsSale.entries()));
            return;
        }

        if (vehiclesFormState.context.hasWorkOrder) {
            replaceTo(ROUTES.WORK_ORDER_FORM, { idVehicle: response.data.idVehicle });
            return;
        }

        replaceTo(ROUTES.VEHICLE);
    } catch (error) {
        await handleApiError(error, 'No se pudo guardar el vehículo. Por favor, inténtalo de nuevo.');
    } finally {
        DOMRefs.refs.camps.forEach(removeDisable);
        hideElement(DOMRefs.refs.loaderSaveVehicle);
    }
};

const onSearchCustomer = async (q) => {
    const query = q.trim();
    if (!query) { DOMRefs.refs.boxCustomer.classList.add("hide"); return; }
    try {
        const res = await getCustomers(0, 15, query);
        renderCustomersSuggestions(DOMRefs.refs.boxCustomer, res.content || [], onSelectCustomer);
    } catch (err) { await handleApiError(err, 'No se pudieron cargar los clientes. Por favor, inténtalo de nuevo.'); }
};

const onSelectCustomer = (customer) => {
    DOMRefs.refs.txtCustomer.value = customer.fullName;
    vehiclesFormState.customerId = customer.idCustomer;
    DOMRefs.refs.boxCustomer.classList.add("hide");
    DOMRefs.refs.boxCustomer.classList.remove("show");
    showElement(DOMRefs.refs.selectedCustomerText);
};

const onCleanCustomer = () => {
    if (vehiclesFormState.customerId) {
        vehiclesFormState.customerId = null;
        hideElement(DOMRefs.refs.selectedCustomerText);
    }
};

const onCloseModalUpload = (Refs) => {
    vehiclesFormState.currentUploadType = null;
    closeAndCleanUpdateModal(Refs);
    toggleModal(Refs.modalUpload, false);
};

const onOpenUploadModal = (type) => {
    const config = UPLOAD_CONFIG[type];
    if (!config) return;
    vehiclesFormState.currentUploadType = type;
    if (vehiclesFormState.urls[type]) renderUploadPreview(vehiclesFormState.urls[type], DOMRefs.refs.uploadDropArea);
    DOMRefs.refs.uploadTitle.textContent = config.title;
    toggleModal(DOMRefs.refs.modalUpload, true);
};

const onValidateUrl = (url) => {
    if (url !== "") {
        const isValid = isValidURL(url);
        if (isValid) {
            hideElement(DOMRefs.refs.defaultText);
            hideElement(DOMRefs.refs.errorLinkLote);
            showElement(DOMRefs.refs.validateUrlMessage);
        } else {
            hideElement(DOMRefs.refs.defaultText);
            showElement(DOMRefs.refs.errorLinkLote);
            hideElement(DOMRefs.refs.validateUrlMessage);
        }
    } else {
        showElement(DOMRefs.refs.defaultText);
        hideElement(DOMRefs.refs.errorLinkLote);
        hideElement(DOMRefs.refs.validateUrlMessage);
    }
};

const onChangeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const invalidate = validateSizeTypeImage(file);
    if (invalidate) {
        showMessage('Datos no validos', invalidate, 'warning');
        return;
    }
    handleUploadFile(file);
    const urlImage = renderUploadPreview(file, DOMRefs.refs.uploadDropArea);
    vehiclesFormState.urls[vehiclesFormState.currentUploadType] = urlImage;

    e.target.value = "";
};

const onDropModal = (e) => {
    e.preventDefault();
    DOMRefs.refs.uploadDropArea.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (!file) return;

    handleUploadFile(file);
    renderUploadPreview(file, DOMRefs.refs.uploadDropArea);
};

const initializeUI = (Refs) => {
    initUploadModalEvents({ Refs, onChangeUpload, onDropModal, onCloseModalUpload: () => onCloseModalUpload(Refs), onOpenUploadModal: (type) => onOpenUploadModal(type) });
    initCarouselController(vehiclesFormState, {
        imagesStateName: 'images',
        imagesToDeleteIdsStateName: 'photosToDeleteIds'
    });
    initVehicleDetailEvents({
        Refs,
        onSubmit: onSubmitVehicle,
        onSearchCustomer: onSearchCustomer,
        onExternalChange: onExternalChange,
        onCalculateTotal: () => calculateTotal(DOMRefs.refs.txtCosts, DOMRefs.refs.txtTotal),
        onOpenLinkLoteModal: () => toggleModal(DOMRefs.refs.modalLinkLote, true),
        onCloseLinkLoteModal: () => toggleModal(DOMRefs.refs.modalLinkLote, false),
        onCleanCustomer,
        onValidateUrl
    });
};

const loadDataFlow = async () => {
    const { context } = vehiclesFormState;
    // Determinar qué flujo ejecutar
    if (context.currentId) {
        await loadVehicle();
    }
};

const init = createModuleInitializer({
    resetState: () => {
        resetVehiclesFormState();
        hydrateContextFromURL(vehiclesFormState);
    },
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener("DOMContentLoaded", init);
