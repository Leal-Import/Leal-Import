export const workOrderHistoryState = {
    list: [],
    context: {
        idVehicle: null,
        idCustomer: null
    },
    stateList: [],
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    },
    filters: {
        search: '',
        idStatus: ''
    }
};

export const resetWorkOrderHistoryState = () => {
    workOrderHistoryState.list = [];
    workOrderHistoryState.context = {
        idVehicle: null,
        idCustomer: null
    };
    workOrderHistoryState.stateList = [];
    workOrderHistoryState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    workOrderHistoryState.filters = {
        search: '',
        idStatus: ''
    };
};
