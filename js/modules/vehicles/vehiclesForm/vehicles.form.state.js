// core/state/vehicles-detail.state.js

export const vehicleDetailState = {
    context: {
        currentId: null,
        hasSale: null,
        hasWorkOrder: null,
        idCustomer: null,
        customerName: null
    },
    customerId: null,
    isExternal: false,
    images: [],
    photosToDeleteIds: [],
    currentUploadType: null,
    uploads: {
        bill: null,
        taxes: null,
        ship: null
    },
    urls: {
        bill: null,
        taxes: null,
        ship: null
    },
    costsId: null,
    loteId: null
};

export const resetVehicleDetailState = () => {
    vehicleDetailState.context = {
        currentId: null,
        hasSale: null,
        hasWorkOrder: null,
        idCustomer: null,
        customerName: null
    };
    vehicleDetailState.customerId = null;
    vehicleDetailState.isExternal = false;
    vehicleDetailState.images = [];
    vehicleDetailState.photosToDeleteIds = [];
    vehicleDetailState.currentUploadType = null;
    vehicleDetailState.uploads = {
        bill: null,
        taxes: null,
        ship: null
    };
    vehicleDetailState.urls = {
        bill: null,
        taxes: null,
        ship: null
    };
    vehicleDetailState.costsId = null;
    vehicleDetailState.loteId = null;
};
