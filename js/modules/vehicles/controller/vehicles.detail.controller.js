import { resetVehicleDetailState, vehicleDetailState } from "../../../core/state/vehicles.detail.state.js";
import { initVehicleDetailEvents } from "../event/vehicles.detail.events.js";
import { disableElement, hideElement, removeDisable, showElement, toggleModal, showMessage, buildParams } from "../../../utils/dom.js";
import { closeAndCleanUpdateModal, DOMRefs, loadDomData, renderCustomersSuggestions, renderExternalMode, renderImages, renderUploadPreview, UPLOAD_CONFIG, verifyBtnsCarousel } from "../../../core/dom/vehicles.detail.dom.js";
import { applyExternalMode, calculateTotal, fillVehicleCosts, fillVehiclesBaseForm, handleUploadFile, hydrateContextFromURL, loadBackendImages, mapExternalVehicle, mapVehicleData, mapVehicleImages, mapVouchers, validateBaseVehicle, validateCustomer, validateEditImages, validateImages, validateSizeTypeImage, validateVehicle, validateVehicleImages } from "../../../core/logic/vehicles.detail.logic.js";
import { getCustomers } from "../../../service/customers.service.js";
import { initSession } from "../../../utils/api.utils.js";
import { isValidURL } from "../../../utils/validators.js";
import { initUploadModalEvents } from "../event/vehicles.uploads.events.js";
import { getVehicles, postVehicle, putVehicle } from "../../../service/vehicles.detail.service.js";

const loadVehicle = async () => {
    const vehicle = await getVehicles(vehicleDetailState.context.currentId);
    loadDomData(DOMRefs.refs.typeAction, DOMRefs.refs.btnSaveData);
    DOMRefs.refs.externalElements.forEach(el => {
        hideElement(el);
    });
    fillVehiclesBaseForm(vehicle);
    onValidateUrl(vehicle.lote.linkLote);
    if (vehicle.costs) {
        fillVehicleCosts(vehicle.costs);
        vehicleDetailState.urls.bill = vehicle.costs.costPhoto.billPhoto;
        vehicleDetailState.urls.taxes = vehicle.costs.costPhoto.taxesPhoto;
        vehicleDetailState.urls.ship = vehicle.costs.costPhoto.shipPhoto;
        vehicleDetailState.costsId = vehicle.costs.idCost;
    } else {
        DOMRefs.refs.isExternalOpt.checked = true;
        DOMRefs.refs.isExternalOpt.dispatchEvent(new Event('change'));
        vehicleDetailState.customerId = vehicle.idOwnerCustomer;
        DOMRefs.refs.txtCustomer.value = vehicle.customerName;
        showElement(DOMRefs.refs.selectedCustomerText);
    }
    vehicleDetailState.loteId = vehicle.lote.idLote;
    loadBackendImages(vehicle.photos);
    renderImages(vehicleDetailState.images, DOMRefs.refs.mainSwiperWrapper, DOMRefs.refs.thumbsWrapper, deleteImage, () => DOMRefs.refs.imageInput.click());
};

const onExternalChange = (isExternal) => {
    vehicleDetailState.isExternal = isExternal;
    const uiState = applyExternalMode(vehicleDetailState.isExternal);
    renderExternalMode(uiState, DOMRefs.refs.txtCosts, DOMRefs.refs.btnImgs, DOMRefs.refs.groupCustomer, DOMRefs.refs.txtCustomer, DOMRefs.refs.txtTotal);
    if (vehicleDetailState.isExternal) {
        vehicleDetailState.urls = {
            bill: null,
            taxes: null,
            ship: null
        };
        vehicleDetailState.uploads = {
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
    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmVehicles));
    const fd = new FormData();
    let payloadVehicle;
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
        payloadVehicle = mapExternalVehicle(formData);
    } else {
        const error = validateVehicle(formData);
        if (error) {
            showMessage('Datos no validos', error, 'warning');
            return;
        }
        mapVouchers(fd);
        payloadVehicle = mapVehicleData(formData);
        if (vehicleDetailState.costsId) {
            payloadVehicle.costs.idCost = vehicleDetailState.costsId;
        }
    }
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
    showElement(DOMRefs.refs.loaderSaveVehicle);
    DOMRefs.refs.camps.forEach(disableElement);

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
        if (vehicleDetailState.context.currentId !== null) {
            response = await putVehicle(fd, vehicleDetailState.context.currentId);
            await showMessage('Vehiculo actualizado con éxito!', 'Exito', 'success');
        } else {
            response = await postVehicle(fd);
            await showMessage('Vehiculo agregado con éxito!', 'Exito', 'success');
        }

        if (vehicleDetailState.context.hasSale) {
            const paramsSale = buildParams({
                idCustomer: vehicleDetailState.context.idCustomer,
                customerName: vehicleDetailState.context.customerName,
                idVehicle: response.data.idVehicle,
                suggestedPrice: response.data.suggestedPrice
            });
            window.location.replace(`vehicleSale.html?${paramsSale.toString()}`);
            return;
        }

        if (vehicleDetailState.context.hasWorkOrder) {
            window.location.replace(`addWorkOrder.html?idVehicle=${response.data.idVehicle}`);
            return;
        }

        window.location.replace("vehicle.html");
    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el vehiculo.';
        showMessage(errorMessage, 'error', 'error');
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
    } catch (err) { console.error(err); }
};

