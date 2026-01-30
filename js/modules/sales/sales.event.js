import { $, qs } from "../../utils/dom.js"

let searchTimeout = null;

export let initSalesEvents = ({ onSearchSale, onClickBtnFilter, onOpenModal, onCloseModal }) => {
    const txtSearchData = $("txtSearchData");
    const cmbSearchByStatus = $("cmbSearchByStatus");
    const filterContainer = qs('.containerFilterType');
    const btnAskSale = $("btnAskSale");
    const modal = $("modalAskSale");
    const btnCloseModal = $("btnCloseModalAsk");

    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const selected = qs('.lineSelected.selected')?.closest('.filterType');
            onSearchSale({
                search: txtSearchData?.value.trim() || '',
                idState: cmbSearchByStatus?.value || '',
                productType: selected?.dataset.value ?? null
            })
        }, 1000);
    };
    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filterType');
        if (!btn) return;
        onClickBtnFilter(btn);
        emitFilters();
    });

    txtSearchData.addEventListener('input', emitFilters);
    cmbSearchByStatus.addEventListener('change', emitFilters);
    btnAskSale.addEventListener("click", onOpenModal);
    btnCloseModal.addEventListener("click", onCloseModal);
    modal.addEventListener("click", (e) => {
        if (e.target == modal) onCloseModal();
    })
}