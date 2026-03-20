import { $, hideElement, qs, showElement } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";
import { renderAndInitViewCarousel } from "./carousel.dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            tBodyInventory: $("tBodyInventory"),
            frmVehicleSale: $("frmVehicleSale"),
            txtAmount: $("txtAmount"),
            cmbPaymentMethod: $("paymentMethod"),
            addVehicleLoader: $("loaderAddVehicle"),
            tableVehiclesLoader: $("tableVehiclesLoader"),
            btnSaveSaleLoader: $("btnSaveSaleLoader"),
            btnSaveSale: $("btnSaveSale"),
            btnCancelVehicle: $("btnCancelVehicle"),
            txtSearchData: $("txtSearchData"),
            txtNotes: $("txtNotes"),
            txtCommission: $("txtCommission"),
            txtTotal: $("txtTotal"),
            btnAddPayment: $("btnAddPayment"),
            btnAddPart: $("btnAddPart"),
            customerName: $("customerName"),
            due: $("due"),
            total: $("total"),
            totalPaid: $("totalPaid"),
            mainSwiperWrapper: $("mainSwiperWrapper"),
            thumbsWrapper: $("thumbsWrapper"),
            vehicleVin: $("vehicleVin"),
            vehicleBrand: $("vehicleBrand"),
            vehicleModel: $("vehicleModel"),
            vehicleYear: $("vehicleYear"),
            purchaseDate: $("purchaseDate"),
            mileaje: $("mileaje"),
            lote: $("lote"),
            status: $("status"),
            suggestedPrice: $("suggestedPrice"),
            bill: $("bill"),
            ship: $("ship"),
            towTruck: $("towTruck"),
            iva: $("iva"),
            taxes: $("taxes"),
            transfer: $("transfer"),
            pa: $("pa"),
            storage: $("storage"),
            totalCostV: $("totalCostV"),
            dataLeft: qs(".dataLeft"),
            viewVechicleContainer: qs(".viewVechicleContainer"),
            columnCosts: qs(".columnCosts"),
            suggestedItem: qs(".suggestedItem"),
            tableVehicles: $("tableVehicles"),
            btnCreateOrder: $("btnCreateOrder"),
            totalVehicle: $("totalVehicle"),
            btnCreateOrderLoader: $("btnCreateOrderLoader"),
            paymentForm: qs(".paymentForm"),
            btnGeneratePdf: $("btnGeneratePdf")
        };
        return this.refs;
    }
};

export const resetVehicleSaleFilters = (txtSearchData) => {
    txtSearchData.value = "";
};

export const insertVehicles = (container, vehicles, onAddVehicle, tableVehicles) => {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (vehicles.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        td.classList.add("noDataMessage"); // opcional para estilos
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);
        tableVehicles.style.height = "100%";
    } else {
        vehicles.forEach(vehicle => {
            tableVehicles.style.height = "fit-content";
            const tr = document.createElement("tr");
            const tdImage = document.createElement("td");
            const image = document.createElement("img");
            const vin = document.createElement("td");
            const cost = document.createElement("td");
            const suggesredPrice = document.createElement("td");
            const btnAddVehicle = document.createElement("button");

            image.src = vehicle.photoUrl;
            vin.textContent = vehicle.vin;
            if (vehicle.total && vehicle.suggestedPrice) {
                cost.textContent = formatWithCommas(vehicle.total);
                suggesredPrice.textContent = formatWithCommas(vehicle.suggestedPrice); /* Por el momento es costo total */
            } else {
                cost.textContent = `Externo`;
                suggesredPrice.textContent = `Externo`; /* Por el momento es costo total */
            }

            tr.classList.add("tableRow");
            btnAddVehicle.classList.add("btnAddItem");
            image.classList.add("imgTable");

            btnAddVehicle.textContent = "+";

            tdImage.appendChild(image);

            tr.append(tdImage, vin, cost, suggesredPrice, btnAddVehicle);
            fragment.appendChild(tr);

            btnAddVehicle.addEventListener("click", () => onAddVehicle(vehicle));

        });
    }

    container.appendChild(fragment);
};

