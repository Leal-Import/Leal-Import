// spareParts.events.js
import { sparePartsState } from '../../../core/state/spareParts.state.js';
import { $ } from '../../../utils/dom.js';

let searchTimeout = null;

export function initSparePartsEvents({ onSearchSpareParts }) {
    const txtSearch = $('txtSearchData');
    const cmbStatus = $('cmbSearchByStatus');

    const emitFilters = () => {
        sparePartsState.filters = {
            search: txtSearch?.value.trim() || '',
            idState: cmbStatus?.value || ''
        };

        sparePartsState.pagination.page = 1; // 🔑 reset page
        onSearchSpareParts();
    };

    if (txtSearch) {
        txtSearch.addEventListener('input', () => {
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
