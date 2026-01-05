const params = new URLSearchParams(window.location.search);

export const sparePartDetailState = {
    currentId: params.get("id"),
    sale: params.get("sale") === 'true',
    idSale: params.get("idSale"),
    workOrder: params.get("idWorkOrder"),
    isWorkOrder: params.get("workOrder") === 'true',
    statusList: [],
    currentLinkType: null,

    customerParamId: params.get("idCustomer"),
    customerNameParam: params.get("customerName"),
    vehicleParamId: params.get("idVehicle"),
    totalPriceParam: params.get("totalPrice"),

    image: {
        file: null,
        url: null
    },

    links: {
        bill: null,
        tracking: null
    },

    costsId: null,
    trackingId: null
};
