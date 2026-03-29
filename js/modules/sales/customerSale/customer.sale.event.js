
export const initCustomerSaleEvents = ({ Refs,  onSearchCustomer }) => {
    const { txtSearchData } = Refs;

    let searchTimeout = null;

    txtSearchData.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchCustomer({
                search: txtSearchData.value.trim()
            });
        }, 1000);
    });
};
