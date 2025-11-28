import {
    getVehicles
} from '../service/serviceVehicle.js'
import { getVehicles as getVehicleByVin } from '../service/serviceVehicleDetails.js'
import {
    formatWithCommas,
    allowDecimal
} from '../utils.js'

const params = new URLSearchParams(window.location.search);
const customerName = params.get('customerName') || "Nombre del cliente";
const customerId = params.get('idCustomer') || null;
const saleKey = `saleState_cliente_${customerId}`;

let vehicleId = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadVehicles();

    document.getElementById("customerName").textContent = customerName;
    const firstAmount = document.querySelector('.amounts .amountInput');
    allowDecimal(firstAmount);
    if (firstAmount) {
        firstAmount.addEventListener("input", managePaymentsAndCalculateDebt);
        firstAmount.closest('.containerAmount').setAttribute('data-index', '1');
    }
});

let loadVehicles = async () => {
    const vehicles = await getVehicles();
    insertVehicles(vehicles.content);
}

let insertVehicles = (vehicles) => {
    const container = document.getElementById("tBodyInventory");
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
            //const idSelected = selectedIds.some(id => id == vehicle.vin);
            //if (idSelected) return;

            const tr = document.createElement("tr");
            const tdImage = document.createElement("td");
            const image = document.createElement("img");
            const vin = document.createElement("td");
            const cost = document.createElement("td");
            const suggesredPrice = document.createElement("td");
            const btnAddVehicle = document.createElement("button");

            image.src = vehicle.photoUrl;
            vin.textContent = vehicle.vin;
            cost.textContent = `$${formatWithCommas(vehicle.total)}`;
            suggesredPrice.textContent = `$${formatWithCommas(vehicle.total)}`; /* Por el momento es costo total */

            tr.classList.add("tableRow");
            btnAddVehicle.classList.add("btnPrimary", "btnAddVehicle");
            image.classList.add("imgVehicleTable");

            btnAddVehicle.textContent = "+";

            tdImage.appendChild(image);

            tr.append(tdImage, vin, cost, suggesredPrice, btnAddVehicle);
            fragment.appendChild(tr);

            btnAddVehicle.addEventListener("click", async () => {
                vehicleId = vehicle.vin;
                await loadVehicle(vehicle.vin);
                saveSaleState();
            })

        });
    }

    container.appendChild(fragment);
}

let loadVehicle = async (vin) => {
    const vehicle = await getVehicleByVin(vin);
    // Mostrar contenedor de visualización
    document.querySelector(".viewVechicleContainer").classList.remove("hide");

    // Cargar datos del vehículo
    document.getElementById("vehicleVin").textContent = vehicle.vin;
    document.getElementById("vehicleBrand").textContent = vehicle.brand;
    document.getElementById("vehicleModel").textContent = vehicle.model;
    document.getElementById("vehicleYear").textContent = vehicle.year;
    document.getElementById("lote").textContent = vehicle.lote;
    document.getElementById("bill").textContent = vehicle.billNumber;
    document.getElementById("total").textContent = `$${formatWithCommas(vehicle.total)}`;
    document.getElementById("suggestedPrice").textContent = `$${formatWithCommas(vehicle.suggestedPrice)}`;

    console.log(vehicle.photos);
    loadVehicleImages(vehicle.photos);
}

let managePaymentsAndCalculateDebt = () => {
    const amountContainer = document.querySelector(".amounts");
    let allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));

    const totalSale = document.getElementById("txtTotal").value.replace(/[$,]/g, "") || 0;
    let totalPaid = 0;

    // 1. Eliminar abonos vacíos excepto el primero
    allPayments.forEach((payment, idx) => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat(input.value.replace(/[$,]/g, "")) || 0;

        if (idx > 0 && value === 0) {
            payment.remove();
        }
    });

    // Refrescar nodos
    allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));

    // 2. Renumerar correctamente
    allPayments.forEach((payment, i) => {
        const number = i + 1;
        payment.setAttribute("data-index", number);

        const input = payment.querySelector(".amountInput");
        input.placeholder = `Abono ${number}`;
    });

    // 3. Volver a calcular total pagado
    allPayments.forEach(payment => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat(input.value.replace(/[$,]/g, "")) || 0;
        totalPaid += value;
    });

    // 4. Si el último abono tiene valor → crear otro
    const lastPayment = allPayments[allPayments.length - 1];
    const lastInput = lastPayment.querySelector(".amountInput");
    const lastValue = parseFloat(lastInput.value.replace(/[$,]/g, "")) || 0;

    if (lastValue > 0) {
        addNewPaymentField();
    }

    // 5. Calcular deuda
    const debt = totalSale - totalPaid;
    const dueText = document.getElementById("due");

    dueText.textContent = `$${formatWithCommas(debt)}`;
    dueText.style.color = debt > 0 ? 'var(--danger-color)' : 'var(--success-color)';
};

function addNewPaymentField() {

    const amountContainer = document.querySelector(".amounts");

    // Si el último campo está vacío → NO crear otro
    const lastInput = amountContainer.lastElementChild.querySelector(".amountInput");
    const lastValue = parseFloat(lastInput.value.replace(/[$,]/g, "")) || 0;

    if (lastValue === 0) return;

    const index = amountContainer.children.length + 1;

    const div = document.createElement("div");
    div.classList.add("containerAmount");
    div.setAttribute("data-index", index);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Abono ${index}`;
    input.classList.add("txtInputs", "amountInput");
    allowDecimal(input);
    input.addEventListener("input", managePaymentsAndCalculateDebt);

    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");

    div.append(input, select);
    amountContainer.appendChild(div);
    saveSaleState();
}

function saveSaleState() {
    const payments = [...document.querySelectorAll(".amountInput")].map(input =>
        parseFloat(input.value.replace(/[$,]/g, "")) || 0
    );

    const notes = document.getElementById("txtNotes")?.value || "";
    const commission = parseFloat(document.getElementById("txtCommission")?.value.replace(/[$,]/g, "")) || 0;

    const state = {
        vehicleId,
        payments,
        notes,
        commission
    };

    localStorage.setItem(saleKey, JSON.stringify(state));
}

// =====================================
//     CONFIGURAR CARRUSEL DE IMÁGENES
// =====================================

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
