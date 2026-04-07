import { addModalCloseEvents, debounce } from '../../utils/dom.js';
import { formatPhoneNumber } from '../../utils/formatters.js';

export const initEmployeeEvents = ({ Refs, onSubmitEmployee, onSearchEmployee, onCloseModal, onOpenModal, onClosePrivilegesModal }) => {
    const { txtEmployeePhone, cmbSearchByStatus, cmbSearchByRole, txtSearchData, frmEmployees, btnCloseModalEmployee, modalEmployees, btnOpenModalEmployees, btnCloseModalEmployeePrivileges, modalEmployeePrivileges } = Refs;

    const emitFilters = debounce(() => {
        onSearchEmployee({
            search: txtSearchData?.value.trim() || '',
            idRole: cmbSearchByRole?.value || '',
            status: cmbSearchByStatus?.value || ''
        });
    }, 1000);

    txtEmployeePhone.addEventListener('input', (e) => {
        formatPhoneNumber(e.target);
    });

    btnOpenModalEmployees.addEventListener("click", onOpenModal);

    btnCloseModalEmployee.addEventListener("click", onCloseModal);
    btnCloseModalEmployeePrivileges.addEventListener("click", onClosePrivilegesModal);

    addModalCloseEvents(modalEmployees, onCloseModal);
    addModalCloseEvents(modalEmployeePrivileges, onClosePrivilegesModal);

    cmbSearchByStatus.addEventListener('change', emitFilters);

    cmbSearchByRole.addEventListener('change', emitFilters);

    txtSearchData.addEventListener('input', emitFilters);

    frmEmployees.addEventListener('submit', onSubmitEmployee);
};
