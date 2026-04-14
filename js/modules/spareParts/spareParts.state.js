export const sparePartsListState = {
    list: [],
    filters: {
        search: '',
        idState: '',
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
        installedCount: 0,
        waitingCount: 0,
        soldCount: 0
    }
};

export const resetSparePartsListState = () => {
    sparePartsListState.list = [];
    sparePartsListState.filters = {
        search: '',
        idState: '',
        startDate: '',
        endDate: ''
    };
    sparePartsListState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    sparePartsListState.statusList = [];
    sparePartsListState.stats = {
        stockCount: 0,
        installedCount: 0,
        waitingCount: 0,
        soldCount: 0
    };
};
