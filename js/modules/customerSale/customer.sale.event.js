
export function initCustomerSaleEvents({ Refs,  onSearchCustomer }) {
    
    let searchTimeout = null;

    Refs.txtSearchData.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchCustomer({
                search: Refs.txtSearchData.value.trim()
            });
        }, 1000);
    });
}
