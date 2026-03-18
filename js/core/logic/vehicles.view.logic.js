import { asUUID, showMessage } from "../../utils/dom.js";

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);
    const idVehicle = params.get('id');
    if (!idVehicle) {
        await showMessage('Error', 'ID de vehículo no proporcionado en la URL', 'error');
        window.location.href = 'vehicles.html';
        return false;
    }
    state.context.idVehicle = asUUID(params.get('id'));
    return true;
};
