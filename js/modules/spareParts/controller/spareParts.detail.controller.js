import { sparePartDetailState } from "../../../core/state/spareParts.detail.state.js";
import { $, qsa } from "../../../utils/dom.js";
import {
    fillSparePartsBaseForm,
    validateBaseSparePart,
} from "../../../core/logic/spareParts.detail.logic.js";
import { showMessage } from "../../../utils.js";
import { formatWithCommas } from "../../../utils/formatters.js";
import { safeParseFloat } from "../../../utils/validators.js";
import { initSparePartDetailEvents } from "../event/spareParts.detail.event.js";
import { initImageEvents } from "../event/spareParts.uploads.event.js";
import { closeLinkModal, openLinkModal } from "../../../core/dom/spareParts.detail.dom.js";
import { getSparePart } from "../../../service/spareParts.detail.service.js";

const txtCosts = qsa(".txtCosts");
const txtTotal = $('txtTotal');
const frmSpareParts = $('frmSpareParts');
const imageInput = $('imageInput');

const placeholderMsg = $("placeholderMsg");
const imgPart = $("imgPart");
const dropArea = $("dropZone");

export async function loadSparePart() {
    const sparePart = await getSparePart(sparePartDetailState.currentId);
    $("typeAction").textContent = "Actualizar repuesto";
    $("btnSaveData").value = "Actualizar";

    fillSparePartsBaseForm(sparePart)
    sparePartDetailState.trackingId = sparePart.tracking.idTracking;
    sparePartDetailState.costsId = sparePart.sparePartsCosts.idCostSparePart;
}

export async function onSubmitSparePart(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(frmSpareParts));
    const fd = new FormData();

    let imagesValid = validateImage();

    if (imagesValid) {
        showMessage(imagesValid.title, imagesValid.message, 'warning');
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
        if (currentId != null) {
            await putSparePart(fd, currentId);
            await showMessage('Repuesto actualizado con éxito!', 'Éxito', 'success');
        } else {
            response = await postSparePart(fd);
            await showMessage('Repuesto agregado con éxito!', 'Éxito', 'success');
        }

        if (sale) {
            window.location.href = `sparePartSale.html?isNewPart=true&idCustomer=${sparePartDetailState.customerParamId}&customerName=${sparePartDetailState.customerNameParam}&sparePartId=${response.data.idSparePart}&sparePartName=${response.data.nameSpareParts}&suggestedPrice=${response.data.sparePartsCosts.suggestedPrice}&idSale=${sparePartDetailState.sale || ""}`;
            return;
        }
        if (workOrder) {
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


export let onAddImage = () => imageInput.click();

function onCalculateTotal() {
    let total = 0;
    txtCosts.forEach(input => total += safeParseFloat(input.value));
    txtTotal.value = formatWithCommas(total);
}

let onOpenModal = (type) => openLinkModal(type);
let onCloseModal = () => closeLinkModal();

let onChangeUpload = (e) => {
    const file = e.target.files[0];
    const error = validateImage(file);

    if (error) {
        showMessage("Error", error, "warning");
        return;
    }

    sparePartDetailState.image.file = file;
    sparePartDetailState.image.url = URL.createObjectURL(file)

    imageInput.value = "";
};

let onDeleteImage = () => {
    sparePartDetailState.sparePartImage = null;
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
        onCloseModal,
    });

    initImageEvents({
        onChangeUpload,
        onDropModal,
        onAddImage,
        onDeleteImage,
        onDragOver,
        onDragLeave
    });

    if (sparePartDetailState.currentId) {
        await loadSparePart();
    }
});
