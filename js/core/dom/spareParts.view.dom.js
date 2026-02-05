import { formatWithCommas } from "../../utils/formatters.js";
import { $ } from "../../utils/dom.js";

const pictureSparePart = $('pictureSparePart');
const name = $('name');
const brand = $('brand');
const model = $('model');
const year = $('year');
const status = $('status');
const suggestedPrice = $('suggestedPrice');
const tracking = $('tracking');
const purchasePrice = $('purchasePrice');
const taxes = $('taxes');
const totalCost = $('totalCost');

const btnEditSparePart = $("btnEditSparePart");
const statusPart = $("statusBadgeSparePart");

export const loadSparePart = (sparePart) => {
    loadSparePartInfo(sparePart);
    loadDownButtons(sparePart);
}

const loadDownButtons = (sparePart) => {
    btnEditSparePart.href = `sparePartsDetails.html?id=${sparePart.idSparePart}`;
    if (sparePart.status == "Disponible") {
        statusPart.querySelector(".statusText").textContent = "Disponible";
        statusPart.classList.add("aviable");
    } else if (sparePart.status == "Vendido") {
        statusPart.querySelector(".statusText").textContent = "Vendido";
        statusPart.classList.add("sold");
    } else {

    }
}

const loadSparePartInfo = (sparePart) => {
    pictureSparePart.src = sparePart.photoUrl;
    name.textContent = sparePart.nameSpareParts;
    sparePart.billUrl ? name.href = sparePart.billUrl : null;
    brand.textContent = sparePart.brand;
    model.textContent = sparePart.model;
    year.textContent = sparePart.yearPart;
    status.textContent = sparePart.state;
    suggestedPrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.suggestedPrice)}`;
    tracking.textContent = sparePart.tracking.numTracking;
    sparePart.tracking.linkTracking ? tracking.href = sparePart.tracking.linkTracking : null;
    purchasePrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.purchasePrice)}`;
    taxes.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.taxes)}`;
    totalCost.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.totalCost)}`;
}