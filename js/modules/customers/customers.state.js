export const customersListState = {
    list: [],
    selectedId: null,
    filters: {
        search: '',
        status: 'ACTIVE' // ACTIVE: Activo, INACTIVE: Inactivo, '' para todos
    },
    pagination: {
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0
    }
};

export const resetCustomersListState = () => {
    customersListState.list = [];
    customersListState.selectedId = null;
    customersListState.filters = {
        search: '',
        status: 'ACTIVE'
    };
    customersListState.pagination = {
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0
    };
};
