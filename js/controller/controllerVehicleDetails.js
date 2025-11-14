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
    allowDecimal
} from '../utils.js';

const params = new URLSearchParams(window.location.search);

let currentId = params.get("id");

const frmVehicles = document.getElementById("frmVehicles");
const btnLink = document.querySelector(".btnLink");
const btnClose = document.querySelector(".btnClose");
const btnSaveLink = document.getElementById("btnSaveLink")
const modalLink = document.getElementById("modalLink");

const txtCosts = document.querySelectorAll(".txtCosts");
const txtTotal = document.getElementById("txtTotal");

// imágenes máximas
const MAX_IMAGES = 12;

// Aquí guardaremos TODAS las imágenes (backend + nuevas)
let images = [];

// elementos DOM
const mainSwiperWrapper = document.getElementById("mainSwiperWrapper");
const thumbsWrapper = document.getElementById("thumbsWrapper");
const imageInput = document.getElementById("imageInput");

let mainSwiper = null;
let thumbsSwiper = null;
let photosToDeleteIds = [];

txtCosts.forEach(input => {
    allowDecimal(input);
});

function updateTotal() {
    let total = 0;

    txtCosts.forEach(input => {
        const value = parseFloat(input.value) || 0;
        total += value;
    });

    txtTotal.value = total.toFixed(2);
}

txtCosts.forEach(input => {
    input.addEventListener("input", updateTotal);
});


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
    const vehicle = await getVehicles(0, 15, currentId);
    const data = vehicle.content[0];
    fillForm('#frmVehicles', {
        txtVin: data.vin,
        txtBrand: data.brand,
        txtModel: data.model,
        txtYear: data.year,
        txtMileage: data.mileage,
        txtLote: data.lote.numLote,
        txtLink: data.lote.linkLote,
        txtDescription: data.description,
        txtBill: data.costs.bill,
        txtTransfer: data.costs.transfer,
        txtStorage: data.costs.storage,
        txtTowTruck: data.costs.towTruck,
        txtShip: data.costs.ship,
        txtTaxes: data.costs.taxes,
        txtIva: data.costs.iva,
        txtPa: data.costs.pa,
        txtTotal: data.costs.total

    });
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
        txtPa
    } = formData;

    if (!txtVin || !txtModel || !txtMileage || !txtYear || !txtLote || !txtBill || !txtTransfer || !txtStorage || !txtTowTruck || !txtShip || !txtTaxes || !txtIva || !txtPa || !txtLink) {
        showMessage('Por favor, complete todos los campos requeridos.', 'Campos vacios', 'warning');
        return;
    }

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
            bill: txtBill,
            transfer: txtTransfer,
            storage: txtStorage,
            towTruck: txtTowTruck,
            ship: txtShip,
            taxes: txtTaxes,
            iva: txtIva,
            pa: txtPa,
        }
    }

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
    imageInput.value = "";
});


