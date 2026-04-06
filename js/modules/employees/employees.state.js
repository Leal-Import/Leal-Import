// core/state/employees.state.js
export const employeesListState = {
    list: [],
    selectedId: null,
    roles: [],
    filters: {
        search: '',
        idRole: '',
        status: 'ACTIVE' // ACTIVE: Activo, INACTIVE: Inactivo, '' para todos
    },
    pagination: {
        page: 1,
        size: 15,
        total: 0,
        totalPages: 1
    }
};

export const resetEmployeesListState = () => {
    employeesListState.list = [];
    employeesListState.selectedId = null;
    employeesListState.roles = [];
    employeesListState.filters = {
        search: '',
        idRole: '',
        status: 'ACTIVE'
    };
    employeesListState.pagination = {
        page: 1,
        size: 15,
        total: 0,
        totalPages: 1
    };
};
