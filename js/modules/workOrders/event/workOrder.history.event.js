export const initWorkOrderHistoryEvents = ({ Refs, onSearchWorkOrderHistory }) => {
    let searchTimeout = null;

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchWorkOrderHistory({
                search: Refs.txtSearchData?.value.trim() || '',
                idStatus: Refs.cmbSearchByStatus?.value || ''
            });
        }, 1000);
    };

    if (Refs.txtSearchData) {
        Refs.txtSearchData.addEventListener("input", emitFilters);
    }

    if (Refs.cmbSearchByStatus) {
        Refs.cmbSearchByStatus.addEventListener("change", emitFilters);
    }
};
