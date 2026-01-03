// core/state/vehicles-detail.state.js

const params = new URLSearchParams(window.location.search);
export const vehicleDetailState = {
    currentId: params.get("id"),
    sale: params.get("sale") === 'true',
    workOrder: params.get("workOrder") === 'true',
    customerParamId: params.get("idCustomer"),
    customerNameParam: params.get("customerName"),
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
