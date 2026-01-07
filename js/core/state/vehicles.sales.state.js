export const vehicleSaleState = {
    context: {
        idSale: null,
        idCustomer: null,
        customerName: null,
        idVehicle: null
    },
    saleKey: null,
    idEmployee: null,
    idVehicle: null,
    data: {
        payments: [],
        paymentsToDelete: [],
        salePrice: 0,
        commission: '',
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
