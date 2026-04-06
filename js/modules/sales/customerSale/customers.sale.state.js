export const customerSalesFormState = {
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

export const resetCustomerSalesFormState = () => {
    customerSalesFormState.list = [];
    customerSalesFormState.type = null;
    customerSalesFormState.filters = { search: '' };
    customerSalesFormState.context = { id: null };
    customerSalesFormState.sparePart = null;
    customerSalesFormState.pagination = {
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0
    };
};
