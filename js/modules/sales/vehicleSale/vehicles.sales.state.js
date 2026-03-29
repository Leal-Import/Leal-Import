export const vehicleSaleState = {
    context: {
        idSale: null,
        idCustomer: null,
        customerName: null,
        idVehicle: null,
        isView: null
    },
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

export const resetVehicleSaleState = () => {
    vehicleSaleState.context = {
        idSale: null,
        idCustomer: null,
        customerName: null,
        idVehicle: null,
        isView: null
    };
    vehicleSaleState.idEmployee = null;
    vehicleSaleState.idVehicle = null;
    vehicleSaleState.data = {
        payments: [],
        paymentsToDelete: [],
        salePrice: 0,
        commission: '',
        notes: ''
    };
    vehicleSaleState.totals = {
        total: 0,
        due: 0,
        totalPaid: 0
    };
    vehicleSaleState.list = [];
    vehicleSaleState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    vehicleSaleState.filters = {
        search: ''
    };
};
