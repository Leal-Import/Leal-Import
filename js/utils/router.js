export const ROUTES = {
    INDEX: '/index.html',
    LOGIN: '/pages/login.html',
    DASHBOARD: '/pages/dashboard.html',
    CONFIGURATION: '/pages/configuration.html',
    SALES: '/pages/sales.html',
    VEHICLE: '/pages/vehicle.html',
    VEHICLES_FORM: '/pages/vehiclesForm.html',
    VEHICLE_VIEW: '/pages/vehicleView.html',
    SPARE_PARTS: '/pages/spareParts.html',
    SPARE_PART_FORM: '/pages/sparePartsForm.html',
    SPARE_PART_VIEW: '/pages/sparePartsView.html',
    SPARE_PART_SALE: '/pages/sparePartSale.html',
    VEHICLE_SALE: '/pages/vehicleSale.html',
    CUSTOMER_SALE: '/pages/customerSale.html',
    WORK_ORDERS: '/pages/workOrders.html',
    WORK_ORDER_FORM: '/pages/workOrderForm.html',
    WORK_ORDER_HISTORY: '/pages/workOrderHistory.html'
};

/**
 * Navega a una ruta absoluta basada en origin, con query params opcionales.
 * @param {string} route - ruta absoluta o constante de ROUTES.
 * @param {object} params - pares key/value para query string.
 */
export const navigateTo = (route, params = {}) => {
    const url = new URL(route, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    window.location.href = url.toString();
};

/**
 * Navega usando replace (no deja registro en historial) a una ruta con params.
 */
export const replaceTo = (route, params = {}) => {
    const url = new URL(route, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    window.location.replace(url.toString());
};

/**
 * Navega directamente a una URL construida a partir de URLSearchParams existente.
 */
export const navigateToWithSearchParams = (route, searchParams) => {
    const url = new URL(route, window.location.origin);
    if (searchParams instanceof URLSearchParams) {
        searchParams.forEach((value, key) => url.searchParams.append(key, value));
    }
    window.location.href = url.toString();
};
