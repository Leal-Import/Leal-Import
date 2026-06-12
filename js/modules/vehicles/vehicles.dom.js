
import { $, buildParams, qs } from '../../utils/dom.js';
import { formatWithCommas } from '../../utils/formatters.js';
import { ROUTES } from '../../utils/router.js';

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            cardContainer: qs('.cardContainer'),
            loaderVehicles: $('loaderVehicles'),
            btnAddVehicle: $('btnAddVehicle'),
            txtSearchData: $('txtSearchData'),
            txtSearchYear: $('txtSearchYear'),
            cmbSearchByStatus: $('cmbSearchByStatus'),
            cmbSearchByIsExternal: $('cmbSearchByIsExternal'),
            fromDt: $('fromDt'),
            toDt: $('toDt'),
            stockVehicles: $('stockVehicles'),
            soldVehicles: $('soldVehicles'),
            externalVehicles: $('externalVehicles'),
            noExternalVehicles: $('noExternalVehicles')
        };
        return this.refs;
    }
};

export const renderVehicleStats = (stats, refs) => {
    const { stockVehicles, soldVehicles, externalVehicles, noExternalVehicles } = refs;
    stockVehicles.textContent = stats.stockCount || 0;
    soldVehicles.textContent = stats.soldCount || 0;
    externalVehicles.textContent = stats.externalCount || 0;
    noExternalVehicles.textContent = stats.inventoryCount || 0;
};

export const resetVehiclesFilters = (Refs) => {
    const { txtSearchData, txtSearchYear, cmbSearchByStatus, cmbSearchByIsExternal, fromDt, toDt } = Refs;
    txtSearchData.value = '';
    txtSearchYear.value = '';
    cmbSearchByStatus.value = '';
    cmbSearchByIsExternal.value = '';
    fromDt.value = '';
    toDt.value = '';
};

export const insertVehicles = (container, vehicles, hasWorkOrder) => {
    if (!Array.isArray(vehicles)) return;
    container.innerHTML = '';

    const fragment = document.createDocumentFragment();

    if (vehicles.length === 0) {
        fragment.appendChild(createNoDataMessage());
        container.appendChild(fragment);
        return;
    }

    vehicles.forEach(vehicle => {
        fragment.appendChild(createVehicleCard(vehicle, hasWorkOrder));
    });

    container.appendChild(fragment);
};

/* ===============================
   COMPONENTES
================================ */

const createNoDataMessage = () => {
    const div = document.createElement('div');
    div.textContent = 'No hay vehículos disponibles.';
    div.classList.add('noDataMessage');
    return div;
};

const createVehicleCard = (vehicle, hasWorkOrder) => {
    const card = document.createElement('div');
    card.classList.add('card');

    card.appendChild(createHeader(vehicle));
    card.appendChild(createImage(vehicle));
    card.appendChild(createFooter(vehicle, hasWorkOrder));

    return card;
};

const createHeader = (vehicle) => {
    const header = document.createElement('div');
    header.classList.add('headerCard');

    const brand = document.createElement('span');
    brand.classList.add('vehicleBrand', 'truncate');
    brand.textContent = vehicle.brand;

    const price = document.createElement('span');
    if (vehicle.suggestedPrice) {
        price.textContent = formatWithCommas(vehicle.suggestedPrice || 0);
        price.classList.add('vehiclePrice');
    } else {
        price.textContent = 'E';
        price.classList.add('vehicleExternal');
    }

    header.appendChild(brand);
    header.appendChild(price);

    return header;
};

const createImage = (vehicle) => {
    const container = document.createElement('div');
    container.classList.add('containerImgVehicle');

    const img = document.createElement('img');
    img.src = vehicle.photoUrl || '';
    img.alt = vehicle.brand;

    container.appendChild(img);
    return container;
};

const createFooter = (vehicle, hasWorkOrder) => {
    const footer = document.createElement('div');
    footer.classList.add('footerCard');

    const status = document.createElement('div');
    status.classList.add('vehicleStatus');
    status.textContent = vehicle.status;

    footer.appendChild(status);
    footer.appendChild(createVehicleInfo(vehicle));
    footer.appendChild(createButtons(vehicle, hasWorkOrder));

    return footer;
};

const createVehicleInfo = (vehicle) => {
    const container = document.createElement('div');
    container.classList.add('containerInfoVehicle');

    container.appendChild(createInfoItem('Vin', vehicle.vin));
    container.appendChild(createInfoItem('Año', vehicle.year));
    container.appendChild(createInfoItem('Modelo', vehicle.model));

    return container;
};

const createInfoItem = (label, value) => {
    const item = document.createElement('div');
    item.classList.add('infoVehicleItem');

    const title = document.createElement('div');
    title.textContent = `${label}:`;

    const span = document.createElement('span');
    span.classList.add('truncate');
    span.textContent = value || '-';

    item.appendChild(title);
    item.appendChild(span);

    return item;
};

const createButtons = (vehicle, hasWorkOrder) => {
    const container = document.createElement('div');
    container.classList.add('containerButtons');

    if (hasWorkOrder) {
        const btnSelect = document.createElement('a');
        btnSelect.textContent = 'Seleccionar';
        btnSelect.classList.add('btnPrimary');
        const params = buildParams({ idVehicle: vehicle.idVehicle, idCustomer: vehicle.idOwnerCustomer });
        btnSelect.href = `${ROUTES.WORK_ORDER_FORM}?${params.toString()}`;
        container.appendChild(btnSelect);
    } else {
        const btnView = document.createElement('a');
        btnView.textContent = 'Ver más';
        btnView.classList.add('btnPrimary');
        btnView.href = `${ROUTES.VEHICLE_VIEW}?id=${vehicle.idVehicle}`;

        const btnEdit = document.createElement('a');
        btnEdit.textContent = 'Editar';
        btnEdit.dataset.privilege = 'WRITE_VEHICLES';
        btnEdit.classList.add('btnSecondary');
        btnEdit.href = `${ROUTES.VEHICLES_FORM}?id=${vehicle.idVehicle}`;

        container.appendChild(btnView);
        container.appendChild(btnEdit);
    }

    return container;
};
