import {
  setupModal,
  isValidImage,
  showMessage,
  getInputsValues,
  fillForm,
  toggleModal,
  fillSelect
} from '../utils.js';

import { getCustomers } from '../service/serviceCustomers.js';

import {
  getVehicles,
  postVehicle,
  getStatus,
  putVehicle
} from '../service/serviceVehicle.js';

const frmVehicles = document.getElementById("frmVehicles");
const modalVehicle = document.getElementById("modalVehicle");
const btnAddNewVehicle = document.getElementById("btnAddNewVehicle");
const txtYear = document.getElementById("txtYear");
const txtYearFilter = document.getElementById("txtSearchYear");
const titleModal = document.querySelector(".titleModal");
const txtSearchCustomer = document.getElementById("txtSearchData");
const txtSearchYear = document.getElementById("txtSearchYear");
const selectSearStatus = document.getElementById("cmbSearchByStatus")
const txtCustomers = document.getElementById("txtCustomer");
const boxCus = document.getElementById('suggestDataContainer');
const btnOpenModal = document.getElementById("OpenModalVehicles");

let selectedFile = null;
let searchTimeout = null;
let currentId = null;
let statusList = [];
let photosToDeleteIds = [];

setupModal("#OpenModalVehicles", "#modalVehicle", "#closeAddVehicle", "#frmVehicles", "Agregar vehículo");

document.addEventListener("DOMContentLoaded", async () => {
  await loadVehicles();
  await loadStatusSelect();
});

btnOpenModal.addEventListener("click", () => {
  photosToDeleteIds = [];
});

txtSearchYear.addEventListener("input", () => {
  txtSearchYear.value = txtSearchYear.value.replace(/\D/g, "");
});

txtSearchCustomer.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const yearQuery = txtSearchYear.value.trim();
    const searchQuery = txtSearchCustomer.value.trim();
    const statusQuery = selectSearStatus.value;
    await loadVehicles(searchQuery, statusQuery, yearQuery);
  }, 1500);
});

txtSearchYear.addEventListener('input', async () => {
  const yearQuery = txtSearchYear.value.trim();
  const searchQuery = txtSearchCustomer.value.trim();
  const statusQuery = selectSearStatus.value;
  await loadVehicles(searchQuery, statusQuery, yearQuery);
});

selectSearStatus.addEventListener('change', () => {
  const yearQuery = txtSearchYear.value.trim();
  const searchQuery = txtSearchCustomer.value.trim();
  const statusQuery = selectSearStatus.value;
  loadVehicles(searchQuery, statusQuery, yearQuery);
});

const loadVehicles = async (search, stateId, year) => {
  try {
    const vehicles = await getVehicles(0, 15, search, stateId, year);
    insertVehicles(vehicles.content);
  } catch (error) {
    showMessage("Error", "No se pudieron cargar los vehículos." + error, "error");
  }
};


let insertVehicles = (vehicles) => {
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
      const btnEdit = document.createElement("button");
      const btnView = document.createElement("a");
      const vinItem = document.createElement("div");
      const yearItem = document.createElement("div");
      const modelItem = document.createElement("div");

      vehicleBrand.textContent = vehicle.brand;
      btnEdit.textContent = "Editar";
      btnView.textContent = "Ver más";
      btnEdit.classList.add("btnPrimary");
      btnView.classList.add("btnPrimary");
      btnView.href = `vehicleDetails.html?id=${vehicle.vin}`;
      containerButtons.classList.add("containerButtons");
      vehiclePrice.textContent = `$${vehicle.price}`;
      vinItem.innerHTML = `<div>Vin:</div> <span>${vehicle.vin}</span>`;
      yearItem.innerHTML = `<div>Año:</div> <span>${vehicle.year}</span>`;
      modelItem.innerHTML = `<div>Modelo:</div> <span>${vehicle.model}</span>`;
      img.src = vehicle.photos.length > 0 ? vehicle.photos[0].photoUrl : "";
      img.alt = `Imagen de ${vehicle.brand} ${vehicle.model}`;
      vehicleStatus.textContent = vehicle.nameStatus;

      card.classList.add("card");
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

      containerInfoVehicle.appendChild(vinItem);
      containerInfoVehicle.appendChild(yearItem);
      containerInfoVehicle.appendChild(modelItem);
      headerCard.appendChild(vehicleBrand);
      headerCard.appendChild(vehiclePrice);
      containerImgVehicle.appendChild(img);
      footerCard.appendChild(vehicleStatus);
      footerCard.appendChild(containerInfoVehicle);
      footerCard.appendChild(containerButtons);
      containerButtons.appendChild(btnView);
      containerButtons.appendChild(btnEdit);
      card.appendChild(headerCard);
      card.appendChild(containerImgVehicle);
      card.appendChild(footerCard);
      fragment.appendChild(card);
      btnEdit.addEventListener("click", () => {
        editVehicle(vehicle);
      });
    });
  }
  container.appendChild(fragment);
}

