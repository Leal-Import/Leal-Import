import { showMessage } from "../../utils/dom.js";

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const newSparePartId = params.get("newSparePartId");
    const newSparePartName = params.get("newSparePartName");
    const newSuggestedPrice = params.get("newSuggestedPrice");
    const isNewPart = newSparePartId && newSparePartName && newSuggestedPrice ? true : false;
    if (!type) {
        await showMessage('Error', 'Tipo de venta no especificado', 'error');
        // opcional: redirigir
        window.location.href = 'sales.html';
        return false;
    }

    if (newSparePartId && newSparePartName && newSuggestedPrice) {
        state.sparePart = {
            id: newSparePartId,
            name: newSparePartName,
            suggestedPrice: parseFloat(newSuggestedPrice),
            isNewPart
        };
    }

    state.type = type;
    state.context.id = params.get("id");
    return true;
};

