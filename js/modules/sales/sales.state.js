export const salesListState = {
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
        idState: '',
        productType: '',
        startDate: '',
        endDate: ''
    }
};

export const resetSalesListState = () => {
    salesListState.list = [];
    salesListState.stateList = [];
    salesListState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    salesListState.filters = {
        search: '',
        idState: '',
        productType: '',
        startDate: '',
        endDate: ''
    };
};
