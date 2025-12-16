import { getVehicles as getVehicleByVin } from '../../service/serviceVehicleDetails.js'
import { formatWithCommas } from '../../utils.js';

export let loadVehicle = async (id, idSale) => {
    const vehicle = await getVehicleByVin(id);
    if (document.getElementById("totalCostV")) document.getElementById("totalCostV").textContent = `$${formatWithCommas(vehicle.costs.total)}`;
    else document.getElementById("total").textContent = `$${formatWithCommas(vehicle.costs.total)}`;
    // Mostrar contenedor de visualización
    document.querySelector(".viewVechicleContainer").classList.remove("hide");

    // Cargar datos del vehículo
    document.getElementById("vehicleVin").textContent = vehicle.vin;
    document.getElementById("vehicleBrand").textContent = vehicle.brand;
    document.getElementById("vehicleModel").textContent = vehicle.model;
    document.getElementById("vehicleYear").textContent = vehicle.year;
    document.getElementById("purchaseDate").textContent = vehicle.purchaseDate;
    document.getElementById("mileaje").textContent = vehicle.mileage;
    document.getElementById("lote").textContent = vehicle.lote.numLote;
    vehicle.lote.linkLote != null ? document.getElementById("lote").href = vehicle.lote.linkLote : null;
    document.getElementById("status").textContent = vehicle.status;
    document.getElementById("suggestedPrice").textContent = `$${formatWithCommas(vehicle.costs.suggestedPrice)}`; // Por el momento es costo total

    document.getElementById("bill").textContent = `$${formatWithCommas(vehicle.costs.bill)}`;
    vehicle.costs.costPhoto.billPhoto != null ? document.getElementById("bill").href = vehicle.costs.costPhoto.billPhoto : null;
    document.getElementById("ship").textContent = `$${formatWithCommas(vehicle.costs.ship)}`;
    vehicle.costs.costPhoto.shipPhoto != null ? document.getElementById("ship").href = vehicle.costs.costPhoto.shipPhoto : null;
    document.getElementById("towTruck").textContent = `$${formatWithCommas(vehicle.costs.towTruck)}`;
    vehicle.costs.costPhoto.shipPhoto != null ? document.getElementById("towTruck").href = vehicle.costs.costPhoto.shipPhoto : null;
    document.getElementById("iva").textContent = `$${formatWithCommas(vehicle.costs.iva)}`;
    document.getElementById("taxes").textContent = `$${formatWithCommas(vehicle.costs.taxes)}`;
    vehicle.costs.costPhoto.taxesPhoto != null ? document.getElementById("taxes").href = vehicle.costs.costPhoto.taxesPhoto : null;
    document.getElementById("transfer").textContent = `$${formatWithCommas(vehicle.costs.transfer)}`;
    document.getElementById("pa").textContent = `$${formatWithCommas(vehicle.costs.pa)}`;
    document.getElementById("stotage").textContent = `$${formatWithCommas(vehicle.costs.storage)}`;

    if (!idSale) document.getElementById("txtTotal").value = `$${formatWithCommas(vehicle.costs.suggestedPrice)}`; /* Aca por defecto va a ir el precio sugerido */

    loadVehicleImages(vehicle.photos);
}

let mainSwiper;
let thumbsSwiper;

function loadVehicleImages(imagesArray) {
    const mainWrapper = document.getElementById("mainSwiperWrapper");
    const thumbsWrapper = document.getElementById("thumbsWrapper");

    mainWrapper.innerHTML = "";
    thumbsWrapper.innerHTML = "";

    imagesArray.forEach(img => {
        mainWrapper.innerHTML += `
            <div class="swiper-slide">
                <img src="${img.photoUrl}" class="mainImage" alt="vehicle image">
            </div>
        `;

        thumbsWrapper.innerHTML += `
            <div class="swiper-slide">
                <img src="${img.photoUrl}" class="thumbImage" alt="thumbnail">
            </div>
        `;
    });

    if (thumbsSwiper) thumbsSwiper.destroy();
    if (mainSwiper) mainSwiper.destroy();

    thumbsSwiper = new Swiper("#thumbsSwiper", {
        spaceBetween: 10,
        slidesPerView: 6,
        freeMode: true,
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
    });
}