import { addModalCloseEvents, debounce } from '../../utils/dom.js';
import { formatDUIInput, formatPhoneNumber } from '../../utils/formatters.js';

export const initCustomerEvents = ({ Refs, onSubmitCustomer, onSearchCustomer, onOpenModal, onCloseModal }) => {
    const { frmCustomers, txtCustomerPhone, txtCustomerDUI, txtSearchData, cmbSearchByStatus, modalCustomers, btnCloseModalCustomer, btnOpenModalCustomer } = Refs;

    const emiFilters = debounce(() => {
        onSearchCustomer({
            search: txtSearchData.value.trim(),
            status: cmbSearchByStatus.value
        });
    }, 1000);

    btnOpenModalCustomer.addEventListener('click', onOpenModal);

    btnCloseModalCustomer.addEventListener('click', onCloseModal);

    addModalCloseEvents(modalCustomers, onCloseModal);

    frmCustomers.addEventListener("submit", onSubmitCustomer);

    txtCustomerPhone.addEventListener('input', (e) => {
        formatPhoneNumber(e.target);
    });

    txtCustomerDUI.addEventListener('input', (e) => {
        formatDUIInput(e.target);
    });

    txtSearchData.addEventListener('input', emiFilters);
    cmbSearchByStatus.addEventListener('change', emiFilters);
};
