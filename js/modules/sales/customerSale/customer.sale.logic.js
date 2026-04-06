import { showMessage } from "../../../utils/dom.js";
import { navigateTo, ROUTES } from "../../../utils/router.js";
import { sanitizeURLParam, sanitizeURLNumber } from "../../../utils/sanitizer.js";

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);
    const type = sanitizeURLParam(params.get("type"), 'vehicle');
    const newSparePartId = params.get("newSparePartId");
    const newSparePartName = sanitizeURLParam(params.get("newSparePartName"), '');
    const newSuggestedPrice = sanitizeURLNumber(params.get("newSuggestedPrice"), 0);
    const isNewPart = newSparePartId && newSparePartName && newSuggestedPrice ? true : false;
    if (!type) {
        await showMessage('Error', 'Tipo de venta no especificado', 'error');
        navigateTo(ROUTES.SALES);
        return false;
    }

    if (newSparePartId && newSparePartName && newSuggestedPrice) {
        state.sparePart = {
            id: newSparePartId,
            name: newSparePartName,
            suggestedPrice: newSuggestedPrice,
            isNewPart
        };
    }

    state.type = type;
    state.context.id = params.get("id");
    return true;
};

