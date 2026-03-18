export const sparePartDetailState = {
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

    image: {
        file: null,
        url: null
    },

    links: {
        bill: "",
        tracking: ""
    },

    costsId: null,
    trackingId: null
};

export const resetSparePartDetailState = () => {
    sparePartDetailState.context = {
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
    sparePartDetailState.statusList = [];
    sparePartDetailState.currentLinkType = null;
    sparePartDetailState.image = {
        file: null,
        url: null
    };
    sparePartDetailState.links = {
        bill: '',
        tracking: ''
    };
    sparePartDetailState.costsId = null;
    sparePartDetailState.trackingId = null;
};
