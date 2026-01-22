import { setupModal, $ } from '../../utils/dom.js';
import { formatDUIInput, formatPhoneNumber } from '../../utils/formatters.js';

let searchTimeout = null;

export function initCustomerEvents({ onSubmitCustomer, onSearchCustomer, onCleanState }) {

    const frmCustomers = $("frmCustomers");
    const txtSearchCustomer = $("txtSearchData");
    const txtCustomerPhone = $("txtCustomerPhone");
    const txtCustomerDUI = $("txtCustomerDUI");

    setupModal(
        '#openModalCustomer',
        '#modalCustomers',
        '#closeAddCustomer',
        '#frmCustomers',
        'Agregar cliente',
        onCleanState
    );

    frmCustomers.addEventListener("submit", onSubmitCustomer);

    txtCustomerPhone.addEventListener('input', (e) => {
        formatPhoneNumber(e.target);
    });

    txtCustomerDUI.addEventListener('input', (e) => {
        formatDUIInput(e.target);
    });

    txtSearchCustomer.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchCustomer({
                search: txtSearchCustomer.value.trim()
            });
        }, 1000);
    });
}
