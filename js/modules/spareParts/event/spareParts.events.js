// spareParts.events.js
import { $ } from '../../../utils/dom.js';

let searchTimeout = null;

export function initSparePartsEvents({ Refs,  onSearchSpareParts }) {
    const txtSearch = $('txtSearchData');
    const cmbStatus = $('cmbSearchByStatus');

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchSpareParts({
                search: txtSearch?.value.trim() || '',
                idState: cmbStatus?.value || ''
            });
        }, 1000)
    };

    if (txtSearch) {
        txtSearch.addEventListener('input', emitFilters);
    }

    if (cmbStatus) {
        cmbStatus.addEventListener('change', emitFilters);
    }
}
