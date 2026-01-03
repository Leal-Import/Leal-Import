import { $, qs } from "../../utils/dom.js"

let searchTimeout = null;

export let initSalesEvents = ({ onSearchSale }) => {
    const txtSearchData = $("txtSearchData");
    const cmbSearchByStatus = $("cmbSearchByStatus");
    const btnAll = $('all');
    const btnVehicles = $('vehicles');
    const btnSpareParts = $('spareParts');

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchSale({
                search: txtSearchData?.value.trim() || '',
                idState: cmbSearchByStatus?.value || '',
                productType: qs('.selected').closest('.filterType').dataset.value
            })
        }, 1000);
    };

    btnAll.addEventListener("click", emitFilters);
    btnVehicles.addEventListener("click", emitFilters);
    btnSpareParts.addEventListener("click", emitFilters);
    txtSearchData.addEventListener('input', emitFilters);
    cmbSearchByStatus.addEventListener('change', emitFilters);
}