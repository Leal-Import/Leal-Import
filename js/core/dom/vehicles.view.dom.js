import { $ } from "../../utils/dom.js";
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
            thumbsWrapper: $("thumbsWrapper")
        };
        return this.refs;
    }
};

export const loadVehicleData = (vehicle) => {
    loadVehicleInfo(vehicle);
    loadDownButtons(vehicle);
    renderAndInitViewCarousel({
        photos: vehicle.photos,
        mainWrapper: DOMRefs.refs.mainSwiperWrapper,
        thumbsWrapper: null,
        thumbsWrapper: DOMRefs.refs.thumbsWrapper
    });
}

const loadDownButtons = (vehicle) => {
    DOMRefs.refs.btnEdit.href = `vehicleDetails.html?id=${vehicle.idVehicle}`
    DOMRefs.refs.btnSell.href = `addCustomerSale.html?type=vehicle&id=${vehicle.idVehicle}`;
    DOMRefs.refs.btnHistorial.href = `workOrderDetails.html?idVehicle=${vehicle.idVehicle}&idCustomer=${vehicle.idOwnerCustomer}`;
    if (vehicle.status == "Disponible") {
        DOMRefs.refs.vehicleStatus.querySelector(".statusText").textContent = "Disponible";
        DOMRefs.refs.vehicleStatus.classList.add("aviable");
    } else if (vehicle.status == "Vendido") {
        DOMRefs.refs.vehicleStatus.querySelector(".statusText").textContent = "Vendido";
        DOMRefs.refs.vehicleStatus.classList.add("sold");
    } else {

    }
}

const loadVehicleInfo = (vehicle) => {
    DOMRefs.refs.vin.textContent = vehicle.vin;
    DOMRefs.refs.brand.textContent = vehicle.brand;
    DOMRefs.refs.model.textContent = vehicle.model;
    DOMRefs.refs.year.textContent = vehicle.year;
    DOMRefs.refs.mileage.textContent = vehicle.mileage;
    DOMRefs.refs.lote.textContent = vehicle.lote.numLote;
    DOMRefs.refs.purchaseDate.textContent = vehicle.purchaseDate;
    DOMRefs.refs.status.textContent = vehicle.status;
    if (vehicle.lote.linkLote) {
        DOMRefs.refs.lote.href = vehicle.lote.linkLote;
        DOMRefs.refs.lote.target = "_blank";
    }
    DOMRefs.refs.description.textContent = vehicle.description;

    DOMRefs.refs.description.style.height = "auto";         // resetear para recalcular
    DOMRefs.refs.description.style.height = DOMRefs.refs.description.scrollHeight + "px";
    DOMRefs.refs.description.readOnly = true;

    if (vehicle.costs) {
        DOMRefs.refs.bill.textContent = `$${formatWithCommas(vehicle.costs.bill)}`;
        vehicle.costs.costPhoto.billPhoto != null ? DOMRefs.refs.bill.href = vehicle.costs.costPhoto.billPhoto : null;
        DOMRefs.refs.transfer.textContent = `$${formatWithCommas(vehicle.costs.transfer)}`;
        DOMRefs.refs.storage.textContent = `$${formatWithCommas(vehicle.costs.storage)}`;
        DOMRefs.refs.transport.textContent = `$${formatWithCommas(vehicle.costs.towTruck)}`;
        vehicle.costs.costPhoto.shipPhoto != null ? DOMRefs.refs.transport.href = vehicle.costs.costPhoto.shipPhoto : DOMRefs.refs.transport;
        DOMRefs.refs.ship.textContent = `$${formatWithCommas(vehicle.costs.ship)}`;
        vehicle.costs.costPhoto.shipPhoto != null ? DOMRefs.refs.ship.href = vehicle.costs.costPhoto.shipPhoto : null;
        DOMRefs.refs.taxes.textContent = `$${formatWithCommas(vehicle.costs.taxes)}`;
        vehicle.costs.costPhoto.taxesPhoto != null ? DOMRefs.refs.taxes.href = vehicle.costs.costPhoto.taxesPhoto : null;
        DOMRefs.refs.iva.textContent = `$${formatWithCommas(vehicle.costs.iva)}`;
        DOMRefs.refs.pa.textContent = `$${formatWithCommas(vehicle.costs.pa)}`;
        vehicle.costs.suggestedPrice != null ? DOMRefs.refs.suggestedPrice.textContent = `$${vehicle.costs.suggestedPrice}` : DOMRefs.refs.suggestedPrice.style.display = "none";
        DOMRefs.refs.total.textContent = `$${formatWithCommas(vehicle.costs.total)}`;
    }
}