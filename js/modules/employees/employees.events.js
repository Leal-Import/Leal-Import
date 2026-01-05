import { $, setupModal } from '../../utils/dom.js';
import { formatPhoneNumber } from '../../utils/formatters.js';

let searchTimeout = null;

export function initEmployeeEvents({onSubmitEmployee, onSearchEmployee, onReset}) {

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

    setupModal(
        '#OpenModalEmployees',
        '#modalEmployees',
        '#closeAddEmployee',
        '#frmEmployees',
        'Agregar empleado',
        onReset
    );

    const emitFilters = () => {
        onSearchEmployee({
            search: txtSearchData?.value.trim() || '',
            idRole: cmbSearchByRole?.value || '',
            status: cmbSearchByStatus?.value || ''
        });
    };

    if (cmbSearchByStatus) {
        cmbSearchByStatus.addEventListener('change', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(emitFilters, 1000);
        });
    }

    if (cmbSearchByRole) {
        cmbSearchByRole.addEventListener('change', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(emitFilters, 1000);
        });
    }

    if (txtSearchData) {
        txtSearchData.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(emitFilters, 1000);
        });
    }

    if (form) {
        form.addEventListener('submit', onSubmitEmployee);
    }
}