const onSelectCustomer = (customer) => {
    DOMRefs.refs.txtCustomer.value = customer.fullName;
    vehicleDetailState.customerId = customer.idCustomer;
    DOMRefs.refs.boxCustomer.classList.add("hide");
    DOMRefs.refs.boxCustomer.classList.remove("show");
    showElement(DOMRefs.refs.selectedCustomerText);
};

const onAddImage = (e) => {
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

    renderImages(vehicleDetailState.images, DOMRefs.refs.mainSwiperWrapper, DOMRefs.refs.thumbsWrapper, deleteImage, () => DOMRefs.refs.imageInput.click());
    DOMRefs.refs.previewImage ? DOMRefs.refs.mainSwiperWrapper.classList.add("mainSwiperUsed") : DOMRefs.refs.mainSwiperWrapper.classList.remove("mainSwiperUsed");
    DOMRefs.refs.imageInput.value = "";
    verifyBtnsCarousel(DOMRefs.refs.btnsCarousel, DOMRefs.refs.mainSwiperWrapper);
};

const cleanCustomer = () => {
    if (vehicleDetailState.customerId) {
        vehicleDetailState.customerId = null;
        hideElement(DOMRefs.refs.selectedCustomerText);
    }
};

const onCloseModalUpload = (Refs) => {
    vehicleDetailState.currentUploadType = null;
    closeAndCleanUpdateModal(Refs);
    toggleModal(Refs.modalUpload, false);
};

const onOpenUploadModal = (type) => {
    const config = UPLOAD_CONFIG[type];
    if (!config) return;
    vehicleDetailState.currentUploadType = type;
    if (vehicleDetailState.urls[type]) renderUploadPreview(vehicleDetailState.urls[type], DOMRefs.refs.uploadDropArea);
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
    vehicleDetailState.urls[vehicleDetailState.currentUploadType] = urlImage;

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

const deleteImage = (index) => {
    const img = vehicleDetailState.images[index];
    if (!img.isNew && img.id) {
        vehicleDetailState.photosToDeleteIds.push(img.id);
    }

    vehicleDetailState.images.splice(index, 1);
    renderImages(vehicleDetailState.images, DOMRefs.refs.mainSwiperWrapper, DOMRefs.refs.thumbsWrapper, deleteImage, () => DOMRefs.refs.imageInput.click());
    verifyBtnsCarousel(DOMRefs.refs.btnsCarousel, DOMRefs.refs.mainSwiperWrapper);
};

const setupApplication = async () => {
    resetVehicleDetailState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    hydrateContextFromURL(vehicleDetailState);
    return true;
};

const initializeUI = (Refs) => {
    initUploadModalEvents({ Refs, onChangeUpload, onDropModal, onCloseModalUpload: () => onCloseModalUpload(Refs), onOpenUploadModal: (type) => onOpenUploadModal(type) });

    initVehicleDetailEvents({
        Refs,
        onSubmit: onSubmitVehicle,
        onSearchCustomer: onSearchCustomer,
        onAddImage: onAddImage,
        onExternalChange: onExternalChange,
        onCalculateTotal: () => calculateTotal(DOMRefs.refs.txtCosts, DOMRefs.refs.txtTotal),
        openLinkLoteModal: () => toggleModal(DOMRefs.refs.modalLinkLote, true),
        onCloseLinkLoteModal: () => toggleModal(DOMRefs.refs.modalLinkLote, false),
        cleanCustomer,
        onValidateUrl
    });
};

const loadDataFlow = async () => {
    const { context } = vehicleDetailState;
    // Determinar qué flujo ejecutar
    if (context.currentId) {
        await loadVehicle();
        verifyBtnsCarousel(DOMRefs.refs.btnsCarousel, DOMRefs.refs.mainSwiperWrapper);
    } else {
        renderImages(vehicleDetailState.images, DOMRefs.refs.mainSwiperWrapper, DOMRefs.refs.thumbsWrapper, deleteImage, () => DOMRefs.refs.imageInput.click());
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();
        initializeUI(refs);

        await loadDataFlow();
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
