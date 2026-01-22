import { $, setupModal } from '../../utils/dom.js';
import { formatPhoneNumber } from '../../utils/formatters.js';

let searchTimeout = null;

export function initEmployeeEvents({ onSubmitEmployee, onSearchEmployee, onReset }) {

    const form = $('frmEmployees');
    const txtSearchData = $('txtSearchData');
    const cmbSearchByRole = $('cmbSearchByRole');
    const cmbSearchByStatus = $('cmbSearchByStatus');
    const txtEmployeePhone = $('txtEmployeePhone');

    if (txtEmployeePhone) {
        txtEmployeePhone.addEventListener('input', (e) => {
            formatPhoneNumber(e.target);
        });
    }

    setupModal('#OpenModalEmployees', '#modalEmployees', '#closeAddEmployee', '#frmEmployees', 'Agregar empleado', onReset);

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

    if (cmbSearchByStatus) {
        cmbSearchByStatus.addEventListener('change', emitFilters);
    }

    if (cmbSearchByRole) {
        cmbSearchByRole.addEventListener('change', emitFilters);
    }

    if (txtSearchData) {
        txtSearchData.addEventListener('input', emitFilters);
    }

    if (form) {
        form.addEventListener('submit', onSubmitEmployee);
    }
}
