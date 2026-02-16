import { $ } from "../../../utils/dom.js";

export const initWorkOrdersEvents = ({ onSearchWorkOrder }) => {
    const txtSearch = $("txtSearchData");
    const cmbSearchByStatus = $("cmbSearchByStatus");
    let searchTimeout = null;

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchWorkOrder({
                search: txtSearch?.value.trim() || '',
                idStatus: cmbSearchByStatus?.value || ''
            });
        }, 1000);
    };

    if (txtSearch) {
        txtSearch.addEventListener("input", emitFilters);
    }

    if (cmbSearchByStatus) {
        cmbSearchByStatus.addEventListener("change", emitFilters);
    }
};
