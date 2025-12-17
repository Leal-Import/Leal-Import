import { getVehicles as getVehicleByVin } from '../../service/serviceVehicleDetails.js'
import { formatWithCommas } from '../../utils.js';

const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelector(selector);

export let loadVehicle = async (id, idSale) => {
    const vehicle = await getVehicleByVin(id);

    $$(".viewVechicleContainer")?.classList.remove("hide");

    $("vehicleVin").textContent = vehicle.vin;
    $("vehicleBrand").textContent = vehicle.brand;
    $("vehicleModel").textContent = vehicle.model;
    $("vehicleYear").textContent = vehicle.year;
    $("purchaseDate").textContent = vehicle.purchaseDate;
    $("mileaje").textContent = vehicle.mileage;
    $("lote").textContent = vehicle.lote.numLote;
    if (vehicle.lote.linkLote) $("lote").href = vehicle.lote.linkLote;
    $("status").textContent = vehicle.status;

    if (vehicle.costs) {
        $("suggestedPrice").textContent = `$${formatWithCommas(vehicle.costs.suggestedPrice)}`;

        $("bill").textContent = `$${formatWithCommas(vehicle.costs.bill)}`;
        if (vehicle.costs.costPhoto.billPhoto) $("bill").href = vehicle.costs.costPhoto.billPhoto;
        $("ship").textContent = `$${formatWithCommas(vehicle.costs.ship)}`;
        if (vehicle.costs.costPhoto.shipPhoto) $("ship").href = vehicle.costs.costPhoto.shipPhoto;
        $("towTruck").textContent = `$${formatWithCommas(vehicle.costs.towTruck)}`;
        if (vehicle.costs.costPhoto.shipPhoto) $("towTruck").href = vehicle.costs.costPhoto.shipPhoto;
        $("iva").textContent = `$${formatWithCommas(vehicle.costs.iva)}`;
        $("taxes").textContent = `$${formatWithCommas(vehicle.costs.taxes)}`;
        if (vehicle.costs.costPhoto.taxesPhoto) $("taxes").href = vehicle.costs.costPhoto.taxesPhoto;
        $("transfer").textContent = `$${formatWithCommas(vehicle.costs.transfer)}`;
        $("pa").textContent = `$${formatWithCommas(vehicle.costs.pa)}`;
        $("stotage").textContent = `$${formatWithCommas(vehicle.costs.storage)}`;
        if (!idSale && $("txtTotal")) {
            $("txtTotal").value = `$${formatWithCommas(vehicle.costs.suggestedPrice)}`;
        }
        if ($("totalCostV")) {
            $("totalCostV").textContent = `$${formatWithCommas(vehicle.costs.total)}`;
        } else if ($("total")) {
            $("total").textContent = `$${formatWithCommas(vehicle.costs.total)}`;
        }

        $$(".columnCosts")?.classList.remove("hide");
        $$(".suggestedItem")?.classList.remove("hide");
    } else {
        $$(".suggestedItem")?.classList.add("hide");
        $$(".columnCosts")?.classList.add("hide");
    }

    loadVehicleImages(vehicle.photos);
};


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