import { asUUID, showMessage } from "../../../utils/dom.js";
import { navigateTo, ROUTES } from "../../../utils/router.js";

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);
    const idVehicle = params.get('id');
    if (!idVehicle) {
        await showMessage('Error', 'ID de vehículo no proporcionado en la URL', 'error');
        navigateTo(ROUTES.VEHICLES);
        return false;
    }
    state.context.idVehicle = asUUID(params.get('id'));
    return true;
};
