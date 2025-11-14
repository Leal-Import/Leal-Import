import { getVehicles } from "../service/serviceVehicleDetails.js";

// Contenedores HTML
const vin = document.getElementById("vin");
const brand = document.getElementById("brand");
const model = document.getElementById("model");
const year = document.getElementById("year");
const mileage = document.getElementById("mileage");
const lote = document.getElementById("lote");
const purchaseDate = document.getElementById("purchaseDate");
const status = document.getElementById("status");
const description = document.getElementById("description");

const bill = document.getElementById("bill");
const transfer = document.getElementById("transfer");
const storage = document.getElementById("storage");
const transport = document.getElementById("transport");
const ship = document.getElementById("ship");
const taxes = document.getElementById("taxes");
const iva = document.getElementById("iva");
const pa = document.getElementById("pa");
const total = document.getElementById("total");

// Imágenes
const mainSwiperWrapper = document.getElementById("mainSwiperWrapper");
const imageGrid = document.getElementById("imageGrid");

let mainSwiper;


// Obtener ID del vehículo desde el URL
const params = new URLSearchParams(window.location.search);
const idVehicle = params.get("id");

document.addEventListener("DOMContentLoaded", async () => {

    let vehicle = await getVehicles(0, 15, idVehicle);
    vehicle = vehicle.content[0];

    // -------------------------
    // Llenar información del vehículo
    // -------------------------
    vin.textContent = vehicle.vin;
    brand.textContent = vehicle.brand;
    model.textContent = vehicle.model;
    year.textContent = vehicle.year;
    mileage.textContent = vehicle.mileage;
    lote.textContent = vehicle.lote.numLote;
    purchaseDate.textContent = vehicle.purchaseDate;
    status.textContent = vehicle.status;
    lote.href = vehicle.lote.linkLote;
    description.textContent = vehicle.description;

    description.style.height = "auto";         // resetear para recalcular
    description.style.height = description.scrollHeight + "px";

    bill.textContent = `$${vehicle.costs.bill}`;
    transfer.textContent = `$${vehicle.costs.transfer}`;
    storage.textContent = `$${vehicle.costs.storage}`;
    transport.textContent = `$${vehicle.costs.towTruck}`;
    ship.textContent = `$${vehicle.costs.ship}`;
    taxes.textContent = `$${vehicle.costs.taxes}`;
    iva.textContent = `$${vehicle.costs.iva}`;
    pa.textContent = `$${vehicle.costs.pa}`;
    total.textContent = `$${vehicle.costs.total}`;

    // -------------------------
    // Llenar imágenes
    // -------------------------
    vehicle.photos.forEach(img => {
        mainSwiperWrapper.innerHTML += `
            <div class="swiper-slide">
                <img src="${img.photoUrl}" />
            </div>
        `;

        imageGrid.innerHTML += `
            <img src="${img.photoUrl}" />
        `;
    });

    // -------------------------
    // Inicializar Swiper
    // -------------------------
    mainSwiper = new Swiper("#mainSwiper", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        }
    });

    // -------------------------
    // Sincronizar grid con el swiper
    // -------------------------

    const gridImages = document.querySelectorAll(".imageGrid img");

    // Seleccionar primera imagen por defecto
    if (gridImages.length > 0) {
        gridImages[0].classList.add("selected");
    }

    // Click en miniatura → cambiar slide + focus
    gridImages.forEach((imgElement, index) => {
        imgElement.addEventListener("click", () => {

            mainSwiper.slideTo(index);

            gridImages.forEach(img => img.classList.remove("selected"));
            imgElement.classList.add("selected");
        });
    });

    // Flechas → actualizar el focus automáticamente
    mainSwiper.on("slideChange", () => {
        const currentIndex = mainSwiper.activeIndex;

        // Limpiar anteriores
        gridImages.forEach(img => img.classList.remove("selected"));

        // Aplicar foco al que corresponde
        if (gridImages[currentIndex]) {
            gridImages[currentIndex].classList.add("selected");
        }
    });

    description.readOnly = true;
});
