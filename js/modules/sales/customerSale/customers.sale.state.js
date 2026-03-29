export const customerSaleState = {
    list: [],
    type: null,
    filters: {
        search: ''
    },
    context: {
        id: null
    },
    sparePart: null,
    pagination: {
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0
    }
};

export const resetCustomerSaleState = () => {
    customerSaleState.list = [];
    customerSaleState.type = null;
    customerSaleState.filters = { search: '' };
    customerSaleState.context = { id: null };
    customerSaleState.sparePart = null;
    customerSaleState.pagination = {
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0
    };
};
