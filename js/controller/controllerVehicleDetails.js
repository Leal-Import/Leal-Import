import {
    getVehicles,
    postVehicle,
    putVehicle
} from '../service/serviceVehicleDetails.js';

import {
    showMessage,
    toggleModal,
    getInputsValues,
    fillForm,
    allowDecimal,
    cleanNumber,
    formatWithCommas,
    allowMotoYear
} from '../utils.js';

const params = new URLSearchParams(window.location.search);

let currentId = params.get("id");

const frmVehicles = document.getElementById("frmVehicles");
const btnLink = document.querySelector(".btnLink");
const btnClose = document.querySelector(".btnClose");
const btnSaveLink = document.getElementById("btnSaveLink")
const modalLink = document.getElementById("modalLink");
const btnBill = document.getElementById("btnBill");
const modalBill = document.getElementById("modalBill");
const modalShip = document.getElementById("modalShip");
const modalTaxes = document.getElementById("modalTaxes");
const dropArea = document.getElementById("dropArea");
const btnTaxes = document.getElementById("btnTaxes");
const fileUploadInput = document.getElementById("fileUploadInput");
const btnSelectImage = document.querySelector("#modalBill .btnFullWidth");
const btnsTransport = document.querySelectorAll(".btnsTransport");
const dropAreaShip = document.getElementById("dropAreaShip");
const fileUploadInputShip = document.getElementById("fileUploadInputShip");
const btnSelectImageShip = document.querySelector("#modalShip .btnFullWidth");
const dropAreaTaxes = document.getElementById("dropAreaTaxes");
const fileUploadInputTaxes = document.getElementById("fileUploadInputTaxes");
const btnSelectImageTaxes = document.querySelector("#modalTaxes .btnFullWidth");

const txtCosts = document.querySelectorAll(".txtCosts");
const txtTotal = document.getElementById("txtTotal");

// imágenes máximas
const MAX_IMAGES = 12;

let shipImageFile = null;
let taxImageFile = null;
let billImageFile = null;

let billImageUrl = null;
let taxImageUrl = null;
let shipImageUrl = null;

// Aquí guardaremos TODAS las imágenes (backend + nuevas)
let images = [];

// elementos DOM
const mainSwiperWrapper = document.getElementById("mainSwiperWrapper");
const thumbsWrapper = document.getElementById("thumbsWrapper");
const imageInput = document.getElementById("imageInput");

let mainSwiper = null;
let thumbsSwiper = null;
let photosToDeleteIds = [];

document.addEventListener("click", (e) => {
    let target = e.target;
    if (target.classList.contains("containerModal")) {
        if (!modalBill.classList.contains("hide")) toggleModal(modalBill, false)
        if (!modalShip.classList.contains("hide")) toggleModal(modalShip, false)
        if (!modalTaxes.classList.contains("hide")) toggleModal(modalTaxes, false)
    }
})

allowMotoYear(document.getElementById("txtYear"));

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
});

allowDecimal(document.getElementById("txtSuggestedPrice"));


btnLink.addEventListener("click", () => {
    toggleModal(modalLink, true);
})

btnClose.addEventListener("click", () => {
    toggleModal(modalLink, false);
})

btnSaveLink.addEventListener("click", () => {
    toggleModal(modalLink, false)
})

document.addEventListener('DOMContentLoaded', async () => {
    currentId ? await loadVehicle() : renderImages();
});

let loadVehicle = async () => {
    document.getElementById("typeAction").textContent = "Actualizar vehiculo"
    const data = await getVehicles(currentId);
    fillForm('#frmVehicles', {
        txtVin: data.vin,
        txtBrand: data.brand,
        txtModel: data.model,
        txtYear: data.year,
        txtMileage: data.mileage,
        txtLote: data.lote.numLote,
        txtLink: data.lote.linkLote,
        txtDescription: data.description,
        txtBill: formatWithCommas(data.costs.bill),
        txtTransfer: formatWithCommas(data.costs.transfer),
        txtStorage: formatWithCommas(data.costs.storage),
        txtTowTruck: formatWithCommas(data.costs.towTruck),
        txtShip: formatWithCommas(data.costs.ship),
        txtTaxes: formatWithCommas(data.costs.taxes),
        txtIva: formatWithCommas(data.costs.iva),
        txtPa: formatWithCommas(data.costs.pa),
        txtTotal: formatWithCommas(data.costs.total),
        txtSuggestedPrice: formatWithCommas(data.costs.suggestedPrice)
    });
    document.getElementById("loteId").value = data.lote.idLote;
    document.getElementById("costId").value = data.costs.idCost;
    billImageUrl = data.costs.costPhoto.billPhoto || null;
    taxImageUrl = data.costs.costPhoto.taxesPhoto || null;
    shipImageUrl = data.costs.costPhoto.shipPhoto || null;
    // Renderizar en los modales
    renderCostPreview(dropArea, billImageUrl);
    renderCostPreview(dropAreaTaxes, taxImageUrl);
    renderCostPreview(dropAreaShip, shipImageUrl);

    loadBackendImages(data.photos);
};

