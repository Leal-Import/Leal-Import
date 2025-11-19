import { getSparePart } from '../service/serviceSparePartsDetails.js'
import { formatWithCommas } from '../utils.js'

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
    const sparePart = await getSparePart(currentId);
    loadData(sparePart)
})

let loadData = (sparePart) => {
    console.log(sparePart)
    pictureSparePart.src = sparePart.photoUrl;
    name.textContent = sparePart.nameSpareParts;
    name.href = sparePart.billUrl;
    brand.textContent = sparePart.brand;
    model.textContent = sparePart.model;
    year.textContent = sparePart.yearPart;
    status.textContent = sparePart.state;
    suggestedPrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.suggestedPrice)}`;
    tracking.textContent = sparePart.tracking.numTracking;
    tracking.href = sparePart.tracking.linkTracking;
    purchasePrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.purchasePrice)}`;
    taxes.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.taxes)}`;
    totalCost.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.totalCost)}`;

}