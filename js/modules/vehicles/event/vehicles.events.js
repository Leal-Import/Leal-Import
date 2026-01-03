// vehicles.events.js
import { vehiclesState } from '../../../core/state/vehicles.state.js';
import { $ } from '../../../utils/dom.js';

let searchTimeout = null;

export function initVehicleEvents({ onSearchVehicles }) {
    const txtSearch = $('txtSearchData');
    const txtSearchYear = $('txtSearchYear');
    const cmbStatus = $('cmbSearchByStatus');

    const emitFilters = () => {
        vehiclesState.filters = {
            search: txtSearch?.value.trim() || '',
            year: txtSearchYear?.value.trim() || '',
            stateId: cmbStatus?.value || ''
        };

        vehiclesState.pagination.page = 1; // 🔑 reset page
        onSearchVehicles();
    };

    if (txtSearch) {
        txtSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(emitFilters, 1000);
        });
    }

    if (txtSearchYear) {
        txtSearchYear.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(emitFilters, 1000);
        });
    }

    if (cmbStatus) {
        cmbStatus.addEventListener('change', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(emitFilters, 1000);
        });
    }
}
