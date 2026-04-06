
import { debounce } from '../../../utils/dom.js';

export const initCustomerSaleEvents = ({ Refs, onSearchCustomer }) => {
    const { txtSearchData } = Refs;

    const handleSearch = debounce(() => {
        onSearchCustomer({
            search: txtSearchData.value.trim()
        });
    }, 1000);

    txtSearchData.addEventListener('input', handleSearch);
};
