// core/state/vehicles.state.js
export const vehiclesState = {
    list: [],
    context: {
        hasWorkOrder: null
    },
    filters: {
        search: '',
        year: '',
        statusId: '',
        statusExist: ''
    },
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    },
    statusList: []
};

export const resetVehiclesState = () => {
    vehiclesState.list = [];
    vehiclesState.context = {
        hasWorkOrder: null
    };
    vehiclesState.filters = {
        search: '',
        year: '',
        statusId: '',
        statusExist: ''
    };
    vehiclesState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    vehiclesState.statusList = [];
};
