export const customersState = {
    list: [],
    selectedId: null,
    filters: {
        search: '',
        status: 'T' // T: Activo, F: Inactivo, '' para todos
    },
    pagination: {
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0
    }
};