let editVehicle = (vehicle) => {
  currentId = vehicle.vin;
  fillForm('#frmVehicles', {
    txtVin: vehicle.vin,
    txtModel: vehicle.model,
    txtBrand: vehicle.brand,
    txtYear: vehicle.year,
    txtCustomer: vehicle.fullName,
    txtPrice: vehicle.price
  });
  loadImgs(vehicle.photos)
  if (vehicle.idCustomer != null) txtCustomers.dataset.id = vehicle.idCustomer;
  btnAddNewVehicle.value = "Actualizar vehiculo";
  titleModal.textContent = "Actualizar vehiculo";
  toggleModal(modalVehicle, true);
}

let loadImgs = (photos) => {

  swiper.removeAllSlides();

  photos.forEach(photo => {

    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    slide.dataset.photoId = photo.idPhoto;

    slide.innerHTML = `
      <button class="slideDeleteBtn" type="button">✖</button>
      <img class="previewImg" src="${photo.photoUrl}">
      <input class="inputFile" type="file" accept="image/png,image/jpeg,image/jpg" hidden />
    `;

    swiper.addSlide(swiper.slides.length, slide);
  });

  if (swiper.slides.length < maxSlides) {
    swiper.addSlide(swiper.slides.length, emptySlideTemplate());
  }

  swiper.update();
};



/* ===========================================
   LOAD SELECT
=========================================== */
let loadStatusSelect = async () => {
  try {
    const status = await getStatus();
    statusList = status; // Guardamos para mapear luego
    fillSelect('cmbSearchByStatus', statusList, 'idVehicleStatus', 'statusName');
  } catch (error) {
    console.error('Error al cargar roles en el select:', error);
  }
}


frmVehicles.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = getInputsValues(frmVehicles);

  let files = [];
  document.querySelectorAll(".inputFile").forEach(input => {
    if (input.files.length > 0) {
      files.push(input.files[0]);
    }
  });

  const {
    txtVin,
    txtBrand,
    txtCustomer,
    txtModel,
    txtPrice,
    txtYear
  } = formData;

  if (!txtVin || !txtModel || !txtPrice || !txtYear || !txtBrand) {
    showMessage('Por favor, complete todos los campos requeridos.', 'Campos vacios', 'warning');
    return;
  }

  let idCustomer = null;
  if (txtCustomers.dataset.id) idCustomer = txtCustomers.dataset.id;


  const vehicle = {
    vin: txtVin,
    brand: txtBrand,
    idCustomer: idCustomer,
    model: txtModel,
    price: txtPrice,
    year: txtYear
  };

  if (currentId != null) {
    vehicle.photosToDeleteIds = photosToDeleteIds;
    // 🧩 Validation for PUT (update)
    const slides = [...swiper.slides];
    const slidesWithImage = slides.filter(slide => slide.querySelector('.previewImg'));
    const slidesWithNewFile = slides.filter(slide => {
      const input = slide.querySelector('.inputFile');
      return input && input.files && input.files.length > 0;
    });

    const visibleImageCount = slidesWithImage.length;
    const newImageCount = slidesWithNewFile.length;
    const deletedImageCount = photosToDeleteIds.length;
    const originalImageCount = visibleImageCount + deletedImageCount;

    // 🔍 Rule: If all original images were deleted and no new image was added → show warning
    if (visibleImageCount === 0 && newImageCount === 0) {
      showMessage(
        'Debes de mantener al menos una imagen',
        'Imagen validación',
        'warning'
      );
      return;
    }
  }

  const fd = new FormData();
  files.forEach((file) => {
    fd.append(`photos`, file);
  });
  fd.append('vehicleData', JSON.stringify(vehicle));
  console.log(fd)

  try {
    if (currentId != null) {

      await putVehicle(fd, currentId);
      showMessage('Vehiculo actualizado con éxito!', 'Exito', 'success');
    } else {
      if (files.length === 0) {
        showMessage('Por favor, agregue al menos una imagen del vehículo.', 'Imagen requerida', 'warning');
        return;
      }
      await postVehicle(fd);
      showMessage('Vehiculo agregado con éxito!', 'Exito', 'success');
    }
    loadVehicles();
  } catch (error) {
    console.error("Error al realizar la operación:", error);
    const errorMessage = error.message || 'Error desconocido al registrar el vehiculo.';
    showMessage(errorMessage, 'error', 'error');
  } finally {
    photosToDeleteIds = [];
    modalVehicle.classList.add('hide');
    btnAddNewVehicle.value = "Agregar vehiculo";
    titleModal.textContent = "Agregar nuevo vehiculo";
    currentId = null;
  }
});

