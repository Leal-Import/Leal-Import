export const workOrdersFormState = {
    context: {
        idVehicle: null,
        idCustomer: null,
        idSale: null,
        idWorkOrder: null,
        customerName: '',
        vehiclePrice: 0,
        isView: false,
        isNewPart: null,
        idNewPart: null,
        newPartName: null,
        newPartSuggestedPrice: null
    },
    employeeList: [],
    employeeContext: {
        selectedArray: null,
        idItem: null,
        cell: null
    },
    saleKey: null,
    idEmployee: null,
    data: {
        selectedServices: [],
        servicesToDelete: [],
        payments: [],
        paymentsToDelete: [],
        selectedSpareParts: [],
        sparePartsToDelete: [],
        notes: '',
        estimatedDate: null
    },
    workOrder: null,
    totals: {
        total: 0,
        due: 0,
        totalPaid: 0
    }
};

export const resetWorkOrdersFormState = () => {
    workOrdersFormState.context = {
        idVehicle: null,
        idCustomer: null,
        idSale: null,
        idWorkOrder: null,
        customerName: '',
        vehiclePrice: 0,
        isView: false,
        isNewPart: null,
        idNewPart: null,
        newPartName: null,
        newPartSuggestedPrice: null
    };
    workOrdersFormState.saleKey = null;
    workOrdersFormState.idEmployee = null;
    workOrdersFormState.employeeList = [];
    workOrdersFormState.employeeContext = {
        selectedArray: null,
        idItem: null,
        cell: null
    };
    workOrdersFormState.data = {
        selectedServices: [],
        servicesToDelete: [],
        payments: [],
        paymentsToDelete: [],
        selectedSpareParts: [],
        sparePartsToDelete: [],
        notes: '',
        estimatedDate: null
    };
    workOrdersFormState.workOrder = null;
    workOrdersFormState.totals = {
        total: 0,
        due: 0,
        totalPaid: 0
    };
};
