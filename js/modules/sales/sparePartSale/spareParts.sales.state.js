export const spareSalesFormState = {
    context: {
        isView: false,
        idSale: null,
        idCustomer: null,
        customerName: null,
        isNewPart: null,
        newPartId: null,
        newPartName: null,
        suggestedPrice: null
    },
    saleKey: null,
    data: {
        selectedItems: [],
        payments: [],
        itemsToDelete: [],
        paymentsToDelete: [],
        notes: ''
    },
    totals: {
        total: 0,
        due: 0,
        totalPaid: 0
    },
    list: [],
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    },
    filters: {
        search: ''
    }
};

export const resetSpareSalesFormState = () => {
    spareSalesFormState.context = {
        idSale: null,
        idCustomer: null,
        customerName: null,
        isNewPart: null,
        newPartId: null,
        newPartName: null,
        suggestedPrice: null
    };
    spareSalesFormState.saleKey = null;
    spareSalesFormState.data = {
        selectedItems: [],
        payments: [],
        itemsToDelete: [],
        paymentsToDelete: [],
        notes: ''
    };
    spareSalesFormState.totals = {
        total: 0,
        due: 0,
        totalPaid: 0
    };
    spareSalesFormState.list = [];
    spareSalesFormState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    spareSalesFormState.filters = {
        search: ''
    };
};
