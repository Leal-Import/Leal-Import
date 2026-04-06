export const workOrdersListState = {
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

export const resetWorkOrdersListState = () => {
    workOrdersListState.list = [];
    workOrdersListState.stateList = [];
    workOrdersListState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    workOrdersListState.filters = {
        search: '',
        idStatus: ''
    };
};
