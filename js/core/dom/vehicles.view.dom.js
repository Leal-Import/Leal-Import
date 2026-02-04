import { $ } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";

// Contenedores HTML
const vin = $("vin");
const brand = $("brand");
const model = $("model");
const year = $("year");
const mileage = $("mileage");
const lote = $("lote");
const purchaseDate = $("purchaseDate");
const status = $("status");
const description = $("description");

const bill = $("bill");
const transfer = $("transfer");
const storage = $("storage");
const transport = $("transport");
const ship = $("ship");
const taxes = $("taxes");
const iva = $("iva");
const pa = $("pa");
const total = $("total");
const suggestedPrice = $("suggestedPrice");

const vehicleStatus = $("vehicleStatus");
const btnEdit = $("btnEdit");
const btnSell = $("btnSell");
const btnHistorial = $("btnHistorial");


// Imágenes
const mainSwiperWrapper = $("mainSwiperWrapper");
const imageGrid = $("imageGrid");

let mainSwiper;

export const loadVehicleData = (vehicle) => {
    loadVehicleInfo(vehicle);
    loadDownButtons(vehicle);
    loadImages(vehicle.photos);
}

const loadDownButtons = (vehicle) => {
    btnEdit.href = `vehicleDetails.html?id=${vehicle.idVehicle}`
    btnSell.href = `addCustomerSale.html?type=vehicle&id=${vehicle.idVehicle}`;
    btnHistorial.href = `workOrderDetails.html?idVehicle=${vehicle.idVehicle}&idCustomer=${vehicle.idOwnerCustomer}`;
    if (vehicle.status == "Disponible") {
        vehicleStatus.querySelector(".statusText").textContent = "Disponible";
        vehicleStatus.classList.add("aviable");
    } else if (vehicle.status == "Vendido") {
        vehicleStatus.querySelector(".statusText").textContent = "Vendido";
        vehicleStatus.classList.add("sold");
    } else {

    }
}

const loadVehicleInfo = (vehicle) => {
    vin.textContent = vehicle.vin;
    brand.textContent = vehicle.brand;
    model.textContent = vehicle.model;
    year.textContent = vehicle.year;
    mileage.textContent = vehicle.mileage;
    lote.textContent = vehicle.lote.numLote;
    purchaseDate.textContent = vehicle.purchaseDate;
    status.textContent = vehicle.status;
    vehicle.lote.linkLote != null ? lote.href = vehicle.lote.linkLote : null;
    description.textContent = vehicle.description;

    description.style.height = "auto";         // resetear para recalcular
    description.style.height = description.scrollHeight + "px";
    description.readOnly = true;

    if (vehicle.costs) {
        bill.textContent = `$${formatWithCommas(vehicle.costs.bill)}`;
        vehicle.costs.costPhoto.billPhoto != null ? bill.href = vehicle.costs.costPhoto.billPhoto : null;
        transfer.textContent = `$${formatWithCommas(vehicle.costs.transfer)}`;
        storage.textContent = `$${formatWithCommas(vehicle.costs.storage)}`;
        transport.textContent = `$${formatWithCommas(vehicle.costs.towTruck)}`;
        vehicle.costs.costPhoto.shipPhoto != null ? transport.href = vehicle.costs.costPhoto.shipPhoto : transport;
        ship.textContent = `$${formatWithCommas(vehicle.costs.ship)}`;
        vehicle.costs.costPhoto.shipPhoto != null ? ship.href = vehicle.costs.costPhoto.shipPhoto : null;
        taxes.textContent = `$${formatWithCommas(vehicle.costs.taxes)}`;
        vehicle.costs.costPhoto.taxesPhoto != null ? taxes.href = vehicle.costs.costPhoto.taxesPhoto : null;
        iva.textContent = `$${formatWithCommas(vehicle.costs.iva)}`;
        pa.textContent = `$${formatWithCommas(vehicle.costs.pa)}`;
        vehicle.costs.suggestedPrice != null ? suggestedPrice.textContent = `$${vehicle.costs.suggestedPrice}` : suggestedPrice.style.display = "none";
        total.textContent = `$${formatWithCommas(vehicle.costs.total)}`;
    }
}

const loadImages = (photos) => {
    // -------------------------
    // Llenar imágenes
    // -------------------------
    photos.forEach(img => {
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

}