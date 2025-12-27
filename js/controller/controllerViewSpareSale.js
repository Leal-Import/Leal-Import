import { getSparePartById } from '../service/serviceSparePartsSale.js'
import { formatWithCommas } from '../utils.js'
import { createRowTable } from '../controller/salesHelpers/loadRowTableSales.js'
import { insertSpareParts } from '../controller/salesHelpers/loadTableSpareParts.js'

const params = new URLSearchParams(window.location.search);
const idSale = params.get("idSale");
const idVehicle = params.get("idVehicle");

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", async () => {
    await loadDataSales();
});

let loadDataSales = async () => {
    const sale = await getSparePartById(idSale);
    insertSaleData(sale);
}

let insertSaleData = (sale) => {
    console.log(sale)
    const percentage = Math.round(((sale.salePrice - sale.amountDue) / sale.salePrice) * 100) + "%";
    const status = sale.nameStateSale;
    $("employeeName").textContent = sale.employeeFullName;
    $("customerName").textContent = sale.customerFullName;
    $("saleStatus").textContent = status;
    if (status == "Pendiente") $("saleStatus").classList.add("pendingStatus");
    else $("saleStatus").classList.add("successStatus");
    $("dateSale").textContent = sale.saleDate;
    $("txtNotes").value = sale.notes;
    $("amountDue").textContent = `$${formatWithCommas(sale.amountDue)}`;
    $("totalAmount").textContent = `$${formatWithCommas(sale.salePrice - sale.amountDue)}`;
    $("total").textContent = `$${formatWithCommas(sale.salePrice)}`;
    $("percentage").style.width = percentage;
    $("percentageInfo").textContent = `${percentage} Pagado`;
    sale.payments.forEach(payment => {
        createRowTable("tBodyAmount", payment.idPayment, payment.paymentMethod, payment.amount, null, null, "tdAmount", "tdTypeAmount", null)
    });
    insertSpareParts(sale.sparePartItems, "tBodyInventory", null, null);
}