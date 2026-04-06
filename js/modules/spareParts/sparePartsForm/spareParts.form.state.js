export const sparePartsFormState = {
    context: {
        currentId: null,
        hasSale: null,
        idSale: null,
        idWorkOrder: null,
        hasWorkOrder: null,
        idCustomer: null,
        customerName: null,
        idVehicle: null,
        totalPrice: null
    },
    statusList: [],
    currentLinkType: null,
    sparePartPhotos: [],
    photosToDeleteIds: [],

    links: {
        bill: "",
        tracking: ""
    },

    costsId: null,
    trackingId: null
};

export const resetSparePartsFormState = () => {
    sparePartsFormState.context = {
        currentId: null,
        hasSale: null,
        idSale: null,
        idWorkOrder: null,
        hasWorkOrder: null,
        idCustomer: null,
        customerName: null,
        idVehicle: null,
        totalPrice: null
    };
    sparePartsFormState.statusList = [];
    sparePartsFormState.currentLinkType = null;
    sparePartsFormState.sparePartPhotos = [];
    sparePartsFormState.photosToDeleteIds = [];
    sparePartsFormState.links = {
        bill: '',
        tracking: ''
    };
    sparePartsFormState.costsId = null;
    sparePartsFormState.trackingId = null;
};
