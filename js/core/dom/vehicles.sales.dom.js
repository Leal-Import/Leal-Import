import { $, qs } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";

export const cleanPaymentCamps = () => {
    const amountInput = $('txtAmount');
    const methodSelect = $('paymentMethod');
    if (amountInput) amountInput.value = '';
    if (methodSelect) methodSelect.value = '';
}

export let insertVehicles = (container, vehicles, onAddVehicle) => {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (vehicles == 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        td.classList.add("no-data-message"); // opcional para estilos
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);
        document.querySelector(".table").style.height = "100%";
    } else {
        vehicles.forEach(vehicle => {

            const tr = document.createElement("tr");
            const tdImage = document.createElement("td");
            const image = document.createElement("img");
            const vin = document.createElement("td");
            const cost = document.createElement("td");
            const suggesredPrice = document.createElement("td");
            const btnAddVehicle = document.createElement("button");

            image.src = vehicle.photoUrl;
            vin.textContent = vehicle.vin;
            if (vehicle.total && vehicle.suggestedPrice) {
                cost.textContent = `$${formatWithCommas(vehicle.total)}`;
                suggesredPrice.textContent = `$${formatWithCommas(vehicle.suggestedPrice)}`; /* Por el momento es costo total */
            } else {
                cost.textContent = `Externo`;
                suggesredPrice.textContent = `Externo`; /* Por el momento es costo total */
            }

            tr.classList.add("tableRow");
            btnAddVehicle.classList.add("btnPrimary", "btnAddItem");
            image.classList.add("imgTable");

            btnAddVehicle.textContent = "+";

            tdImage.appendChild(image);

            tr.append(tdImage, vin, cost, suggesredPrice, btnAddVehicle);
            fragment.appendChild(tr);

            btnAddVehicle.addEventListener("click", () => onAddVehicle(vehicle));

        });
    }

    container.appendChild(fragment);
}

export let loadVehicle = (vehicle, idSale) => {

    qs(".viewVechicleContainer")?.classList.remove("hide");

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

        qs(".columnCosts")?.classList.remove("hide");
        qs(".suggestedItem")?.classList.remove("hide");
    } else {
        qs(".suggestedItem")?.classList.add("hide");
        qs(".columnCosts")?.classList.add("hide");
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

export let loadCustomerName = (customerName) => {
    $("customerName").textContent = customerName;
}

export let loadDomData = (data) => {
    $("txtNotes").value = data.notes;
    $("txtTotal").value = `$${formatWithCommas(data.salePrice)}`;
    $("txtCommission").value = `$${formatWithCommas(data.commission)}`
    $("btnSaveSale").textContent = "Actualizar venta";
    $("btnCreateOrder").classList.add("hide");
    $("btnCancelVehicle").classList.add("hide");
}


//A esto todavia le falta diseño
export function renderTotals({ total, due, totalPaid }) {
    //const totalText = $("total");
    const dueText = $("due");
    const paidText = $('totalPaid');
    const totalText = $('totalVehicle');
    if (paidText) {
        paidText.textContent = `$${formatWithCommas(totalPaid)}`
    }
    if (dueText) {
        dueText.textContent = `$${formatWithCommas(due)}`;
    }
    if (totalText) {
        totalText.textContent = `$${formatWithCommas(total)}`;
    }
}