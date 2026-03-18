import { $, qsa } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";
import { renderAndInitViewCarousel } from "./carousel.dom.js";

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
            skeleton: qsa(".skeleton")
        };
        return this.refs;
    }
};

export const loadVehicleData = (vehicle, Refs) => {
    loadVehicleInfo(vehicle, Refs);
    loadDownButtons(vehicle, Refs);
    renderAndInitViewCarousel({
        photos: vehicle.photos,
        mainWrapper: Refs.mainSwiperWrapper,
        thumbsWrapper: Refs.thumbsWrapper
    });
    removeSkeletonLoad(Refs.skeleton);
};

const removeSkeletonLoad = (skeletonElements) => {
    skeletonElements.forEach(el => el.classList.remove("skeleton"));
};

const loadDownButtons = (vehicle, Refs) => {
    const { btnEdit, btnSell, btnHistorial, vehicleStatus } = Refs;
    btnEdit.href = `vehicleDetails.html?id=${vehicle.idVehicle}`;
    btnSell.href = `addCustomerSale.html?type=vehicle&id=${vehicle.idVehicle}`;
    btnHistorial.href = `workOrderDetails.html?idVehicle=${vehicle.idVehicle}&idCustomer=${vehicle.idOwnerCustomer}`;
    if (vehicle.status === "Disponible") {
        vehicleStatus.querySelector(".statusText").textContent = "Disponible";
        vehicleStatus.classList.add("aviable");
    } else if (vehicle.status === "Vendido") {
        vehicleStatus.querySelector(".statusText").textContent = "Vendido";
        vehicleStatus.classList.add("sold");
    }
};

const loadVehicleInfo = (vehicle, Refs) => {
    const { vin, brand, model, year, mileage, lote, purchaseDate, status, description } = Refs;
    vin.textContent = vehicle.vin;
    brand.textContent = vehicle.brand;
    model.textContent = vehicle.model;
    year.textContent = vehicle.year;
    mileage.textContent = vehicle.mileage;
    lote.textContent = vehicle.lote.numLote;
    purchaseDate.textContent = vehicle.purchaseDate;
    status.textContent = vehicle.status;
    if (vehicle.lote.linkLote) {
        lote.href = vehicle.lote.linkLote;
        lote.target = "_blank";
    }
    description.textContent = vehicle.description;

    description.style.height = "auto";         // resetear para recalcular
    description.style.height = description.scrollHeight + "px";
    description.readOnly = true;

    if (vehicle.costs) {
        const { bill, transfer, storage, transport, ship, taxes, iva, pa, suggestedPrice, total } = Refs;
        bill.textContent = formatWithCommas(vehicle.costs.bill);
        vehicle.costs.costPhoto.billPhoto !== null ? bill.href = vehicle.costs.costPhoto.billPhoto : null;
        transfer.textContent = formatWithCommas(vehicle.costs.transfer);
        storage.textContent = formatWithCommas(vehicle.costs.storage);
        transport.textContent = formatWithCommas(vehicle.costs.towTruck);
        vehicle.costs.costPhoto.shipPhoto !== null ? transport.href = vehicle.costs.costPhoto.shipPhoto : transport;
        ship.textContent = formatWithCommas(vehicle.costs.ship);
        vehicle.costs.costPhoto.shipPhoto !== null ? ship.href = vehicle.costs.costPhoto.shipPhoto : null;
        taxes.textContent = formatWithCommas(vehicle.costs.taxes);
        vehicle.costs.costPhoto.taxesPhoto !== null ? taxes.href = vehicle.costs.costPhoto.taxesPhoto : null;
        iva.textContent = formatWithCommas(vehicle.costs.iva);
        pa.textContent = formatWithCommas(vehicle.costs.pa);
        vehicle.costs.suggestedPrice !== null ? suggestedPrice.textContent = formatWithCommas(vehicle.costs.suggestedPrice) : suggestedPrice.style.display = "none";
        total.textContent = formatWithCommas(vehicle.costs.total);
    }
};
