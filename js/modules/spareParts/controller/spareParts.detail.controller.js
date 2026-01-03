import { sparePartDetailState } from "../../../core/state/spareParts.detail.state.js";
import { $, qsa } from "../../../utils/dom.js";
import {
    fillSparePartsBaseForm,
    mapSparePart,
    validateBaseSparePart,
    validateImage,
} from "../../../core/logic/spareParts.detail.logic.js";
import { fillSelect, showMessage } from "../../../utils.js";
import { formatWithCommas } from "../../../utils/formatters.js";
import { safeParseFloat } from "../../../utils/validators.js";
import { initSparePartDetailEvents } from "../event/spareParts.detail.event.js";
import { initImageEvents } from "../event/spareParts.uploads.event.js";
import { loadImage, openLinkModal, saveLinkModal } from "../../../core/dom/spareParts.detail.dom.js";
import { getSparePart, postSparePart, putSparePart } from "../../../service/spareParts.detail.service.js";
import { getStatus } from "../../../service/spareParts.service.js";

const txtCosts = qsa(".txtCosts");
const txtTotal = $('txtTotalCost');
const frmSpareParts = $('frmSpareParts');

const placeholderMsg = $("placeholderMsg");
const imgPart = $("imgPart");
const dropArea = $("dropZone");

async function loadStatusSelect() {
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
}

export async function loadSparePart() {
    const sparePart = await getSparePart(sparePartDetailState.currentId);
    $("typeAction").textContent = "Actualizar repuesto";
    $("btnSaveData").value = "Actualizar";

    fillSparePartsBaseForm(sparePart)
    loadImage(sparePart.photoUrl);
    sparePartDetailState.trackingId = sparePart.tracking.idTracking;
    sparePartDetailState.costsId = sparePart.sparePartsCosts.idCostSparePart;
    sparePartDetailState.links.bill = sparePart.billUrl;
    sparePartDetailState.links.tracking = sparePart.tracking.linkTracking;
    $("btnDeleteImg").classList.add("hide");
    $("btnAddImg").textContent = "Actualizar foto";
}

export async function onSubmitSparePart(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(frmSpareParts));
    const fd = new FormData();
    let imagesValid;
    if (sparePartDetailState.currentId && sparePartDetailState.image.file) {
        imagesValid = validateImage(sparePartDetailState.image.file);
    } else if (!sparePartDetailState.currentId) {
        imagesValid = validateImage(sparePartDetailState.image.file);
    }


    if (imagesValid) {
        showMessage('Imagen no valida', imagesValid, 'warning');
        return;
    }
    const error = validateBaseSparePart(formData);
    if (error) {
        showMessage('Datos no válidos', error, 'warning');
        return;
    }
    let payloadSparePart = mapSparePart(formData);


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
        if (sparePartDetailState.currentId != null) {
            await putSparePart(fd, sparePartDetailState.currentId);
            await showMessage('Repuesto actualizado con éxito!', 'Éxito', 'success');
        } else {
            response = await postSparePart(fd);
            await showMessage('Repuesto agregado con éxito!', 'Éxito', 'success');
        }

        if (sparePartDetailState.sale) {
            window.location.href = `sparePartSale.html?isNewPart=true&idCustomer=${sparePartDetailState.customerParamId}&customerName=${sparePartDetailState.customerNameParam}&sparePartId=${response.data.idSparePart}&sparePartName=${response.data.nameSpareParts}&suggestedPrice=${response.data.sparePartsCosts.suggestedPrice}&idSale=${sparePartDetailState.sale || ""}`;
            return;
        }
        if (sparePartDetailState.isWorkOrder) {
            const paramsOrder = new URLSearchParams({
                isNewPart: true,
                idSale: sparePartDetailState.sale || null,
                customerName: sparePartDetailState.customerNameParam,
                idVehicle: sparePartDetailState.vehicleParamId,
                idCustomer: sparePartDetailState.customerParamId,
                totalPrice: sparePartDetailState.totalPriceParam,
                newSparePartId: response.data.idSparePart,
                newSparePartName: response.data.nameSpareParts,
                newSuggestedPrice: response.data.sparePartsCosts.suggestedPrice,
                idWorkOrder: sparePartDetailState.workOrder || null
            })
            window.location.href = `addWorkOrder.html?${paramsOrder.toString()}`;
        } else {
            window.location.href = "spareParts.html";
        }

    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el repuesto.';
        showMessage(errorMessage, 'error', 'error');
    }
}


export let onAddImage = () => $("fileInput").click();

function onCalculateTotal() {
    let total = 0;
    txtCosts.forEach(input => total += safeParseFloat(input.value));
    txtTotal.value = formatWithCommas(total);
}

let onOpenModal = (type) => openLinkModal(type);
let onSaveDataModal = () => saveLinkModal();

let onChangeUpload = (e) => {
    const file = e.target.files[0];
    const error = validateImage(file);

    if (error) {
        showMessage("Error", error, "warning");
        return;
    }

    sparePartDetailState.image.file = file;
    sparePartDetailState.image.url = URL.createObjectURL(file)

    loadImage(file);
};

let onDeleteImage = () => {
    sparePartDetailState.image.file = null;
    sparePartDetailState.image.url = null;

    imgPart.src = "";
    imgPart.style.display = "none";
    placeholderMsg.style.display = "block";
    $("fileInput").value = "";
};

let onDropModal = (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
}

let onDragOver = (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
}

let onDragLeave = () => {
    dropArea.classList.remove("dragover");
}

document.addEventListener("DOMContentLoaded", async () => {
    initSparePartDetailEvents({
        onSubmit: onSubmitSparePart,
        onCalculateTotal,
        onOpenModal,
        onSaveDataModal,
    });

    initImageEvents({
        onChangeUpload,
        onDropModal,
        onAddImage,
        onDeleteImage,
        onDragOver,
        onDragLeave
    });

    await loadStatusSelect();
    if (sparePartDetailState.currentId) {
        await loadSparePart();
    }

});
