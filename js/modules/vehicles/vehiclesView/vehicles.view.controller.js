import { DOMRefs, loadVehicleData } from "./vehicles.view.dom.js";
import { getVehicles } from "../vehiclesForm/vehicles.form.service.js";
import { buildParams, createModuleInitializer, hideElement } from "../../../utils/dom.js";
import { resetVehicleViewState, vehicleViewState } from "./vehicles.view.state.js";
import { initEventsVehiclesView } from "./vehicles.view.event.js";
import { generateVehicleReport } from "../../../core/reports/vehicles/vehicles.report.js";
import { hydrateContextFromURL } from "./vehicles.view.logic.js";
import { handleApiError } from "../../../utils/api.utils.js";
import { ROUTES } from "../../../utils/router.js";

const loadData = async (Refs) => {
    try {
        const vehicle = await getVehicles(vehicleViewState.context.idVehicle);
        vehicleViewState.vehicle = vehicle;
        loadVehicleData(vehicle, Refs);
        loadDownButtons(vehicle, Refs);
    } catch (error) {
        await handleApiError(error, 'No se pudo cargar la información del vehículo. Por favor, inténtalo de nuevo.');
    }
};

const loadDownButtons = (vehicle, Refs) => {
    const { btnEdit, btnSell, btnHistorial, vehicleStatus } = Refs;
    btnEdit.href = `${ROUTES.VEHICLES_FORM}?id=${vehicle.idVehicle}`;
    const paramsHistorial = buildParams({ idVehicle: vehicle.idVehicle, idCustomer: vehicle.idOwnerCustomer });
    btnHistorial.href = `${ROUTES.WORK_ORDER_HISTORY}?${paramsHistorial.toString()}`;
    if (vehicle.status === "Disponible") {
        vehicleStatus.querySelector(".statusText").textContent = "Disponible";
        vehicleStatus.classList.add("aviable");
        const paramsSell = buildParams({ type: "vehicle", id: vehicle.idVehicle });
        btnSell.href = `${ROUTES.CUSTOMER_SALE}?${paramsSell.toString()}`;
    } else if (vehicle.status === "Vendido") {
        vehicleStatus.querySelector(".statusText").textContent = "Vendido";
        vehicleStatus.classList.add("sold");
        hideElement(btnSell);
    } else if (vehicle.status === "Devolución") {
        vehicleStatus.querySelector(".statusText").textContent = "Devolución";
        const paramsSell = buildParams({ type: "vehicle", id: vehicle.idVehicle });
        btnSell.href = `${ROUTES.CUSTOMER_SALE}?${paramsSell.toString()}`;
        vehicleStatus.classList.add("returned");
    }
};

const loadDataFlow = async (Refs) => {
    await loadData(Refs);
};

const initializeUI = (btnGeneratePdf) => {
    initEventsVehiclesView({ btnGeneratePdf, onGeneratePdf: () => generateVehicleReport(vehicleViewState.vehicle) });
};

const init = createModuleInitializer({
    resetState: async () => {
        resetVehicleViewState();
        const isHydrated = await hydrateContextFromURL(vehicleViewState);
        if (!isHydrated) throw new Error('Failed to hydrate context');
    },
    initialize: (refs) => {
        initializeUI(refs.btnGeneratePdf);
        loadDataFlow(refs);
    },
    load: async () => { },
    DOMRefs
});

document.addEventListener("DOMContentLoaded", init);
