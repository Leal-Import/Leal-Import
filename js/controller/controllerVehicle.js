import {
  showMessage,
  fillSelect,
  formatWithCommas,
  allowMotoYear
} from '../utils.js';

import { getCustomers } from '../service/serviceCustomers.js';
import {
  getVehicles,
  getStatus,
} from '../service/serviceVehicle.js';

/* ==============================
    ELEMENTOS DEL DOM
============================== */

const txtSearchCustomer = document.getElementById("txtSearchData");
const txtSearchYear = document.getElementById("txtSearchYear");
const selectSearStatus = document.getElementById("cmbSearchByStatus");
const params = new URLSearchParams(window.location.search);
const workOrder = params.get("workOrder") || false;

let searchTimeout = null;
let statusList = [];

/* ==============================
    INICIO
============================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadStatusSelect();
  await loadVehicles();
  if (workOrder) {
    document.querySelector(".breadcrumb").textContent = "Selecciona un vehiculo";
    document.querySelector(".btnOpenModal").classList.add("hide");
  }
});

/* ==============================
    FILTROS
============================== */

allowMotoYear(txtSearchYear);

txtSearchCustomer.addEventListener('input', () => {
  filterData();
});

let filterData = async () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const yearQuery = txtSearchYear.value.trim();
    const searchQuery = txtSearchCustomer.value.trim();
    const statusQuery = selectSearStatus.value;
    await loadVehicles(searchQuery, statusQuery, yearQuery);
  }, 500);
}

txtSearchYear.addEventListener('input', async () => {
  filterData();
});

selectSearStatus.addEventListener('change', () => {
  filterData();
});

/* ==============================
    CARGAR ESTADOS EN SELECT
============================== */

let loadStatusSelect = async () => {
  try {
    const status = await getStatus();
    statusList = status;
    fillSelect('cmbSearchByStatus', statusList, 'idStatus', 'statusName');
  } catch (error) {
    console.error('Error al cargar estados:', error);
  }
};

/* ==============================
    CARGAR VEHÍCULOS
============================== */

const loadVehicles = async (search, stateId, year) => {
  try {
    const vehicles = await getVehicles(0, 15, search, stateId, year);
    insertVehicles(vehicles.content);
  } catch (error) {
    showMessage("Error", "No se pudieron cargar los vehículos." + error, "error");
  }
};

/* ==============================
    MOSTRAR TARJETAS DE VEHÍCULOS
============================== */

let insertVehicles = (vehicles) => {
  console.log(vehicles)
  const container = document.querySelector(".cardContainer");
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  if (vehicles.length === 0) {
    const noDataDiv = document.createElement("div");
    noDataDiv.textContent = "No hay vehículos disponibles.";
    noDataDiv.style.gridColumn = "1 / -1";
    noDataDiv.classList.add("noDataMessage");
    fragment.appendChild(noDataDiv);
  } else {

    vehicles.forEach(vehicle => {

      const card = document.createElement("div");
      const headerCard = document.createElement("div");
      const containerImgVehicle = document.createElement("div");
      const footerCard = document.createElement("div");
      const vehicleBrand = document.createElement("span");
      const vehiclePrice = document.createElement("span");
      const img = document.createElement("img");
      const vehicleStatus = document.createElement("div");
      const containerInfoVehicle = document.createElement("div");
      const containerButtons = document.createElement("div");
      const vinItem = document.createElement("div");
      const yearItem = document.createElement("div");
      const modelItem = document.createElement("div");

      // datos
      vehicleBrand.textContent = vehicle.brand;
      vehiclePrice.textContent = `$${formatWithCommas(vehicle.total)}`;
      vinItem.innerHTML = `<div>Vin:</div> <span>${vehicle.vin}</span>`;
      yearItem.innerHTML = `<div>Año:</div> <span>${vehicle.year}</span>`;
      modelItem.innerHTML = `<div>Modelo:</div> <span>${vehicle.model}</span>`;
      img.src = vehicle.photoUrl ? vehicle.photoUrl : "";
      vehicleStatus.textContent = vehicle.status;

      // clases
      card.classList.add("card");
      vehicleBrand.classList.add("truncate");
      headerCard.classList.add("headerCard");
      containerImgVehicle.classList.add("containerImgVehicle");
      footerCard.classList.add("footerCard");
      vehicleBrand.classList.add("vehicleBrand");
      vehiclePrice.classList.add("vehiclePrice");
      vehicleStatus.classList.add("vehicleStatus");
      containerInfoVehicle.classList.add("containerInfoVehicle");
      vinItem.classList.add("infoVehicleItem");
      yearItem.classList.add("infoVehicleItem");
      modelItem.classList.add("infoVehicleItem");
      containerButtons.classList.add("containerButtons");

      // botón ver más
      if (workOrder) {
        const btnSelect = document.createElement("a");
        btnSelect.textContent = "Seleccionar";
        btnSelect.classList.add("btnPrimary");
        btnSelect.href = `addWorkOrder.html?idVehicle=${vehicle.idVehicle}`
        containerButtons.appendChild(btnSelect);
      } else {
        const btnView = document.createElement("a");
        const btnEdit = document.createElement("a");
        btnView.textContent = "Ver más";
        btnEdit.textContent = "Editar";
        btnView.classList.add("btnPrimary");
        btnEdit.classList.add("btnSecondary")
        btnEdit.href = `vehicleDetails.html?id=${vehicle.idVehicle}`;
        btnView.href = `vehicleView.html?id=${vehicle.idVehicle}`;
        containerButtons.appendChild(btnView);
        containerButtons.appendChild(btnEdit);
      }

      containerInfoVehicle.appendChild(vinItem);
      containerInfoVehicle.appendChild(yearItem);
      containerInfoVehicle.appendChild(modelItem);
      headerCard.appendChild(vehicleBrand);
      headerCard.appendChild(vehiclePrice);
      containerImgVehicle.appendChild(img);
      footerCard.appendChild(vehicleStatus);
      footerCard.appendChild(containerInfoVehicle);
      footerCard.appendChild(containerButtons);
      card.appendChild(headerCard);
      card.appendChild(containerImgVehicle);
      card.appendChild(footerCard);
      fragment.appendChild(card);
    });
  }

  container.appendChild(fragment);
};
