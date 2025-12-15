import { getSaleById } from '../service/serviceVehicleSale.js'
import { formatWithCommas } from '../utils.js'
import { loadVehicle } from '../controller/salesHelpers/loadInfoVehicle.js'
import { createRowTable } from '../controller/salesHelpers/loadRowTableSales.js'

const params = new URLSearchParams(window.location.search);
const idSale = params.get("idSale");
const idVehicle = params.get("idVehicle");

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", async () => {
    if(idVehicle){
        await loadVehicle(idVehicle, idSale);
    }
    await loadDataSales();
});

let loadDataSales = async () => {
    const sale = await getSaleById(idSale);
    insertSaleData(sale);
}

let insertSaleData = (sale) => {
    const percentage = Math.round(((sale.fullTotalCost - sale.amountDue) / sale.fullTotalCost) * 100) + "%";
    const status = sale.nameStateSale;

    $("employeeName").textContent = sale.employeeFullName;
    $("customerName").textContent = sale.customerFullName;
    $("saleStatus").textContent = status;
    if(status == "Pendiente") $("saleStatus").classList.add("pendingStatus");
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
        createRowTable("tBodyAmount", payment.idPayment, "Ejemplo", payment.amount, null, null, "tdAmount", "tdTypeAmount", null, true)
    });
}