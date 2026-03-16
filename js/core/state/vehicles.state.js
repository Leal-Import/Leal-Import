// core/state/vehicles.state.js
export const vehiclesState = {
    list: [],
    context: {
        hasWorkOrder: null
    },
    filters: {
        search: '',
        year: '',
        statusId: ''
    },
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    },
    statusList: []
};
