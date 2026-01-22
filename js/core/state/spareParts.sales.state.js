export const spareSaleState = {
    context: {
        idSale: null,
        idCustomer: null,
        customerName: null,
        isNewPart: null,
        newPartId: null,
        newPartName: null,
        suggestedPrice: null
    },
    saleKey: null,
    idEmployee: null,
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
