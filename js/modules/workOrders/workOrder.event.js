import { debounce } from "../../utils/dom.js";

export const initWorkOrdersEvents = ({ Refs, onSearchWorkOrder }) => {
    const { txtSearchData, cmbSearchByStatus } = Refs;

    const emitFilters = debounce(() => {
        onSearchWorkOrder({
            search: txtSearchData?.value.trim() || '',
            idStatus: cmbSearchByStatus?.value || ''
        });
    }, 1000);

    txtSearchData.addEventListener("input", emitFilters);
    cmbSearchByStatus.addEventListener("change", emitFilters);
};
