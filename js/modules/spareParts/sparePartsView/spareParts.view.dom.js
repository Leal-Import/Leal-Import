import { formatWithCommas } from "../../../utils/formatters.js";
import { $, buildParams, hideElement, qs, qsa } from "../../../utils/dom.js";

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
            btnGeneratePdf: $("btnGeneratePdf"),
            skeleton: qsa('.skeleton')
        };

        return this.refs;
    }
};

export const loadSparePart = (sparePart, Refs) => {
    loadSparePartInfo(sparePart, Refs);
    loadDownButtons(sparePart, Refs);
    removeSkeletonLoad(Refs.skeleton);
};

const removeSkeletonLoad = (skeletonElements) => {
    skeletonElements.forEach(el => el.classList.remove("skeleton"));
};

const loadDownButtons = (sparePart, Refs) => {
    const { btnEditSparePart, btnSellSparePart, statusPart } = Refs;
    btnEditSparePart.href = `sparePartsForm.html?id=${sparePart.idSparePart}`;
    if (sparePart.status === "Disponible") {
        const paramsSell = buildParams({
            type: "sparePart",
            id: sparePart.idSparePart,
            name: sparePart.nameSpareParts,
            suggestedPrice: sparePart.sparePartsCosts.suggestedPrice
        });
        btnSellSparePart.href = `customerSale.html?${paramsSell.toString()}`;
        statusPart.querySelector(".statusTextSparePart").textContent = "Disponible";
        statusPart.classList.add("aviable");
    } else if (sparePart.status === "Vendido") {
        hideElement(btnSellSparePart);
        statusPart.querySelector(".statusTextSparePart").textContent = "Vendido";
        statusPart.classList.add("sold");
    }
};

const loadSparePartInfo = (sparePart, Refs) => {
    const { pictureSparePart, name, brand, model, year, status, suggestedPrice, tracking, purchasePrice, taxes, totalCost } = Refs;
    pictureSparePart.src = sparePart.photoUrl || '../media/appMedia/defaultImg.svg';
    name.textContent = sparePart.nameSpareParts;
    sparePart.billUrl ? name.href = sparePart.billUrl : null;
    brand.textContent = sparePart.brand;
    model.textContent = sparePart.model;
    year.textContent = sparePart.yearPart;
    status.textContent = sparePart.state;
    suggestedPrice.textContent = formatWithCommas(sparePart.sparePartsCosts.suggestedPrice);
    tracking.textContent = sparePart.tracking.numTracking;
    sparePart.tracking.linkTracking ? tracking.href = sparePart.tracking.linkTracking : null;
    purchasePrice.textContent = formatWithCommas(sparePart.sparePartsCosts.purchasePrice);
    taxes.textContent = formatWithCommas(sparePart.sparePartsCosts.taxes);
    totalCost.textContent = formatWithCommas(sparePart.sparePartsCosts.totalCost);
};