let loadBackendImages = (photos = []) => {
    images = photos.map(p => ({
        id: p.idPhoto,
        url: p.photoUrl,
        file: null,
        isNew: false
    }));
    renderImages();
};

frmVehicles.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = getInputsValues(frmVehicles);

    const {
        txtVin,
        txtBrand,
        txtModel,
        txtYear,
        txtMileage,
        txtLote,
        txtLink,
        txtDescription,
        txtBill,
        txtTransfer,
        txtStorage,
        txtTowTruck,
        txtShip,
        txtTaxes,
        txtIva,
        txtPa,
        txtSuggestedPrice
    } = formData;

    if (!txtVin || !txtModel || !txtMileage || !txtYear || !txtLote || !txtBill || !txtTransfer || !txtStorage || !txtTowTruck || !txtShip || !txtTaxes || !txtIva || !txtPa) {
        showMessage('Por favor, complete todos los campos requeridos.', 'Campos vacios', 'warning');
        return;
    }
    const loteId = document.getElementById("loteId").value;
    const costId = document.getElementById("costId").value;

    const vehicle = {
        vin: txtVin,
        brand: txtBrand,
        model: txtModel,
        year: txtYear,
        mileage: txtMileage,
        description: txtDescription,
        lote: {
            linkLote: txtLink,
            numLote: txtLote
        },
        costs: {
            bill: cleanNumber(txtBill),
            transfer: cleanNumber(txtTransfer),
            storage: cleanNumber(txtStorage),
            towTruck: cleanNumber(txtTowTruck),
            ship: cleanNumber(txtShip),
            taxes: cleanNumber(txtTaxes),
            iva: cleanNumber(txtIva),
            pa: cleanNumber(txtPa),
            suggestedPrice: cleanNumber(txtSuggestedPrice)
        }
    }

    if (loteId || costId) {
        vehicle.lote.idLote = loteId
        vehicle.costs.idCost = costId
    };

    const newFiles = images.filter(img => img.isNew).map(img => img.file);

    if (currentId != null) {
        const newFiles = images.filter(img => img.isNew);
        const remainingOld = images.filter(img => !img.isNew);
        const totalFinal = newFiles.length + remainingOld.length;
        if (totalFinal === 0) {
            showMessage(
                'Debes mantener al menos una imagen',
                'Imagen validación',
                'warning'
            );
            return;
        }
        if (totalFinal > MAX_IMAGES) {
            showMessage(`Máximo ${MAX_IMAGES} imágenes`, "Imagen validación", "warning");
            return;
        }
        vehicle.photosToDeleteIds = photosToDeleteIds;
    } else {
        if (newFiles.length === 0) {
            showMessage('Por favor, agregue al menos una imagen del vehículo.', 'Imagen requerida', 'warning');
            return;
        }
    }

    const fd = new FormData();

    if (billImageFile) fd.append("billPhoto", billImageFile);
    if (taxImageFile) fd.append("taxesPhoto", taxImageFile);
    if (shipImageFile) fd.append("TransferShipPhoto", shipImageFile);

    newFiles.forEach(file => {
        fd.append("photos", file);
    });

    fd.append('vehicleData', JSON.stringify(vehicle));
    try {
        if (currentId != null) {
            await putVehicle(fd, currentId);
            await showMessage('Vehiculo actualizado con éxito!', 'Exito', 'success');
            window.location.href = "../../pages/vehicle.html";
        } else {
            await postVehicle(fd);
            await showMessage('Vehiculo agregado con éxito!', 'Exito', 'success');
            window.location.href = "../../pages/vehicle.html";
        }
    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el vehiculo.';
        showMessage(errorMessage, 'error', 'error');
    }
});



function initSwipers() {
    if (mainSwiper) mainSwiper.destroy(true, true);
    if (thumbsSwiper) thumbsSwiper.destroy(true, true);

    thumbsSwiper = new Swiper("#thumbsSwiper", {
        slidesPerView: 4,
        spaceBetween: 10,
        watchSlidesProgress: true,
    });

    mainSwiper = new Swiper("#mainSwiper", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        thumbs: {
            swiper: thumbsSwiper,
        },
        lazy: true,
    });
}


let deleteImage = (index) => {
    const img = images[index];

    // SI es imagen del backend → guardar su ID
    if (!img.isNew && img.id) {
        photosToDeleteIds.push(img.id);
    }

    images.splice(index, 1);
    renderImages();
};


function createPlusButton() {
    if (images.length >= MAX_IMAGES) return;

    const addThumb = document.createElement("div");
    addThumb.classList.add("swiper-slide", "thumb-add");
    addThumb.textContent = "+";
    addThumb.onclick = () => imageInput.click();

    thumbsWrapper.appendChild(addThumb);
}


