import { DOMRefs, loadVehicleData } from "../../../core/dom/vehicles.view.dom.js";
import { getVehicles } from "../../../service/vehicles.detail.service.js";
import { asUUID, showMessage } from "../../../utils/dom.js";
import { vehicleViewState } from "../../../core/state/vehicles.view.state.js";
import { initSession } from "../../../utils/api.utils.js";
import { initEventsVehiclesView } from "../event/vehicles.view.event.js";
import { generateVehicleReport } from "../../../core/reports/vehicles/vehicles.report.js";

const loadData = async(Refs) => {
    try {
        const vehicle = await getVehicles(vehicleViewState.context.idVehicle);
        vehicleViewState.vehicle = vehicle;
        loadVehicleData(vehicle, Refs);
    } catch (error) {
        console.error("Error loading vehicle data:", error);
        showMessage("Error", "No se pudo cargar la información del vehículo.", "error");
    }
};

const hydrateContextFromURL = async() => {
    const params = new URLSearchParams(window.location.search);
    const idVehicle = params.get('id');
    if (!idVehicle) {
        await showMessage('Error', 'ID de vehículo no proporcionado en la URL', 'error');
        window.location.href = 'vehicles.html';
        return false;
    }
    vehicleViewState.context.idVehicle = asUUID(params.get('id'));
    return true;
};

const setupApplication = async() => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    const isHydrated = await hydrateContextFromURL();
    if (!isHydrated) return false;
    return true;
};

const loadDataFlow = async(Refs) => {
    await loadData(Refs);
};

const initializeUI = (btnGeneratePdf) => {
    initEventsVehiclesView({ btnGeneratePdf, onGeneratePdf: () => generateVehicleReport(vehicleViewState.vehicle) });
};

document.addEventListener("DOMContentLoaded", async() => {
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