export const loadVehicle = (vehicle, idSale, Refs) => {
    hideElement(Refs.dataLeft);
    showElement(Refs.viewVechicleContainer);

    Refs.vehicleVin.textContent = vehicle.vin;
    Refs.vehicleBrand.textContent = vehicle.brand;
    Refs.vehicleModel.textContent = vehicle.model;
    Refs.vehicleYear.textContent = vehicle.year;
    Refs.purchaseDate.textContent = vehicle.purchaseDate;
    Refs.mileaje.textContent = vehicle.mileage;
    Refs.lote.textContent = vehicle.lote.numLote;
    if (vehicle.lote.linkLote) Refs.lote.href = vehicle.lote.linkLote;
    Refs.status.textContent = vehicle.status;

    if (vehicle.costs) {
        Refs.suggestedPrice.textContent = formatWithCommas(vehicle.costs.suggestedPrice);

        Refs.bill.textContent = formatWithCommas(vehicle.costs.bill);
        if (vehicle.costs.costPhoto.billPhoto) Refs.bill.href = vehicle.costs.costPhoto.billPhoto;
        Refs.ship.textContent = formatWithCommas(vehicle.costs.ship);
        if (vehicle.costs.costPhoto.shipPhoto) Refs.ship.href = vehicle.costs.costPhoto.shipPhoto;
        Refs.towTruck.textContent = formatWithCommas(vehicle.costs.towTruck);
        if (vehicle.costs.costPhoto.towTruckPhoto) Refs.towTruck.href = vehicle.costs.costPhoto.towTruckPhoto;
        Refs.iva.textContent = formatWithCommas(vehicle.costs.iva);
        Refs.taxes.textContent = formatWithCommas(vehicle.costs.taxes);
        if (vehicle.costs.costPhoto.taxesPhoto) Refs.taxes.href = vehicle.costs.costPhoto.taxesPhoto;
        Refs.transfer.textContent = formatWithCommas(vehicle.costs.transfer);
        Refs.pa.textContent = formatWithCommas(vehicle.costs.pa);
        Refs.storage.textContent = formatWithCommas(vehicle.costs.storage);
        if (!idSale && Refs.txtTotal) {
            Refs.txtTotal.value = formatWithCommas(vehicle.costs.suggestedPrice);
        }
        if (Refs.totalCostV) {
            Refs.totalCostV.textContent = formatWithCommas(vehicle.costs.total);
        } else if (Refs.total) {
            Refs.total.textContent = formatWithCommas(vehicle.costs.total);
        }

        showElement(Refs.columnCosts);
        showElement(Refs.suggestedItem);
    } else {
        hideElement(Refs.suggestedItem);
        hideElement(Refs.columnCosts);
    }

    renderAndInitViewCarousel({
        photos: vehicle.photos,
        mainWrapper: Refs.mainSwiperWrapper,
        thumbsWrapper: Refs.thumbsWrapper
    });
};

export const loadCustomerName = (spancustomerName, customerName) => {
    spancustomerName.textContent = customerName;
};

export const loadDomData = (data, Refs) => {
    Refs.txtNotes.value = data.notes;
    Refs.txtTotal.value = formatWithCommas(data.salePrice);
    Refs.txtCommission.value = formatWithCommas(data.commission);
    Refs.btnSaveSale.querySelector("span").textContent = "Actualizar venta";
    Refs.btnCreateOrder.replaceWith(document.createElement("div"));
};

export const renderTotals = ({ total, due, totalPaid }, Refs) => {
    //const totalText = $("total");
    const dueText = Refs.due;
    const paidText = Refs.totalPaid;
    const totalText = Refs.totalVehicle;
    if (paidText) {
        paidText.textContent = formatWithCommas(totalPaid);
    }
    if (dueText) {
        dueText.textContent = formatWithCommas(due);
    }
    if (totalText) {
        totalText.textContent = formatWithCommas(total);
    }
};
