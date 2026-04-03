export const initSparePartsEvents = ({ Refs, onSearchSpareParts }) => {
    const { txtSearchData, cmbSearchByStatus } = Refs;

    let searchTimeout = null;

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchSpareParts({
                search: txtSearchData?.value.trim() || '',
                idState: cmbSearchByStatus?.value || ''
            });
        }, 1000);
    };

    txtSearchData.addEventListener('input', emitFilters);
    cmbSearchByStatus.addEventListener('change', emitFilters);
};
