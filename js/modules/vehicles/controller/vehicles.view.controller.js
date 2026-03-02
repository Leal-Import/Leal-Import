import { DOMRefs, loadVehicleData } from "../../../core/dom/vehicles.view.dom.js";
import { getVehicles } from "../../../service/vehicles.detail.service.js";
import { asUUID, showMessage } from "../../../utils/dom.js";
import { vehicleViewState } from "../../../core/state/vehicles.view.state.js";


const loadData = async () => {
    try {
        const vehicle = await getVehicles(vehicleViewState.context.idVehicle);
        loadVehicleData(vehicle);
    } catch (error) {
        console.error("Error loading vehicle data:", error);
        showMessage("Error", "No se pudo cargar la información del vehículo.", "error");
    }
}

export const hydrateContextFromURL = async () => {
    const params = new URLSearchParams(window.location.search);
    const idVehicle = params.get('id');
    if (!idVehicle) {
        await showMessage('Error', 'ID de vehículo no proporcionado en la URL', 'error');
        window.location.href = 'vehicles.html';
    }
    vehicleViewState.context.idVehicle = asUUID(params.get('id'));
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        DOMRefs.init();
        hydrateContextFromURL();
        await loadData();
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});