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

export const loadSparePart = (sparePart) => {
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