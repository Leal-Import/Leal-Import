// core/state/vehicles.state.js
export const vehiclesState = {
    list: [],
    filters: {
        search: '',
        year: '',
        stateId: ''
    },
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    },
    statusList: [],
    workOrder: new URLSearchParams(window.location.search).get("workOrder") || false
};