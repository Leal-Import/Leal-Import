// core/state/employees.state.js
export const employeesState = {
    list: [],
    selectedId: null,
    roles: [],
    filters: {
        search: '',
        idRole: '',
        status: ''
    },
    pagination: {
        page: 1,
        size: 15,
        total: 0,
        totalPages: 1
    }
};

export const resetEmployeesState = () => {
    employeesState.list = [];
    employeesState.selectedId = null;
    employeesState.roles = [];
    employeesState.filters = {
        search: '',
        idRole: '',
        status: ''
    };
    employeesState.pagination = {
        page: 1,
        size: 15,
        total: 0,
        totalPages: 1
    };
};
