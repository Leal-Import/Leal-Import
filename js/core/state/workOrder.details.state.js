export const workOrderDetailsState = {
    context: {
        idVehicle: null,
        idCustomer: null,
        idSale: null,
        idWorkOrder: null,
        customerName: '',
        vehiclePrice: 0,
        isView: null,
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
    totals: {
        total: 0,
        due: 0,
        totalPaid: 0
    }
};
