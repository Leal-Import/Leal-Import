import { sparePartDetailState } from "../../../core/state/spareParts.detail.state.js";
import {
    fillSparePartsBaseForm,
    hydrateContextFromURL,
    mapSparePart,
    validateBaseSparePart,
    validateImage
} from "../../../core/logic/spareParts.detail.logic.js";
import { disableElement, fillSelect, hideElement, removeDisable, showElement, showMessage } from "../../../utils/dom.js";
import { formatWithCommas } from "../../../utils/formatters.js";
import { isValidURL, safeParseFloat } from "../../../utils/validators.js";
import { initSparePartDetailEvents } from "../event/spareParts.detail.event.js";
import { initImageEvents } from "../event/spareParts.uploads.event.js";
import { DOMRefs, loadImage, loadUpdateInfo, openLinkModal, saveLinkModal } from "../../../core/dom/spareParts.detail.dom.js";
import { getSparePart, postSparePart, putSparePart } from "../../../service/spareParts.detail.service.js";
import { getStatus } from "../../../service/spareParts.service.js";
import { initSession } from "../../../utils/api.utils.js";

const loadStatusSelect = async() => {
    try {
        const status = await getStatus();
        sparePartDetailState.statusList = status;
        fillSelect("cmbPartStatus", status, 'idPartsState', 'state', 'Selecciona un estado');
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar los estados de los repuestos',
            'error'
        );
        console.error(error);
    }
};

const loadSparePart = async() => {
    try {
        const sparePart = await getSparePart(sparePartDetailState.context.currentId);
        loadUpdateInfo(DOMRefs.refs);

        fillSparePartsBaseForm(sparePart);
        loadImage(sparePart.photoUrl, DOMRefs.refs);
        sparePartDetailState.trackingId = sparePart.tracking.idTracking;
        sparePartDetailState.costsId = sparePart.sparePartsCosts.idCostSparePart;
        sparePartDetailState.links.bill = sparePart.billUrl;
        sparePartDetailState.links.tracking = sparePart.tracking.linkTracking;
    } catch (error) {
        console.error("No se pudo cargar el repuestp: ", error);
        showMessage("Error", "Error al cargar el repuesto", "error");
    }
};

const onSubmitSparePart = async(e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmSpareParts));
    const fd = new FormData();
    let imagesValid;
    if (sparePartDetailState.context.currentId && sparePartDetailState.image.file) {
        imagesValid = validateImage(sparePartDetailState.image.file);
    } else if (!sparePartDetailState.context.currentId) {
        imagesValid = validateImage(sparePartDetailState.image.file);
    }

    if (imagesValid) {
        showMessage('Imagen no valida', imagesValid, 'warning');
        return;
    }
    const invalidate = validateBaseSparePart(formData, sparePartDetailState.links.bill, sparePartDetailState.links.tracking);
    if (invalidate) {
        showMessage('Datos no válidos', invalidate, 'warning');
        return;
    }
    showElement(DOMRefs.refs.loaderAddSparePart);
    disableElement(DOMRefs.refs.btnSaveSparePart);
    const payloadSparePart = mapSparePart(formData);

    if (sparePartDetailState.trackingId && sparePartDetailState.costsId) {
        payloadSparePart.tracking.idTracking = sparePartDetailState.trackingId;
        payloadSparePart.sparePartsCosts.idCostSparePart = sparePartDetailState.costsId;
    }

    if (sparePartDetailState.image.file) {
        fd.append("photo", sparePartDetailState.image.file);
    }
    fd.append("SparePartData", JSON.stringify(payloadSparePart));
    try {
        let response;
        if (sparePartDetailState.context.currentId !== null) {
            await putSparePart(fd, sparePartDetailState.context.currentId);
            await showMessage('Repuesto actualizado con éxito!', 'Éxito', 'success');
        } else {
            response = await postSparePart(fd);
            await showMessage('Repuesto agregado con éxito!', 'Éxito', 'success');
        }
        if (sparePartDetailState.context.hasSale) {
            let url = `sparePartSale.html?isNewPart=true` +
                `&idCustomer=${sparePartDetailState.context.idCustomer}` +
                `&customerName=${encodeURIComponent(sparePartDetailState.context.customerName)}` +
                `&sparePartId=${response.data.idSparePart}` +
                `&sparePartName=${encodeURIComponent(response.data.nameSpareParts)}` +
                `&suggestedPrice=${response.data.sparePartsCosts.suggestedPrice}`;

            if (sparePartDetailState.context.idSale !== null && sparePartDetailState.context.idSale !== '') {
                url += `&idSale=${sparePartDetailState.context.idSale}`;
            }

            window.location.href = url;

            return;
        }
        if (sparePartDetailState.context.hasWorkOrder) {
            const paramsOrder = new URLSearchParams({
                isNewPart: true,
                idSale: sparePartDetailState.context.idSale || null,
                customerName: sparePartDetailState.context.customerName,
                idVehicle: sparePartDetailState.context.idVehicle,
                idCustomer: sparePartDetailState.context.idCustomer,
                totalPrice: sparePartDetailState.context.totalPrice,
                newSparePartId: response.data.idSparePart,
                newSparePartName: response.data.nameSpareParts,
                newSuggestedPrice: response.data.sparePartsCosts.suggestedPrice,
                idWorkOrder: sparePartDetailState.context.idWorkOrder || null
            });
            window.location.href = `addWorkOrder.html?${paramsOrder.toString()}`;
        } else {
            window.location.href = "spareParts.html";
        }

    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el repuesto.';
        showMessage(errorMessage, 'error', 'error');
    } finally {
        hideElement(DOMRefs.refs.loaderAddSparePart);
        removeDisable(DOMRefs.refs.btnSaveSparePart);
    }
};

