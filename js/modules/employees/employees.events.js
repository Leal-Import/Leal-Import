import { setupModal } from '../../utils/dom.js';
import { formatPhoneNumber } from '../../utils/formatters.js';


export function initEmployeeEvents({ Refs, onSubmitEmployee, onSearchEmployee, onReset }) {

    let searchTimeout = null;

    if (Refs.txtEmployeePhone) {
        Refs.txtEmployeePhone.addEventListener('input', (e) => {
            formatPhoneNumber(e.target);
        });
    }

    setupModal('#OpenModalEmployees', '#modalEmployees', '#closeAddEmployee', '#frmEmployees', 'Agregar empleado', onReset);

    const emitFilters = () => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            onSearchEmployee({
                search: Refs.txtSearchData?.value.trim() || '',
                idRole: Refs.cmbSearchByRole?.value || '',
                status: Refs.cmbSearchByStatus?.value || ''
            });
        }, 1000)
    };

    if (Refs.cmbSearchByStatus) {
        Refs.cmbSearchByStatus.addEventListener('change', emitFilters);
    }

    if (Refs.cmbSearchByRole) {
        Refs.cmbSearchByRole.addEventListener('change', emitFilters);
    }

    if (Refs.txtSearchData) {
        Refs.txtSearchData.addEventListener('input', emitFilters);
    }

    if (Refs.frmEmployees) {
        Refs.frmEmployees.addEventListener('submit', onSubmitEmployee);
    }
}
