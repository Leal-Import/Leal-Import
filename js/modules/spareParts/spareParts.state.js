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
    statusList: []
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
};