function renderImages() {
    mainSwiperWrapper.innerHTML = "";
    thumbsWrapper.innerHTML = "";

    // No hay imágenes → placeholder
    if (images.length === 0) {
        mainSwiperWrapper.innerHTML = `
            <div class="swiper-slide">
                <div class="no-image-container">
                    <div class="no-image-icon">📷</div>
                    <p>No hay imágenes disponibles</p>
                </div>
            </div>
            `;

        createPlusButton();
        initSwipers();
        return;
    }

    // Renderizar imágenes
    images.forEach((img, index) => {
        // Slide principal
        const slide = document.createElement("div");
        slide.classList.add("swiper-slide");
        slide.innerHTML = `<img src="${img.url}" class="previewImg">`;
        mainSwiperWrapper.appendChild(slide);

        // Miniatura
        const thumb = document.createElement("div");
        thumb.classList.add("swiper-slide", "thumb-box");

        thumb.innerHTML = `
                <img src="${img.url}">
                <div class="thumb-delete">×</div>
            `;

        // Botón de eliminar
        const deleteBtn = thumb.querySelector(".thumb-delete");

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteImage(index);
            document.querySelector("#mainSwiper .previewImg") ? document.getElementById("mainSwiper").classList.add("mainSwiperUsed") : document.getElementById("mainSwiper").classList.remove("mainSwiperUsed")
        });

        thumbsWrapper.appendChild(thumb);
    });

    // Botón "+"
    createPlusButton();

    // Reiniciar swipers
    initSwipers();
}

imageInput.addEventListener("change", (e) => {
    const files = [...e.target.files];

    if (images.length + files.length > MAX_IMAGES) {
        showMessage("Limite superado", `Máximo ${MAX_IMAGES} imágenes`, "warning");
        return;
    }

    files.forEach(file => {
        images.push({
            id: null,
            url: URL.createObjectURL(file),
            file: file,
            isNew: true
        });
    });


    renderImages();
    document.querySelector("#mainSwiper .previewImg") ? document.getElementById("mainSwiper").classList.add("mainSwiperUsed") : document.getElementById("mainSwiper").classList.remove("mainSwiperUsed")
    imageInput.value = "";
});



/* Imagenes costos */
function setupCostModal({
    modal,
    dropArea,
    inputFile,
    btnSelect,
    btnOpen,
    fileVariableName
}) {
    /* ABRIR */
    if (btnOpen) btnOpen.addEventListener("click", () => toggleModal(modal, true));

    /* CERRAR */
    modal.querySelector(".btnClose").addEventListener("click", () => {
        toggleModal(modal, false);
    });

    /* CLICK → seleccionar archivo */
    dropArea.addEventListener("click", () => inputFile.click());
    btnSelect.addEventListener("click", () => inputFile.click());

    /* INPUT FILE */
    inputFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        switch (fileVariableName) {
            case "billImageFile": billImageFile = file;
                break;
            case "taxImageFile": taxImageFile = file;
                break;
            case "shipImageFile": shipImageFile = file;
                break;
        }
        updateCostPreview(dropArea, file);
    });

    /* DRAG OVER */
    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.style.borderColor = "var(--danger-color)";
    });

    dropArea.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropArea.style.borderColor = "#ccc";
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.style.borderColor = "#ccc";

        const file = e.dataTransfer.files[0];
        if (!file) return;

        window[fileVariableName] = file;
        updateCostPreview(dropArea, file);
    });
}

function updateCostPreview(area, file) {
    area.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                <img src="${URL.createObjectURL(file)}" 
                    style="width:120px;height:120px;object-fit:contain;border-radius:6px;">
                <p style="font-weight:500">${file.name}</p>
            </div>
        `;
}

function renderCostPreview(area, imgSource) {
    if (!imgSource) return;

    // Si viene del backend es string, si es nueva imagen será File
    const url = typeof imgSource === "string"
        ? imgSource
        : URL.createObjectURL(imgSource);

    area.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                <img src="${url}" class="imgModal">
                <p style="font-weight:500">${typeof imgSource === "string" ? "Imagen cargada" : imgSource.name}</p>
            </div>
        `;
}


/* ================= FACTURA ================= */
setupCostModal({
    modal: modalBill,
    dropArea: dropArea,
    inputFile: fileUploadInput,
    btnSelect: btnSelectImage,
    btnOpen: btnBill,
    fileVariableName: "billImageFile"
});


/* ================= IMPUESTOS ================= */
setupCostModal({
    modal: modalTaxes,
    dropArea: dropAreaTaxes,
    inputFile: fileUploadInputTaxes,
    btnSelect: btnSelectImageTaxes,
    btnOpen: btnTaxes,
    fileVariableName: "taxImageFile"
});


/* ================= TRANSPORTE + BARCO ================= */
/* Inicializar modal de transporte solo una vez */
setupCostModal({
    modal: modalShip,
    dropArea: dropAreaShip,
    inputFile: fileUploadInputShip,
    btnSelect: btnSelectImageShip,
    btnOpen: null,
    fileVariableName: "shipImageFile"
});

/* Conectar ambos botones al modal */
btnsTransport.forEach(btn => {
    btn.addEventListener("click", () => toggleModal(modalShip, true));
});
