import { loadSparePart } from '../core/dom/spareParts.view.dom.js';
import { getSparePart } from '../service/spareParts.detail.service.js'
import { formatWithCommas } from '../utils.js'
import { showMessage } from '../utils/dom.js';

const pictureSparePart = document.getElementById('pictureSparePart');
const name = document.getElementById('name');
const brand = document.getElementById('brand');
const model = document.getElementById('model');
const year = document.getElementById('year');
const status = document.getElementById('status');
const suggestedPrice = document.getElementById('suggestedPrice');
const tracking = document.getElementById('tracking');
const purchasePrice = document.getElementById('purchasePrice');
const taxes = document.getElementById('taxes');
const totalCost = document.getElementById('totalCost');
const params = new URLSearchParams(window.location.search)

const currentId = params.get("id");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const sparePart = await getSparePart(currentId);
        loadSparePart(sparePart)
    } catch (error) {
        console.error(error);
        showMessage("Error", "No se pudo cargar el repuesto", "error");
    }
})

let loadData = (sparePart) => {
    pictureSparePart.src = sparePart.photoUrl;
    name.textContent = sparePart.nameSpareParts;
    sparePart.billUrl ? name.href = sparePart.billUrl : null;
    brand.textContent = sparePart.brand;
    model.textContent = sparePart.model;
    year.textContent = sparePart.yearPart;
    status.textContent = sparePart.state;
    suggestedPrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.suggestedPrice)}`;
    tracking.textContent = sparePart.tracking.numTracking;
    sparePart.tracking.linkTracking ?tracking.href = sparePart.tracking.linkTracking : null;
    purchasePrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.purchasePrice)}`;
    taxes.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.taxes)}`;
    totalCost.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.totalCost)}`;

}