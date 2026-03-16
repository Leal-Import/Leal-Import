import { formatPhoneNumber } from '../../utils/formatters.js';


export const initEmployeeEvents = ({ Refs, onSubmitEmployee, onSearchEmployee, onCloseModal, onOpenModal }) => {
    const { txtEmployeePhone, cmbSearchByStatus, cmbSearchByRole, txtSearchData, frmEmployees, btnCloseModalEmployee, modalEmployees, btnOpenModalEmployees } = Refs

    let pointerDownOnOverlay = false;
    let searchTimeout = null;
    const emitFilters = () => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            onSearchEmployee({
                search: txtSearchData?.value.trim() || '',
                idRole: cmbSearchByRole?.value || '',
                status: cmbSearchByStatus?.value || ''
            });
        }, 1000)
    };

    txtEmployeePhone.addEventListener('input', (e) => {
        formatPhoneNumber(e.target);
    });

    btnOpenModalEmployees.addEventListener("click", onOpenModal);

    btnCloseModalEmployee.addEventListener("click", onCloseModal);

    modalEmployees.addEventListener('pointerdown', (e) => {
        pointerDownOnOverlay = e.target === modalEmployees;
    });
    modalEmployees.addEventListener('pointerup', (e) => {
        if (pointerDownOnOverlay && e.target === modalEmployees) onCloseModal();
        pointerDownOnOverlay = false;
    });

    cmbSearchByStatus.addEventListener('change', emitFilters);

    cmbSearchByRole.addEventListener('change', emitFilters);

    txtSearchData.addEventListener('input', emitFilters);

    frmEmployees.addEventListener('submit', onSubmitEmployee);
}
