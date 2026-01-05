const params = new URLSearchParams(window.location.search);

export const spareSaleState = {
    context: {
        idSale: params.get('idSale'),
        idCustomer: params.get('idCustomer'),
        customerName: params.get('customerName'),
        isNewPart: params.get('isNewPart') === 'true',
        newPartId: params.get('sparePartId'),
        newPartName: params.get('sparePartName'),
        suggestedPrice: params.get('suggestedPrice')
    },
    saleKey: `saleSpareState_customer_${params.get('idCustomer')}_${params.get('idSale') || "NewSale"}`,
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
