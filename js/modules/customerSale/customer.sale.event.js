import { $ } from '../../utils/dom.js';


export function initCustomerSaleEvents({ onSearchCustomer }) {
    
    const txtSearchCustomer = $("txtSearchData");
    let searchTimeout = null;

    txtSearchCustomer.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchCustomer({
                search: txtSearchCustomer.value.trim()
            });
        }, 1000);
    });
}
