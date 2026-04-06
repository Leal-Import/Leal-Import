export const vehicleSalesFormState = {
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

export const resetVehicleSalesFormState = () => {
    vehicleSalesFormState.context = {
        idSale: null,
        idCustomer: null,
        customerName: null,
        idVehicle: null,
        isView: null
    };
    vehicleSalesFormState.idEmployee = null;
    vehicleSalesFormState.idVehicle = null;
    vehicleSalesFormState.data = {
        payments: [],
        paymentsToDelete: [],
        salePrice: 0,
        commission: '',
        notes: ''
    };
    vehicleSalesFormState.totals = {
        total: 0,
        due: 0,
        totalPaid: 0
    };
    vehicleSalesFormState.list = [];
    vehicleSalesFormState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    vehicleSalesFormState.filters = {
        search: ''
    };
};
