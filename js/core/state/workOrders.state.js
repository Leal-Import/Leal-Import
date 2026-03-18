export const workOrdersState = {
    list: [],
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

export const resetWorkOrdersState = () => {
    workOrdersState.list = [];
    workOrdersState.stateList = [];
    workOrdersState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    workOrdersState.filters = {
        search: '',
        idStatus: ''
    };
};
