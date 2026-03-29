import { DOMRefs, loadSparePart } from "./spareParts.view.dom.js";
import { generateSparePartReport } from "../../../core/reports/spareParts/spareParts.report.js";
import { resetSparePartViewState, sparePartViewState } from "./spareParts.view.state.js";
import { getSparePart } from "../sparePartsForm/spareParts.form.service.js";
import { initSession } from "../../../utils/api.utils.js";
import { asUUID, showMessage } from "../../../utils/dom.js";
import { initSparePartsViewEvents } from "./spareParts.view.event.js";

const loadData = async(Refs) => {
    try {
        const sparePart = await getSparePart(sparePartViewState.context.idSparePart);
        sparePartViewState.sparePart = sparePart;
        loadSparePart(sparePart, Refs);
    } catch (error) {
        console.error(error);
        showMessage("Error", "No se pudo cargar el repuesto", "error");
    }
};

const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    sparePartViewState.context.idSparePart = asUUID(params.get("id"));
};

const setupApplication = async() => {
    resetSparePartViewState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    // 3. Hidratar contexto desde URL
    hydrateContextFromURL();

    return true;
};

const loadDataFlow = async(Refs) => {
    await loadData(Refs);
};

const initializeUi = (btnGeneratePdf) => {
    initSparePartsViewEvents({ btnGeneratePdf, onGeneratePdf: () => generateSparePartReport(sparePartViewState.sparePart) });
};

document.addEventListener("DOMContentLoaded", async() => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();

        await loadDataFlow(refs);

        initializeUi(refs.btnGeneratePdf);
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
