// core/state/vehicles.state.js
export const vehiclesListState = {
    list: [],
    context: {
        hasWorkOrder: null
    },
    filters: {
        search: '',
        year: '',
        statusId: '',
        source: '',
        startDate: '',
        endDate: ''
    },
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    },
    statusList: [],
    stats: {
        stockCount: 0,
        soldCount: 0,
        externalCount: 0,
        inventoryCount: 0
    }
};

export const resetVehiclesListState = () => {
    vehiclesListState.list = [];
    vehiclesListState.context = {
        hasWorkOrder: null
    };
    vehiclesListState.filters = {
        search: '',
        year: '',
        statusId: '',
        source: '',
        startDate: '',
        endDate: ''
    };
    vehiclesListState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    vehiclesListState.statusList = [];
    vehiclesListState.stats = {
        stockCount: 0,
        soldCount: 0,
        externalCount: 0,
        inventoryCount: 0
    };
};
