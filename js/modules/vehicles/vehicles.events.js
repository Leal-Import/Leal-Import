import { debounce } from "../../utils/dom.js";
import { isValidFromToDates } from "../../utils/validators.js";

export const initVehicleEvents = ({ Refs, onSearchVehicles }) => {
    const { txtSearchData, txtSearchYear, cmbSearchByStatus, cmbSearchByIsExternal, fromDt, toDt } = Refs;

    const emitFilters = debounce(() => {
        onSearchVehicles({
            search: txtSearchData?.value.trim() || '',
            year: txtSearchYear?.value.trim() || '',
            statusId: cmbSearchByStatus?.value || '',
            source: cmbSearchByIsExternal?.value || '',
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
    txtSearchYear.addEventListener('input', emitFilters);
    cmbSearchByStatus.addEventListener('change', emitFilters);
    cmbSearchByIsExternal.addEventListener('change', emitFilters);
    fromDt.addEventListener('change', validateDates);
    toDt.addEventListener('change', validateDates);
};
