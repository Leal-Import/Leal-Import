import { DOMRefs, loadVehicleData } from "./vehicles.view.dom.js";
import { getVehicles } from "../vehiclesForm/vehicles.form.service.js";
import { createModuleInitializer } from "../../../utils/dom.js";
import { resetVehicleViewState, vehicleViewState } from "./vehicles.view.state.js";
import { initEventsVehiclesView } from "./vehicles.view.event.js";
import { generateVehicleReport } from "../../../core/reports/vehicles/vehicles.report.js";
import { hydrateContextFromURL } from "./vehicles.view.logic.js";
import { handleApiError } from "../../../utils/api.utils.js";

const loadData = async (Refs) => {
    try {
        const vehicle = await getVehicles(vehicleViewState.context.idVehicle);
        vehicleViewState.vehicle = vehicle;
        loadVehicleData(vehicle, Refs);
    } catch (error) {
        await handleApiError(error, 'No se pudo cargar la información del vehículo. Por favor, inténtalo de nuevo.');
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
    load: async () => {},
    DOMRefs
});

document.addEventListener("DOMContentLoaded", init);
