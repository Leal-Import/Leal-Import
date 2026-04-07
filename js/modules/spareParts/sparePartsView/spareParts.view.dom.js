import { formatWithCommas } from "../../../utils/formatters.js";
import { $, qs, qsa } from "../../../utils/dom.js";
import { renderAndInitViewCarousel } from "../../carousel/carousel.dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
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
            btnSparePartAction: $('btnSparePartAction'),
            statusPart: qs('.statusBadgeSparePart'),
            btnGeneratePdf: $("btnGeneratePdf"),
            skeleton: qsa('.skeleton'),
            mainSwiperWrapper: $("mainSwiperWrapper"),
            thumbsWrapper: $("thumbsWrapper")
        };

        return this.refs;
    }
};

export const loadSparePart = (sparePart, Refs) => {
    loadSparePartInfo(sparePart, Refs);
    renderAndInitViewCarousel({
        photos: sparePart.sparePartPhotos,
        mainWrapper: Refs.mainSwiperWrapper,
        thumbsWrapper: Refs.thumbsWrapper
    });
    removeSkeletonLoad(Refs.skeleton);
};

const removeSkeletonLoad = (skeletonElements) => {
    skeletonElements.forEach(el => el.classList.remove("skeleton"));
};

const loadSparePartInfo = (sparePart, Refs) => {
    const { name, brand, model, year, status, suggestedPrice, tracking, purchasePrice, taxes, totalCost } = Refs;
    name.textContent = sparePart.nameSparePart;
    sparePart.billUrl ? name.href = sparePart.billUrl : null;
    brand.textContent = sparePart.brand;
    model.textContent = sparePart.model;
    year.textContent = sparePart.yearPart;
    status.textContent = sparePart.status;
    suggestedPrice.textContent = formatWithCommas(sparePart.sparePartsCosts.suggestedPrice);
    tracking.textContent = sparePart.tracking.numTracking;
    sparePart.tracking.linkTracking ? tracking.href = sparePart.tracking.linkTracking : null;
    purchasePrice.textContent = formatWithCommas(sparePart.sparePartsCosts.purchasePrice);
    taxes.textContent = formatWithCommas(sparePart.sparePartsCosts.taxes);
    totalCost.textContent = formatWithCommas(sparePart.sparePartsCosts.totalCost);
};
