import { setupModal } from '../../utils/dom.js';
import { formatDUIInput, formatPhoneNumber } from '../../utils/formatters.js';


export function initCustomerEvents({ Refs, onSubmitCustomer, onSearchCustomer, onCleanState }) {
    
    let searchTimeout = null;
    setupModal(
        '#openModalCustomer',
        '#modalCustomers',
        '#closeAddCustomer',
        '#frmCustomers',
        'Agregar cliente',
        onCleanState
    );

    Refs.frmCustomers.addEventListener("submit", onSubmitCustomer);

    Refs.txtCustomerPhone.addEventListener('input', (e) => {
        formatPhoneNumber(e.target);
    });

    Refs.txtCustomerDUI.addEventListener('input', (e) => {
        formatDUIInput(e.target);
    });

    Refs.txtSearchData.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchCustomer({
                search: Refs.txtSearchData.value.trim()
            });
        }, 1000);
    });
}
