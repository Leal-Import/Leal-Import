import { formatWithCommas } from "../../utils/formatters.js";
import { $, qs } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            pictureSparePart: $('pictureSparePart'),
            name: $('name'),
            brand: $('brand'),
            model: $('model'),
            year: $('year'),
            status: $('status'),
            suggestedPrice: $('suggestedPrice'),
            tracking: $('tracking'),
            purchasePrice: $('purchasePrice'),
            taxes: $('taxes'),
            totalCost: $('totalCost'),
            btnEditSparePart: $('btnEditSparePart'),
            btnSellSparePart: $('btnSellSparePart'),
            statusPart: qs('.statusBadgeSparePart'),
            btnGeneratePdf: $("btnGeneratePdf")
        };

        return this.refs;
    }
};

export const loadSparePart = (sparePart, Refs) => {
    loadSparePartInfo(sparePart, Refs);
    loadDownButtons(sparePart, Refs);
};

const loadDownButtons = (sparePart, Refs) => {
    Refs.btnEditSparePart.href = `sparePartsDetails.html?id=${sparePart.idSparePart}`;
    Refs.btnSellSparePart.href = `addCustomerSale.html?type=sparePart&newSparePartId=${sparePart.idSparePart}&newSparePartName=${encodeURIComponent(sparePart.nameSpareParts)}&newSuggestedPrice=${sparePart.sparePartsCosts.suggestedPrice}`;
    if (sparePart.status === "Disponible") {
        Refs.statusPart.querySelector(".statusTextSparePart").textContent = "Disponible";
        Refs.statusPart.classList.add("aviable");
    } else if (sparePart.status === "Vendido") {
        Refs.statusPart.querySelector(".statusTextSparePart").textContent = "Vendido";
        Refs.statusPart.classList.add("sold");
    }
};

const loadSparePartInfo = (sparePart, Refs) => {
    Refs.pictureSparePart.src = sparePart.photoUrl;
    Refs.name.textContent = sparePart.nameSpareParts;
    sparePart.billUrl ? Refs.name.href = sparePart.billUrl : null;
    Refs.brand.textContent = sparePart.brand;
    Refs.model.textContent = sparePart.model;
    Refs.year.textContent = sparePart.yearPart;
    Refs.status.textContent = sparePart.state;
    Refs.suggestedPrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.suggestedPrice)}`;
    Refs.tracking.textContent = sparePart.tracking.numTracking;
    sparePart.tracking.linkTracking ? Refs.tracking.href = sparePart.tracking.linkTracking : null;
    Refs.purchasePrice.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.purchasePrice)}`;
    Refs.taxes.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.taxes)}`;
    Refs.totalCost.textContent = `$${formatWithCommas(sparePart.sparePartsCosts.totalCost)}`;
};