txtYearFilter.addEventListener("input", () => {
  formatYear(txtSearchYear);
})


txtYear.addEventListener("input", () => {
  formatYear(txtYear);
});


let formatYear = (txtYear) => {
  // Solo números
  txtYear.value = txtYear.value.replace(/\D/g, "");

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 40;

  if (txtYear.value.length === 4) {
    const yearNum = parseInt(txtYear.value);

    if (yearNum > currentYear) {
      txtYear.value = currentYear;
    } else if (yearNum < minYear) {
      txtYear.value = minYear;
    }
  }
}


const ctx = document.getElementById('vehicleChart').getContext('2d');

const data = {
  labels: ['Vendido', 'En stock'],
  datasets: [{
    data: [50, 6], // 🔹 Puedes cambiar estos valores dinámicamente desde tu base de datos
    backgroundColor: ['#D31813', '#E4B9B8'],
    hoverOffset: 10,
    borderWidth: 0
  }]
};

new Chart(ctx, {
  type: 'doughnut',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0D0503',
        bodyColor: '#0D0503',
        borderColor: '#CD908F',
        borderWidth: 1
      }
    },
    cutout: '70%',
  }
});

/* Busqueda de clientes */

txtCustomers.addEventListener('input', async () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = txtCustomers.value.trim();
    if (query == "") { boxCus.classList.replace("show", "hide"); return; }
    const data = await getCustomers(0, 15, query);
    const filtered = data.content;

    boxCus.innerHTML = '';
    filtered.forEach(cus => {
      const div = document.createElement('div');
      div.className = 'suggestionItem';
      div.innerHTML = `
        <span class="customerName">${cus.fullName}</span>
        <span class="clientDui">${cus.dui}</span>`;
      div.addEventListener('click', () => {
        txtCustomers.value = cus.fullName;
        boxCus.innerHTML = '';
        boxCus.classList.replace('show', 'hide');
        txtCustomers.setAttribute('data-id', cus.idClient);
      });
      boxCus.appendChild(div);
    });
    boxCus.classList.replace('hide', 'show');
  }, 1500);
});


/* Todo este js de abajo es solo del carrucel de imagenes */

/* ===========================================
   CONFIGURACIÓN DEL SWIPER (CARRUSEL)
=========================================== */

let maxSlides = 4;

let swiper = new Swiper(".vehicle-swiper", {
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  }
});

// ✅ TEMPLATE de slide vacío (NO elimina el input)
function emptySlideTemplate() {
  return `
    <div class="swiper-slide upload-slide">
      <div class="containerFile isEmpty">
        <div class="fileInputContainer">
          <input class="inputFile" type="file" accept="image/png,image/jpeg,image/jpg" hidden />
          <label class="btnPrimary labelFileBtn">Examinar</label>
          <p>o arrastra tus evidencias aquí</p>
        </div>
      </div>
    </div>
  `;
}

