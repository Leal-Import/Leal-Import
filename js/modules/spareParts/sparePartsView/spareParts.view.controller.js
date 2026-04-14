import { DOMRefs, loadSparePart } from "./spareParts.view.dom.js";
import { generateSparePartReport } from "../../../core/reports/spareParts/spareParts.report.js";
import { resetSparePartViewState, sparePartViewState } from "./spareParts.view.state.js";
import { getSparePart } from "../sparePartsForm/spareParts.form.service.js";
import { asUUID, buildParams, createModuleInitializer, hideElement } from "../../../utils/dom.js";
import { initSparePartsViewEvents } from "./spareParts.view.event.js";
import { handleApiError } from "../../../utils/api.utils.js";
import { ROUTES } from "../../../utils/router.js";

const loadData = async (Refs) => {
    try {
        const sparePart = await getSparePart(sparePartViewState.context.idSparePart);
        sparePartViewState.sparePart = sparePart;
        loadSparePart(sparePart, Refs);
        loadDownButtons(sparePart, Refs);
    } catch (error) {
        await handleApiError(error, 'No se pudo cargar la información del repuesto. Por favor, inténtalo de nuevo.');
    }
};

const loadDownButtons = (sparePart, Refs) => {
    const { btnEditSparePart, btnSparePartAction, statusPart } = Refs;
    btnEditSparePart.href = `${ROUTES.SPARE_PART_FORM}?id=${sparePart.idSparePart}`;
    if (sparePart.status === "Disponible") {
        console.log(btnSparePartAction);
        const paramsSell = buildParams({
            type: "sparePart",
            id: sparePart.idSparePart,
            name: sparePart.nameSpareParts,
            suggestedPrice: sparePart.sparePartsCosts.suggestedPrice
        });
        btnSparePartAction.href = `${ROUTES.CUSTOMER_SALE}?${paramsSell.toString()}`;
        statusPart.querySelector(".statusTextSparePart").textContent = "Disponible";
        statusPart.classList.add("aviable");
    } else if (sparePart.status === "Vendido") {
        statusPart.querySelector(".statusTextSparePart").textContent = "Vendido";
        statusPart.classList.add("sold");
        const paramsWorkOrder = buildParams({
            idSale: sparePart.idSparePartsSales,
            isView: true,
            fromInventory: true
        });
        btnSparePartAction.href = `${ROUTES.SPARE_PART_SALE}?${paramsWorkOrder.toString()}`;
        btnSparePartAction.querySelector(".actionName").textContent = "Ver venta";
    } else if (sparePart.status === "Espera") {
        hideElement(btnSparePartAction);
        statusPart.querySelector(".statusTextSparePart").textContent = "En espera";
        statusPart.classList.add("pending");
        const paramsWorkOrder = buildParams({
            idWorkOrder: sparePart.idWorkOrder,
            isView: true,
            fromInventory: true
        });
        btnSparePartAction.href = `${ROUTES.WORK_ORDER_FORM}?${paramsWorkOrder.toString()}`;
        btnSparePartAction.querySelector(".actionName").textContent = "Ver orden de trabajo";
    } else if (sparePart.status === "Instalado") {
        statusPart.querySelector(".statusTextSparePart").textContent = "Instalado";
        statusPart.classList.add("installed");
        const paramsWorkOrder = buildParams({
            idWorkOrder: sparePart.idWorkOrder,
            isView: true,
            fromInventory: true
        });
        btnSparePartAction.href = `${ROUTES.WORK_ORDER_FORM}?${paramsWorkOrder.toString()}`;
        btnSparePartAction.querySelector(".actionName").textContent = "Ver orden de trabajo";
    }
};

const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    sparePartViewState.context.idSparePart = asUUID(params.get("id"));
};

const loadDataFlow = async (Refs) => {
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
    load: async () => { },
    DOMRefs
});

document.addEventListener("DOMContentLoaded", init);
