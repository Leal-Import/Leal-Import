import { DOMRefs, loadVehicleData } from "./vehicles.view.dom.js";
import { getVehicles } from "../vehiclesForm/vehicles.form.service.js";
import { showMessage } from "../../../utils/dom.js";
import { resetVehicleViewState, vehicleViewState } from "./vehicles.view.state.js";
import { initSession } from "../../../utils/api.utils.js";
import { initEventsVehiclesView } from "./vehicles.view.event.js";
import { generateVehicleReport } from "../../../core/reports/vehicles/vehicles.report.js";
import { hydrateContextFromURL } from "./vehicles.view.logic.js";

const loadData = async (Refs) => {
    try {
        const vehicle = await getVehicles(vehicleViewState.context.idVehicle);
        vehicleViewState.vehicle = vehicle;
        loadVehicleData(vehicle, Refs);
    } catch (error) {
        console.error("Error loading vehicle data:", error);
        showMessage("Error", "No se pudo cargar la información del vehículo.", "error");
    }
};

const setupApplication = async () => {
    resetVehicleViewState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    const isHydrated = await hydrateContextFromURL(vehicleViewState);
    if (!isHydrated) return false;
    return true;
};

const loadDataFlow = async (Refs) => {
    await loadData(Refs);
};

const initializeUI = (btnGeneratePdf) => {
    initEventsVehiclesView({ btnGeneratePdf, onGeneratePdf: () => generateVehicleReport(vehicleViewState.vehicle) });
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();

        await loadDataFlow(refs);

        initializeUI(refs.btnGeneratePdf);
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
