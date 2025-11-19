import {
    getInputsValues,
    showMessage,
    cleanNumber,
    allowDecimal,
    formatWithCommas,
    toggleModal,
    fillSelect,
    setupModal,
    fillForm
} from "../utils.js";

import {
    postSparePart,
    getStatus,
    getSparePart,
    putSparePart
} from "../service/serviceSparePartsDetails.js";

const dropZone = document.getElementById("dropZone");
const placeholderMsg = document.getElementById("placeholderMsg");
const imgPart = document.getElementById("imgPart");
const fileInput = document.getElementById("fileInput");

const btnAddImg = document.getElementById("btnAddImg");
const btnDeleteImg = document.getElementById("btnDeleteImg");

const frmSpareParts = document.getElementById("frmSpareParts");
const txtCosts = document.querySelectorAll(".txtCosts");
const txtSuggestedPrice = document.getElementById("txtSuggestedPrice");
const txtTotal = document.getElementById("txtTotalCost");
const modalTracking = document.getElementById("modalLinkTracking");
const modalBill = document.getElementById("modalLinkName");
const btnSaveTracking = document.getElementById("btnSaveTracking");
const btnSaveBill = document.getElementById("btnSaveBill");

const params = new URLSearchParams(window.location.search);

let currentId;
let selectedFile = null;
params.get("id") ? currentId = params.get("id") : currentId = null;

setupModal("#btnOpenLinkTracking", "#modalLinkTracking", "#btnCloseTracking", null, "Agregar enlace del tracking");
setupModal("#btnOpenLinkBill", "#modalLinkName", "#btnCloseBill", null, "Agregar enlace de la factura");

btnSaveTracking.addEventListener("click", () => {
    toggleModal(modalTracking, false);
})

btnSaveBill.addEventListener("click", () => {
    toggleModal(modalBill, false);
})

document.addEventListener('DOMContentLoaded', async () => {
    const status = await getStatus();
    fillSelect("cmbPartStatus", status, 'idPartsState', 'state')
    currentId ? await loadSparePart() : null;
});

function updateTotal() {
    let total = 0;

    txtCosts.forEach(input => {
        // Quitar comas antes de convertir a número
        const cleanValue = input.value.replace(/,/g, "");
        const value = parseFloat(cleanValue) || 0;

        total += value;
    });

    txtTotal.value = formatWithCommas(total.toFixed(2));
}

txtCosts.forEach(input => {
    input.addEventListener("input", updateTotal);
    allowDecimal(input);
})

allowDecimal(txtSuggestedPrice);

let loadSparePart = async () => {
    document.getElementById("typeAction").textContent = "Actualizar repuesto"
    const data = await getSparePart(currentId);
    console.log(data)
    fillForm('#frmSpareParts', {
        txtPartName: data.nameSpareParts,
        txtLinkName: data.billUrl,
        txtPartBrand: data.brand,
        txtPartModel: data.model,
        txtPartYear: data.yearPart,
        cmbPartStatus: data.idPartsState,
        txtTracking: data.tracking.numTracking,
        txtLinkTracking: data.tracking.linkTracking,
        txtPurchasePrice: formatWithCommas(data.sparePartsCosts.purchasePrice),
        txtTaxes: formatWithCommas(data.sparePartsCosts.taxes),
        txtSuggestedPrice: formatWithCommas(data.sparePartsCosts.suggestedPrice),
        txtTotalCost: formatWithCommas(data.sparePartsCosts.totalCost),
    });
    
    document.getElementById("trackingId").value = data.tracking.idTracking;
    document.getElementById("costId").value = data.sparePartsCosts.idCostSparePart;


    if (data.photoUrl) {
        imgPart.src = data.photoUrl;
        imgPart.style.display = "block";
        placeholderMsg.style.display = "none";
        selectedFile = null;
    } else {
        imgPart.src = "";
        imgPart.style.display = "none";
        placeholderMsg.style.display = "block";
    }
};

frmSpareParts.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = getInputsValues(frmSpareParts);
    const {
        txtPartName,
        txtPartBrand,
        txtPartModel,
        txtPartYear,
        cmbPartStatus,
        txtTracking,
        txtPurchasePrice,
        txtTaxes,
        txtSuggestedPrice,
        txtLinkName,
        txtLinkTracking
    } = formData;

    // Validaciones
    if (!txtPartName || !txtPartBrand || !txtPartModel || !txtPartYear || !cmbPartStatus || !txtPurchasePrice || !txtTaxes || !txtSuggestedPrice) {
        showMessage('Por favor, complete todos los campos requeridos.', 'Campos vacios', 'warning');
        return;
    }

    // Si estamos agregando, la imagen es obligatoria
    if (!currentId && !selectedFile) {
        showMessage("Debe agregar una imagen del repuesto.", "Imagen faltante", "warning");
        return;
    }

    // Leer el tracking ID si existe
    const trackingId = document.getElementById("trackingId").value;
    const costId = document.getElementById("costId").value;


    const sparePart = {
        nameSpareParts: txtPartName,
        brand: txtPartBrand,
        model: txtPartModel,
        yearPart: txtPartYear,
        idPartsState: cmbPartStatus,
        billUrl: txtLinkName,
        tracking: {
            numTracking: txtTracking,
            linkTracking: txtLinkTracking
        },
        sparePartsCosts: {
            purchasePrice: cleanNumber(txtPurchasePrice),
            taxes: cleanNumber(txtTaxes),
            suggestedPrice: cleanNumber(txtSuggestedPrice)
        }
    };

    // 👉 SOLO enviamos idTracking si existe (editar)
    if (trackingId && costId) {
        sparePart.tracking.idTracking = trackingId;
        sparePart.sparePartsCosts.idCostSparePart = costId;
    }

    const fd = new FormData();
    fd.append("SparePartData", JSON.stringify(sparePart));

    if (selectedFile) {
        fd.append("photo", selectedFile);
    }

    try {
        if (currentId != null) {
            await putSparePart(fd, currentId);
            await showMessage('Repuesto actualizado con éxito!', 'Éxito', 'success');
        } else {
            await postSparePart(fd);
            await showMessage('Repuesto agregado con éxito!', 'Éxito', 'success');
        }

        window.location.href = "../../pages/spareParts.html";

    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el repuesto.';
        showMessage(errorMessage, 'error', 'error');
    }
});




/* Codigo de la imagen */

// Click en "Añadir"
btnAddImg.addEventListener("click", () => fileInput.click());

// Input file
fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        loadImage(e.target.files[0]);
    }
});

// Mostrar imagen
function loadImage(file) {
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
        imgPart.src = reader.result;
        imgPart.style.display = "block";
        placeholderMsg.style.display = "none";
    };
    reader.readAsDataURL(file);
}

// Eliminar imagen
btnDeleteImg.addEventListener("click", () => {
    selectedFile = null;
    imgPart.src = "";
    imgPart.style.display = "none";
    placeholderMsg.style.display = "block";
    fileInput.value = "";
});

// Drag & Drop
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    if (e.dataTransfer.files.length > 0) {
        loadImage(e.dataTransfer.files[0]);
    }
});

// Click dentro del cuadro
dropZone.addEventListener("click", () => fileInput.click());