const onAddImage = () => DOMRefs.refs.fileInput.click();

const onCalculateTotal = () => {
    let total = 0;
    DOMRefs.refs.txtCosts.forEach(input => { total += safeParseFloat(input.value); });
    DOMRefs.refs.txtTotal.value = formatWithCommas(total);
};

const onOpenModal = (type) => openLinkModal(type, sparePartDetailState, DOMRefs.refs, onValidateUrl);
const onSaveDataModal = () => saveLinkModal(sparePartDetailState, DOMRefs.refs);

const onChangeUpload = (e) => {
    const file = e.target.files[0];
    const error = validateImage(file);

    if (error) {
        showMessage("Error", error, "warning");
        return;
    }

    sparePartDetailState.image.file = file;
    sparePartDetailState.image.url = URL.createObjectURL(file);

    loadImage(file, DOMRefs.refs);
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

const onDeleteImage = () => {
    sparePartDetailState.image.file = null;
    sparePartDetailState.image.url = null;

    DOMRefs.refs.imgPart.src = "";
    DOMRefs.refs.imgPart.style.display = "none";
    DOMRefs.refs.placeholderMsg.style.display = "block";
    DOMRefs.refs.fileInput.value = "";
};

const onDropModal = (e) => {
    e.preventDefault();
    DOMRefs.refs.dropArea.classList.remove("dragover");
};

const onDragOver = (e) => {
    e.preventDefault();
    DOMRefs.refs.dropArea.classList.add("dragover");
};

const onDragLeave = () => {
    DOMRefs.refs.dropArea.classList.remove("dragover");
};

const setupApplication = async() => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    // 3. Hidratar contexto desde URL
    hydrateContextFromURL(sparePartDetailState);

    return true;
};

const initializeUI = (Refs) => {
    initSparePartDetailEvents({ Refs, onSubmit: onSubmitSparePart, onCalculateTotal, onOpenModal, onSaveDataModal, onValidateUrl });
    initImageEvents({ Refs, onChangeUpload, onDropModal, onAddImage, onDeleteImage, onDragOver, onDragLeave });
};

const loadDataFlow = async() => {
    await loadStatusSelect();
    if (sparePartDetailState.context.currentId) {
        await loadSparePart();
    }
};

document.addEventListener("DOMContentLoaded", async() => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();

        initializeUI(refs);

        await loadDataFlow();
    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
