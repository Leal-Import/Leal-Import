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
    },
    stats: {
        finalizedCount: 0,
        pendingCount: 0,
        delayedCount: 0
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
    workOrdersListState.stats = {
        finalizedCount: 0,
        pendingCount: 0,
        delayedCount: 0
    };
};
