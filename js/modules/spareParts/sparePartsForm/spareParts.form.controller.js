import { resetSparePartsFormState, sparePartsFormState } from "./spareParts.form.state.js";
import { fillSparePartsBaseForm, hydrateContextFromURL, mapSparePart, validateBaseSparePart } from "./spareParts.form.logic.js";
import { buildParams, disableElement, hideElement, removeDisable, showElement, showMessage, createModuleInitializer } from "../../../utils/dom.js";
import { navigateTo, replaceTo, ROUTES } from "../../../utils/router.js";
import { formatWithCommas } from "../../../utils/formatters.js";
import { isValidURL, safeParseFloat } from "../../../utils/validators.js";
import { initSparePartDetailEvents } from "./events/spareParts.form.event.js";
import { DOMRefs, loadUpdateInfo, openLinkModal, saveLinkModal } from "./spareParts.form.dom.js";
import { getSparePart, postSparePart, putSparePart } from "./spareParts.form.service.js";
import { handleApiError } from "../../../utils/api.utils.js";
import { handleAddImage, initCarouselController } from "../../carousel/carousel.controller.js";
import { mapCarouselImages, validateBaseImages, validateEditImages } from "../../carousel/carousel.logic.js";

const loadSparePart = async () => {
    try {
        const sparePart = await getSparePart(sparePartsFormState.context.currentId);
        loadUpdateInfo(DOMRefs.refs);

        fillSparePartsBaseForm(sparePart);
        sparePartsFormState.trackingId = sparePart.tracking.idTracking;
        sparePartsFormState.costsId = sparePart.sparePartsCosts.idCostSparePart;
        sparePartsFormState.links.bill = sparePart.billUrl || '';
        sparePartsFormState.links.tracking = sparePart.tracking.linkTracking || '';
        sparePart.sparePartPhotos.forEach(photo => {
            handleAddImage(sparePartsFormState, {
                id: photo.idPhoto,
                url: photo.photoUrl
            });
        });
    } catch (error) {
        await handleApiError(error, 'No se pudo cargar la información del repuesto. Por favor, inténtalo de nuevo.');
    }
};

const onSubmitSparePart = async (e) => {
    e.preventDefault();
    let sparePartImagesValid;
    if (sparePartsFormState.context.currentId) {
        sparePartImagesValid = validateEditImages(sparePartsFormState.sparePartPhotos.length);
    } else {
        sparePartImagesValid = validateBaseImages(sparePartsFormState.sparePartPhotos);
    }
    if (sparePartImagesValid) {
        showMessage(sparePartImagesValid.title, sparePartImagesValid.message, 'warning');
        return;
    }

    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmSpareParts));
    const fd = new FormData();
    const invalidate = validateBaseSparePart(formData, sparePartsFormState.links.bill, sparePartsFormState.links.tracking);
    if (invalidate) {
        showMessage('Datos no válidos', invalidate, 'warning');
        return;
    }
    showElement(DOMRefs.refs.loaderAddSparePart);
    DOMRefs.refs.camps.forEach(disableElement);
    const payloadSparePart = mapSparePart(formData);

    if (sparePartsFormState.context.currentId) {
        payloadSparePart.photosToDeleteIds = sparePartsFormState.photosToDeleteIds;
    }

    if (sparePartsFormState.trackingId && sparePartsFormState.costsId) {
        payloadSparePart.tracking.idTracking = sparePartsFormState.trackingId;
        payloadSparePart.sparePartsCosts.idCostSparePart = sparePartsFormState.costsId;
    }

    mapCarouselImages(fd, sparePartsFormState.sparePartPhotos);
    fd.append("SparePartData", JSON.stringify(payloadSparePart));
    try {
        let response;
        if (sparePartsFormState.context.currentId !== null) {
            await putSparePart(fd, sparePartsFormState.context.currentId);
            await showMessage('Repuesto actualizado con éxito!', 'Éxito', 'success');
        } else {
            response = await postSparePart(fd);
            await showMessage('Repuesto agregado con éxito!', 'Éxito', 'success');
        }
        if (sparePartsFormState.context.hasSale) {
            const paramsSale = buildParams({
                isNewPart: true,
                idCustomer: sparePartsFormState.context.idCustomer,
                customerName: sparePartsFormState.context.customerName,
                sparePartId: response.data.idSparePart,
                sparePartName: response.data.nameSparePart,
                suggestedPrice: response.data.sparePartsCosts.suggestedPrice,
                idSale: sparePartsFormState.context.idSale
            });
            navigateTo(ROUTES.SPARE_PART_SALE, Object.fromEntries(paramsSale.entries()));
            return;
        }
        if (sparePartsFormState.context.hasWorkOrder) {
            const paramsOrder = buildParams({
                isNewPart: true,
                idSale: sparePartsFormState.context.idSale,
                customerName: sparePartsFormState.context.customerName,
                idVehicle: sparePartsFormState.context.idVehicle,
                idCustomer: sparePartsFormState.context.idCustomer,
                totalPrice: sparePartsFormState.context.totalPrice,
                idNewPart: response.data.idSparePart,
                newPartName: response.data.nameSparePart,
                newPartSuggestedPrice: response.data.sparePartsCosts.suggestedPrice,
                idWorkOrder: sparePartsFormState.context.idWorkOrder
            });
            replaceTo(ROUTES.WORK_ORDER_FORM, Object.fromEntries(paramsOrder.entries()));
        } else {
            navigateTo(ROUTES.SPARE_PARTS);
        }

    } catch (error) {
        await handleApiError(error, 'No se pudo guardar el repuesto. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderAddSparePart);
        DOMRefs.refs.camps.forEach(removeDisable);
    }
};

const onCalculateTotal = () => {
    let total = 0;
    DOMRefs.refs.txtCosts.forEach(input => { total += safeParseFloat(input.value); });
    DOMRefs.refs.txtTotal.value = formatWithCommas(total);
};

const onOpenModal = (type) => openLinkModal(type, sparePartsFormState, DOMRefs.refs, onValidateUrl);
const onSaveDataModal = () => saveLinkModal(sparePartsFormState, DOMRefs.refs);

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

const initializeUI = (Refs) => {
    initSparePartDetailEvents({ Refs, onSubmit: onSubmitSparePart, onCalculateTotal, onOpenModal, onSaveDataModal, onValidateUrl });
    initCarouselController(sparePartsFormState, { imagesStateName: "sparePartPhotos", imagesToDeleteIdsStateName: "photosToDeleteIds" });
};

const loadDataFlow = async () => {
    if (sparePartsFormState.context.currentId) {
        await loadSparePart();
    }
};

const init = createModuleInitializer({
    resetState: () => {
        resetSparePartsFormState();
        hydrateContextFromURL(sparePartsFormState);
    },
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener("DOMContentLoaded", init);
