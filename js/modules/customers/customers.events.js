import { setupModal } from '../../utils/dom.js';
import { formatDUIInput, formatPhoneNumber } from '../../utils/formatters.js';


export function initCustomerEvents({ Refs, onSubmitCustomer, onSearchCustomer, onOpenModal, onCloseModal }) {

    let pointerDownOnOverlay = false;
    let searchTimeout = null;
    const { frmCustomers, txtCustomerPhone, txtCustomerDUI, txtSearchData, cmbSearchByStatus, modalCustomers, btnCloseModalCustomer, btnOpenModalCustomer } = Refs;

    const emiFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchCustomer({
                search: txtSearchData.value.trim(),
                status: cmbSearchByStatus.value
            });
        }, 1000);
    }

    btnOpenModalCustomer.addEventListener('click', onOpenModal);

    btnCloseModalCustomer.addEventListener('click', onCloseModal);

    modalCustomers.addEventListener('pointerdown', (e) => {
        pointerDownOnOverlay = e.target === modalCustomers;
    });
    modalCustomers.addEventListener('pointerup', (e) => {
        if (pointerDownOnOverlay && e.target === modalCustomers) onCloseModal();
        pointerDownOnOverlay = false;
    });

    frmCustomers.addEventListener("submit", onSubmitCustomer);

    txtCustomerPhone.addEventListener('input', (e) => {
        formatPhoneNumber(e.target);
    });

    txtCustomerDUI.addEventListener('input', (e) => {
        formatDUIInput(e.target);
    });

    txtSearchData.addEventListener('input', emiFilters);
    cmbSearchByStatus.addEventListener('change', emiFilters);
}
