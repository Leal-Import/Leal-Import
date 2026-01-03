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