// ✅ TEMPLATE para slide con imagen (NO crea input nuevo)
function renderImageOnSlide(slide, url) {
  const containerFile = slide.querySelector(".containerFile");
  if (containerFile) containerFile.classList.remove("isEmpty");
  slide.innerHTML = `
    <button class="slideDeleteBtn" type="button">✖</button>
    <img class="previewImg" src="${url}">
    <input class="inputFile" type="file" accept="image/png,image/jpeg,image/jpg" hidden />
  `;
}

/* ===========================================
   EVENTOS DEL CARRUSEL
=========================================== */

// ✅ CLICK en "Examinar"
document.querySelector(".vehicle-swiper").addEventListener("click", (e) => {
  if (e.target.classList.contains("labelFileBtn")) {
    const input = e.target.closest(".swiper-slide").querySelector(".inputFile");
    if (input) input.click();
  }
});

// ✅ CLICK en imagen para reemplazar
document.querySelector(".vehicle-swiper").addEventListener("click", (e) => {
  if (e.target.classList.contains("previewImg")) {
    const input = e.target.closest(".swiper-slide").querySelector(".inputFile");
    if (input) input.click();
  }
});

// ✅ ELIMINAR SLIDE
document.querySelector(".vehicle-swiper").addEventListener("click", (e) => {
  if (e.target.classList.contains("slideDeleteBtn")) {
    const slide = e.target.closest(".swiper-slide");
    const index = [...swiper.slides].indexOf(slide);

    const photoId = slide.dataset.photoId;

    // Si tiene ID, significa que existía en BD → lo agregamos a la lista de eliminados
    if (photoId) {
      photosToDeleteIds.push(photoId);
    }

    swiper.removeSlide(index);
    swiper.update();

    if (![...swiper.slides].some(s => s.querySelector(".fileInputContainer"))) {
      swiper.addSlide(swiper.slides.length, emptySlideTemplate());
      swiper.update();
    }

  }
});

/* ===========================================
   CAMBIO DE ARCHIVO EN INPUT
=========================================== */

document.addEventListener("change", (e) => {
  if (!e.target.classList.contains("inputFile")) return;

  const file = e.target.files[0];
  if (!file) return;

  if (!isValidImage(file)) {
    return;
  }

  const url = URL.createObjectURL(file);
  const slide = e.target.closest(".swiper-slide");

  renderImageOnSlide(slide, url);

  // Asignar archivo al input existente (que se mantiene)
  const dt = new DataTransfer();
  dt.items.add(file);
  slide.querySelector(".inputFile").files = dt.files;

  if (swiper.slides.length < maxSlides && ![...swiper.slides].some(s => s.querySelector(".fileInputContainer"))) {
    swiper.addSlide(swiper.slides.length, emptySlideTemplate());
  }

  swiper.update();
});

/* ===========================================
   DRAG & DROP
=========================================== */

document.querySelector(".vehicle-swiper").addEventListener("dragover", (e) => {
  e.preventDefault();
  const slide = e.target.closest(".upload-slide");
  if (slide) slide.classList.add("drag-over");
});

document.querySelector(".vehicle-swiper").addEventListener("dragleave", (e) => {
  const slide = e.target.closest(".upload-slide");
  if (slide) slide.classList.remove("drag-over");
});

document.querySelector(".vehicle-swiper").addEventListener("drop", (e) => {
  e.preventDefault();

  const slide = e.target.closest(".upload-slide");
  if (!slide) return;

  slide.classList.remove("drag-over");

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const url = URL.createObjectURL(file);

  renderImageOnSlide(slide, url);

  const dt = new DataTransfer();
  dt.items.add(file);
  slide.querySelector(".inputFile").files = dt.files;

  if (swiper.slides.length < maxSlides) {
    swiper.addSlide(swiper.slides.length, emptySlideTemplate());
  }

  swiper.update();
});


document.addEventListener("click", (e) => {
  if (e.target.id == "closeAddVehicle" || e.target.id == "modalVehicle") {
    // Limpiar slides de imágenes
    swiper.removeAllSlides();
    swiper.addSlide(0, emptySlideTemplate());
    swiper.update();
  }
})