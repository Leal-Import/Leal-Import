export const workOrderDetailsState = {
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

export const resetWorkOrderDetailsState = () => {
    workOrderDetailsState.context = {
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
    workOrderDetailsState.saleKey = null;
    workOrderDetailsState.idEmployee = null;
    workOrderDetailsState.data = {
        selectedServices: [],
        servicesToDelete: [],
        payments: [],
        paymentsToDelete: [],
        selectedSpareParts: [],
        sparePartsToDelete: [],
        notes: '',
        estimatedDate: null
    };
    workOrderDetailsState.workOrder = null;
    workOrderDetailsState.totals = {
        total: 0,
        due: 0,
        totalPaid: 0
    };
};
