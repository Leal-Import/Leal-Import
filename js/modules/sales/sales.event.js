import { $, qs } from "../../utils/dom.js"

let searchTimeout = null;

export let initSalesEvents = ({ onSearchSale, onClickBtnFilter, onOpenModal, onCloseModal }) => {
    const txtSearchData = $("txtSearchData");
    const cmbSearchByStatus = $("cmbSearchByStatus");
    const btnAll = $('all');
    const btnVehicles = $('vehicles');
    const btnSpareParts = $('spareParts');
    const btnAskSale = $("btnAskSale");
    const modal = $("modalAskSale");
    const btnCloseModal = $("btnCloseModalAsk");

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

    btnAll.addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.classList.contains("filterType")) {
            onClickBtnFilter(e);
            emitFilters();
        }
    });
    btnVehicles.addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.classList.contains("filterType")) {
            onClickBtnFilter(e);
            emitFilters();
        }
    });
    btnSpareParts.addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.classList.contains("filterType")) {
            onClickBtnFilter(e);
            emitFilters();
        }
    });
    txtSearchData.addEventListener('input', emitFilters);
    cmbSearchByStatus.addEventListener('change', emitFilters);
    btnAskSale.addEventListener("click", onOpenModal);
    btnCloseModal.addEventListener("click", onCloseModal);
    modal.addEventListener("click", (e) => {
        if(e.target == modal) onCloseModal();
    })
}