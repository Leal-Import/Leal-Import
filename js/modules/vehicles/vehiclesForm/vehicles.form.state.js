// core/state/vehicles-detail.state.js

export const vehiclesFormState = {
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

export const resetVehiclesFormState = () => {
    vehiclesFormState.context = {
        currentId: null,
        hasSale: null,
        hasWorkOrder: null,
        idCustomer: null,
        customerName: null
    };
    vehiclesFormState.customerId = null;
    vehiclesFormState.isExternal = false;
    vehiclesFormState.images = [];
    vehiclesFormState.photosToDeleteIds = [];
    vehiclesFormState.currentUploadType = null;
    vehiclesFormState.uploads = {
        bill: null,
        taxes: null,
        ship: null
    };
    vehiclesFormState.urls = {
        bill: null,
        taxes: null,
        ship: null
    };
    vehiclesFormState.costsId = null;
    vehiclesFormState.loteId = null;
};
