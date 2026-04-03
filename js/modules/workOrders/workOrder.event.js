export const initWorkOrdersEvents = ({ Refs, onSearchWorkOrder }) => {
    const { txtSearchData, cmbSearchByStatus } = Refs;

    let searchTimeout = null;
    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchWorkOrder({
                search: txtSearchData?.value.trim() || '',
                idStatus: cmbSearchByStatus?.value || ''
            });
        }, 1000);
    };
    txtSearchData.addEventListener("input", emitFilters);

    cmbSearchByStatus.addEventListener("change", emitFilters);
};
