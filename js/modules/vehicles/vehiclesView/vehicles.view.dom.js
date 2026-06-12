import { $, qsa, showElement } from "../../../utils/dom.js";
import { formatWithCommas } from "../../../utils/formatters.js";
import { renderAndInitViewCarousel } from "../../carousel/carousel.dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            vin: $("vin"),
            brand: $("brand"),
            model: $("model"),
            year: $("year"),
            mileage: $("mileage"),
            lote: $("lote"),
            purchaseDate: $("purchaseDate"),
            status: $("status"),
            description: $("description"),
            bill: $("bill"),
            transfer: $("transfer"),
            storage: $("storage"),
            transport: $("transport"),
            ship: $("ship"),
            taxes: $("taxes"),
            iva: $("iva"),
            pa: $("pa"),
            total: $("total"),
            suggestedPrice: $("suggestedPrice"),
            vehicleStatus: $("vehicleStatus"),
            btnEdit: $("btnEdit"),
            btnSell: $("btnSell"),
            btnHistorial: $("btnHistorial"),
            mainSwiperWrapper: $("mainSwiperWrapper"),
            thumbsWrapper: $("thumbsWrapper"),
            btnGeneratePdf: $("btnGeneratePdf"),
            skeleton: qsa(".skeleton"),
            customerElement: $("customerElement"),
            customerName: $("customerName")
        };
        return this.refs;
    }
};

export const loadVehicleData = (vehicle, Refs) => {
    loadVehicleInfo(vehicle, Refs);
    renderAndInitViewCarousel({
        photos: vehicle.vehiclePhotos,
        mainWrapper: Refs.mainSwiperWrapper,
        thumbsWrapper: Refs.thumbsWrapper
    });
    removeSkeletonLoad(Refs.skeleton);
};

const removeSkeletonLoad = (skeletonElements) => {
    skeletonElements.forEach(el => el.classList.remove("skeleton"));
};

const loadVehicleInfo = (vehicle, Refs) => {
    const { vin, brand, model, year, mileage, lote, purchaseDate, status, description } = Refs;
    vin.textContent = vehicle.vin;
    brand.textContent = vehicle.brand;
    model.textContent = vehicle.model;
    year.textContent = vehicle.year;
    mileage.textContent = vehicle.mileage;
    lote.textContent = vehicle.lot.numLot;
    purchaseDate.textContent = vehicle.purchaseDate;
    status.textContent = vehicle.status;
    if (vehicle.lot.linkLot) {
        lote.href = vehicle.lot.linkLot;
        lote.target = "_blank";
    }
    description.textContent = vehicle.description;

    description.style.height = "auto";         // resetear para recalcular
    description.style.height = description.scrollHeight + "px";
    description.readOnly = true;

    if (vehicle.vehicleCosts) {
        const { bill, transfer, storage, transport, ship, taxes, iva, pa, suggestedPrice, total } = Refs;
        bill.textContent = formatWithCommas(vehicle.vehicleCosts.bill);
        vehicle.vehicleCosts.costPhoto.billPhoto !== null ? bill.href = vehicle.vehicleCosts.costPhoto.billPhoto : null;
        transfer.textContent = formatWithCommas(vehicle.vehicleCosts.transfer);
        storage.textContent = formatWithCommas(vehicle.vehicleCosts.storage);
        transport.textContent = formatWithCommas(vehicle.vehicleCosts.towTruck);
        vehicle.vehicleCosts.costPhoto.shipPhoto !== null ? transport.href = vehicle.vehicleCosts.costPhoto.shipPhoto : transport;
        ship.textContent = formatWithCommas(vehicle.vehicleCosts.ship);
        vehicle.vehicleCosts.costPhoto.shipPhoto !== null ? ship.href = vehicle.vehicleCosts.costPhoto.shipPhoto : null;
        taxes.textContent = formatWithCommas(vehicle.vehicleCosts.taxes);
        vehicle.vehicleCosts.costPhoto.taxesPhoto !== null ? taxes.href = vehicle.vehicleCosts.costPhoto.taxesPhoto : null;
        iva.textContent = formatWithCommas(vehicle.vehicleCosts.iva);
        pa.textContent = formatWithCommas(vehicle.vehicleCosts.pa);
        vehicle.vehicleCosts.suggestedPrice !== null ? suggestedPrice.textContent = formatWithCommas(vehicle.vehicleCosts.suggestedPrice) : suggestedPrice.style.display = "none";
        total.textContent = formatWithCommas(vehicle.vehicleCosts.total);
    }
    if (vehicle.customerName) {
        showElement(Refs.customerElement);
        Refs.customerName.textContent = vehicle.customerName;
    }
};
