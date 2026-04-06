import { DOMRefs, loadSparePart } from "./spareParts.view.dom.js";
import { generateSparePartReport } from "../../../core/reports/spareParts/spareParts.report.js";
import { resetSparePartViewState, sparePartViewState } from "./spareParts.view.state.js";
import { getSparePart } from "../sparePartsForm/spareParts.form.service.js";
import { asUUID, createModuleInitializer } from "../../../utils/dom.js";
import { initSparePartsViewEvents } from "./spareParts.view.event.js";
import { handleApiError } from "../../../utils/api.utils.js";

const loadData = async(Refs) => {
    try {
        const sparePart = await getSparePart(sparePartViewState.context.idSparePart);
        sparePartViewState.sparePart = sparePart;
        loadSparePart(sparePart, Refs);
    } catch (error) {
        await handleApiError(error, 'No se pudo cargar la información del repuesto. Por favor, inténtalo de nuevo.');
    }
};

const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    sparePartViewState.context.idSparePart = asUUID(params.get("id"));
};

const loadDataFlow = async(Refs) => {
    await loadData(Refs);
};

const initializeUi = (btnGeneratePdf) => {
    initSparePartsViewEvents({ btnGeneratePdf, onGeneratePdf: () => generateSparePartReport(sparePartViewState.sparePart) });
};

const init = createModuleInitializer({
    resetState: () => {
        resetSparePartViewState();
        hydrateContextFromURL();
    },
    initialize: (refs) => {
        initializeUi(refs.btnGeneratePdf);
        loadDataFlow(refs);
    },
    load: async () => {},
    DOMRefs
});

document.addEventListener("DOMContentLoaded", init);
