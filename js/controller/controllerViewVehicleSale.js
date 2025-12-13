import { getSaleById } from '../service/serviceVehicleSale.js'
import { formatWithCommas } from '../utils.js'
import { loadVehicle } from '../controller/salesHelpers/loadInfoVehicle.js'
import { createRowTable } from '../controller/salesHelpers/loadRowTableSales.js'

const params = new URLSearchParams(window.location.search);
const idSale = params.get("idSale");
const idVehicle = params.get("idVehicle");

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", async () => {
    await loadDataSales();
    if(idVehicle){
        await loadVehicle(idVehicle, idSale);
    }
});

let loadDataSales = async () => {
    const sale = await getSaleById(idSale);
    insertSaleData(sale);
}

let insertSaleData = (sale) => {
    $("employeeName").textContent = sale.employeeFullName;
    $("customerName").textContent = sale.customerFullName;
    $("customerNameLbl").textContent = sale.customerFullName;
    $("saleStatus").textContent = sale.nameStateSale;
    $("dateSale").textContent = sale.saleDate;
    $("txtCommission").value = `$${formatWithCommas(sale.commission)}`;
    $("txtNotes").value = sale.notes;
    $("amountDue").textContent = `$${formatWithCommas(sale.amountDue)}`;
    $("totalAmount").textContent = `$${formatWithCommas(sale.fullTotalCost - sale.amountDue)}`;
    $("total").textContent = `$${formatWithCommas(sale.fullTotalCost)}`;
    sale.payments.forEach(payment => {
        createRowTable("tBodyAmount", payment.idPayment, "Ejemplo", payment.amount, null, null, "tdAmount", "tdTypeAmount", null, true)
    });
    console.log(sale)
}