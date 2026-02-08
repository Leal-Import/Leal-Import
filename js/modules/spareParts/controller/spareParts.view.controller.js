import { loadSparePart } from "../../../core/dom/spareParts.view.dom.js";
import { sparePartViewState } from "../../../core/state/spareParts.view.state.js";
import { getSparePart } from "../../../service/spareParts.detail.service.js";
import { asUUID, showMessage } from "../../../utils/dom.js"

const loadData = async () => {
    try {
        const sparePart = await getSparePart(sparePartViewState.context.idSparePart);
        loadSparePart(sparePart);
    } catch (error) {
        console.error(error);
        showMessage("Error", "No se pudo cargar el repuesto", "error");
    }
}

const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    sparePartViewState.context.idSparePart = asUUID(params.get("id"));
}

const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    // 3. Hidratar contexto desde URL
    hydrateContextFromURL();

    return true;
};

const loadDataFlow = async () => {
    await loadData();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        await loadDataFlow();
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
})