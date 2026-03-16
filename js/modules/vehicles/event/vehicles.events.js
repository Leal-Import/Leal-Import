
export const initVehicleEvents = ({ Refs, onSearchVehicles }) => {
    let searchTimeout = null;
    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchVehicles({
                search: Refs.txtSearchData?.value.trim() || '',
                year: Refs.txtSearchYear?.value.trim() || '',
                statusId: Refs.cmbSearchByStatus?.value || ''
            });
        }, 1000);
    };

    if (Refs.txtSearchData) {
        Refs.txtSearchData.addEventListener('input', emitFilters);
    }

    if (Refs.txtSearchYear) {
        Refs.txtSearchYear.addEventListener('input', emitFilters);
    }

    if (Refs.cmbSearchByStatus) {
        Refs.cmbSearchByStatus.addEventListener('change', emitFilters);
    }
};
