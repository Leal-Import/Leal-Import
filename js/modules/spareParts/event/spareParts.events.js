export const initSparePartsEvents = ({ Refs,  onSearchSpareParts }) => {
    let searchTimeout = null;

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchSpareParts({
                search: Refs.txtSearchData?.value.trim() || '',
                idState: Refs.cmbSearchByStatus?.value || ''
            });
        }, 1000);
    };

    if (Refs.txtSearchData) {
        Refs.txtSearchData.addEventListener('input', emitFilters);
    }

    if (Refs.cmbSearchByStatus) {
        Refs.cmbSearchByStatus.addEventListener('change', emitFilters);
    }
};
