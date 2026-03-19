
export const initVehicleEvents = ({ Refs, onSearchVehicles }) => {
    const { txtSearchData, txtSearchYear, cmbSearchByStatus, cmbSearchByIsExternal } = Refs;

    let searchTimeout = null;
    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchVehicles({
                search: txtSearchData?.value.trim() || '',
                year: txtSearchYear?.value.trim() || '',
                statusId: cmbSearchByStatus?.value || '',
                statusExist: cmbSearchByIsExternal?.value || ''
            });
        }, 1000);
    };

    txtSearchData.addEventListener('input', emitFilters);

    txtSearchYear.addEventListener('input', emitFilters);

    cmbSearchByStatus.addEventListener('change', emitFilters);

    cmbSearchByIsExternal.addEventListener('change', emitFilters);

};
