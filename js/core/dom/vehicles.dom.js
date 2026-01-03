
import { fillSelect } from '../../utils/dom.js';
import { formatWithCommas } from '../../utils/formatters.js';
import { vehiclesState } from '../state/vehicles.state.js';

export function insertVehicles(container, vehicles) {
    container.innerHTML = '';

    const fragment = document.createDocumentFragment();

    if (!vehicles || vehicles.length === 0) {
        fragment.appendChild(createNoDataMessage());
        container.appendChild(fragment);
        return;
    }

    vehicles.forEach(vehicle => {
        fragment.appendChild(createVehicleCard(vehicle));
    });

    container.appendChild(fragment);
}

export function renderStatusSelects() {
    fillSelect('cmbSearchByStatus', vehiclesState.statusList, 'idStatus', 'statusName', 'Buscar por estado');
}

/* ===============================
   COMPONENTES
================================ */

function createNoDataMessage() {
    const div = document.createElement('div');
    div.textContent = 'No hay vehículos disponibles.';
    div.classList.add('noDataMessage');
    div.style.gridColumn = '1 / -1';
    return div;
}

function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.classList.add('card');

    card.appendChild(createHeader(vehicle));
    card.appendChild(createImage(vehicle));
    card.appendChild(createFooter(vehicle));

    return card;
}

function createHeader(vehicle) {
    const header = document.createElement('div');
    header.classList.add('headerCard');

    const brand = document.createElement('span');
    brand.classList.add('vehicleBrand', 'truncate');
    brand.textContent = vehicle.brand;

    const price = document.createElement('span');
    price.classList.add('vehiclePrice');
    price.textContent = `$${formatWithCommas(vehicle.total)}`;

    header.appendChild(brand);
    header.appendChild(price);

    return header;
}

function createImage(vehicle) {
    const container = document.createElement('div');
    container.classList.add('containerImgVehicle');

    const img = document.createElement('img');
    img.src = vehicle.photoUrl || '';
    img.alt = vehicle.brand;

    container.appendChild(img);
    return container;
}

function createFooter(vehicle) {
    const footer = document.createElement('div');
    footer.classList.add('footerCard');

    const status = document.createElement('div');
    status.classList.add('vehicleStatus');
    status.textContent = vehicle.status;

    footer.appendChild(status);
    footer.appendChild(createVehicleInfo(vehicle));
    footer.appendChild(createButtons(vehicle));

    return footer;
}

function createVehicleInfo(vehicle) {
    const container = document.createElement('div');
    container.classList.add('containerInfoVehicle');

    container.appendChild(createInfoItem('Vin', vehicle.vin));
    container.appendChild(createInfoItem('Año', vehicle.year));
    container.appendChild(createInfoItem('Modelo', vehicle.model));

    return container;
}

function createInfoItem(label, value) {
    const item = document.createElement('div');
    item.classList.add('infoVehicleItem');

    const title = document.createElement('div');
    title.textContent = `${label}:`;

    const span = document.createElement('span');
    span.textContent = value || '-';

    item.appendChild(title);
    item.appendChild(span);

    return item;
}

function createButtons(vehicle) {
    const container = document.createElement('div');
    container.classList.add('containerButtons');

    if (vehiclesState.workOrder) {
        const btnSelect = document.createElement('a');
        btnSelect.textContent = 'Seleccionar';
        btnSelect.classList.add('btnPrimary');
        btnSelect.href = `addWorkOrder.html?idVehicle=${vehicle.idVehicle}&idCustomer=${vehicle.idOwnerCustomer}`;
        container.appendChild(btnSelect);
    } else {
        const btnView = document.createElement('a');
        btnView.textContent = 'Ver más';
        btnView.classList.add('btnPrimary');
        btnView.href = `vehicleView.html?id=${vehicle.idVehicle}`;

        const btnEdit = document.createElement('a');
        btnEdit.textContent = 'Editar';
        btnEdit.classList.add('btnSecondary');
        btnEdit.href = `vehicleDetails.html?id=${vehicle.idVehicle}`;

        container.appendChild(btnView);
        container.appendChild(btnEdit);
    }

    return container;
}
