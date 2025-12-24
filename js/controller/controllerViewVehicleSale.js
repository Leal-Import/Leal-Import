import { getSaleById } from '../service/serviceVehicleSale.js'
import { formatWithCommas, toggleModal } from '../utils.js'
import { loadVehicle } from '../controller/salesHelpers/loadInfoVehicle.js'
import { createRowTable } from '../controller/salesHelpers/loadRowTableSales.js'

const params = new URLSearchParams(window.location.search);
const idSale = params.get("idSale");
const idVehicle = params.get("idVehicle");

const paymentModal = document.getElementById("paymentDetailModal");
const closePaymentModalBtn = document.getElementById("closePaymentDetailModal");
const paymentModalContent = paymentModal.querySelector(".modalPaymentDetail");

paymentModal.addEventListener("click", () => {
    toggleModal(paymentModal, false);
});

paymentModalContent.addEventListener("click", (e) => {
    e.stopPropagation();
});

closePaymentModalBtn.addEventListener("click", () => {
    toggleModal(paymentModal, false);
});

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", async () => {
    if (idVehicle) {
        await loadVehicle(idVehicle, idSale);
    }
    await loadDataSales();
});

function addPaymentDetailLink(payment) {
    const tbody = document.getElementById("tBodyAmount");
    if (!tbody) return;

    const row = tbody.querySelector(`tr[data-id="${payment.idPayment}"]`);
    if (!row) return;

    // Evitar duplicados
    if (row.querySelector(".paymentDetailLink")) return;

    const td = document.createElement("td");
    td.classList.add("tdActions");

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "Detalles";
    link.classList.add("paymentDetailLink");

    link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPaymentDetailModal(payment);
    });

    td.appendChild(link);
    row.appendChild(td);
}

function openPaymentDetailModal(payment) {
    toggleModal(paymentModal, true);
    document.getElementById("pdMethod").textContent = payment.paymentMethod;
    document.getElementById("pdAmount").textContent = formatWithCommas(payment.amount);
    document.getElementById("pdDate").textContent = payment.paymentDate ?? "N/A";
    document.getElementById("pdEmployee").textContent = payment.employeeName ?? "N/A";

    renderPaymentImage(payment);
}

function renderPaymentImage(payment) {
    const container = document.getElementById("pdImageContainer");
    container.innerHTML = "";

    if (!payment.paymentURL) {
        container.innerHTML = "<p style='color:#888'>Sin comprobante</p>";
        return;
    }

    const img = document.createElement("img");
    img.src = payment.paymentURL;
    img.alt = "Comprobante de pago";

    container.appendChild(img);
}

let loadDataSales = async () => {
    const sale = await getSaleById(idSale);
    insertSaleData(sale);
}

let insertSaleData = (sale) => {
    const percentage = Math.round(((sale.fullTotalCost - sale.amountDue) / sale.fullTotalCost) * 100) + "%";
    const status = sale.nameStateSale;
    console.log(sale)

    $("employeeName").textContent = sale.employeeFullName;
    $("customerName").textContent = sale.customerFullName;
    $("saleStatus").textContent = status;
    if (status == "Pendiente") $("saleStatus").classList.add("pendingStatus");
    else $("saleStatus").classList.add("successStatus");

    $("dateSale").textContent = sale.saleDate;
    $("commission").textContent = `$${formatWithCommas(sale.commission)}`;
    $("txtNotes").value = sale.notes;
    $("amountDue").textContent = `$${formatWithCommas(sale.amountDue)}`;
    $("totalAmount").textContent = `$${formatWithCommas(sale.fullTotalCost - sale.amountDue)}`;
    $("total").textContent = `$${formatWithCommas(sale.fullTotalCost)}`;
    $("percentage").style.width = percentage;
    $("percentageInfo").textContent = `${percentage} Pagado`;
    sale.payments.forEach(payment => {
        createRowTable("tBodyAmount", payment.idPayment, payment.paymentMethod, payment.amount, null, null, "tdAmount", "tdTypeAmount", null, true);
        addPaymentDetailLink(payment);
    });
}