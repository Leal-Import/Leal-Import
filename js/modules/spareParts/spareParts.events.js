import { debounce } from "../../utils/dom.js";
import { isValidFromToDates } from "../../utils/validators.js";

export const initSparePartsEvents = ({ Refs, onSearchSpareParts }) => {
    const { txtSearchData, cmbSearchByStatus, fromDt, toDt } = Refs;

    const emitFilters = debounce(() => {
        onSearchSpareParts({
            search: txtSearchData?.value.trim() || '',
            idState: cmbSearchByStatus?.value || '',
            startDate: fromDt?.value || '',
            endDate: toDt?.value || ''
        });
    }, 1000);

    const validateDates = (e) => {
        const validate = isValidFromToDates(fromDt.value, toDt.value, e.target);
        if (!validate) return;
        emitFilters();
    };

    txtSearchData.addEventListener('input', emitFilters);
    cmbSearchByStatus.addEventListener('change', emitFilters);
    fromDt.addEventListener('change', validateDates);
    toDt.addEventListener('change', validateDates);
};
