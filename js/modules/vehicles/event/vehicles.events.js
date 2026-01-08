// vehicles.events.js
import { $ } from '../../../utils/dom.js';

let searchTimeout = null;

export function initVehicleEvents({ onSearchVehicles }) {
    const txtSearch = $('txtSearchData');
    const txtSearchYear = $('txtSearchYear');
    const cmbStatus = $('cmbSearchByStatus');

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchVehicles({
                search: txtSearch?.value.trim() || '',
                year: txtSearchYear?.value.trim() || '',
                stateId: cmbStatus?.value || ''
            });
        }, 1000)
    };

    if (txtSearch) {
        txtSearch.addEventListener('input', emitFilters);
    }

    if (txtSearchYear) {
        txtSearchYear.addEventListener('input', emitFilters);
    }

    if (cmbStatus) {
        cmbStatus.addEventListener('change', emitFilters);
    }
}
