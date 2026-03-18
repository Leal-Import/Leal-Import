export const salesState = {
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
        productType: ''
    }
};

export const resetSalesState = () => {
    salesState.list = [];
    salesState.stateList = [];
    salesState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    salesState.filters = {
        search: '',
        idState: '',
        productType: ''
    };
};
