import {
  setupModal
} from '../utils.js';
// Configurar el modal para agregar Vehículos
const fileContainer = document.querySelector(".containerFile");
const evidencePreview = document.getElementById("evidencePreview");
const containerImgFile = document.getElementById("containerImgFile");
const uploadMessage = document.getElementById("uploadMessage");
const fileInput = document.getElementById("fileInput");
let selectedFile = null;

setupModal("#OpenModalVehicles", "#modalVehicle", "#closeAddVehicle", "#frmVehicles");

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

let maxSlides = 4;

let swiper = new Swiper(".vehicle-swiper", {
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  }
});

// ✅ Event delegation para detectar click en cualquier label dentro de swiper
document.querySelector(".vehicle-swiper").addEventListener("click", (e) => {
  if (e.target.classList.contains("labelFileBtn")) {
    const input = e.target.closest(".swiper-slide").querySelector(".inputFile");
    if (input) input.click();
  }
});

// ✅ Cuando el usuario selecciona un archivo, reemplazar slide por imagen y generar otro vacío
document.addEventListener("change", (e) => {
  if (!e.target.classList.contains("inputFile")) return;

  const file = e.target.files[0];
  if (!file) return;

  const imageURL = URL.createObjectURL(file);

  // remplaza el contenido del slide actual por la imagen
  const currentSlide = e.target.closest(".swiper-slide");
  currentSlide.innerHTML = `<img class="previewImg" src="${imageURL}">`;

  // si aún no llegó al máximo, genera un nuevo slide vacío
  if (swiper.slides.length < maxSlides) {
    swiper.addSlide(swiper.slides.length, emptySlideTemplate());
  }

  swiper.update();
});

// ✅ Template del slide vacío
function emptySlideTemplate() {
  return `
    <div class="swiper-slide upload-slide">
        <div class="containerFile isEmpty">
            <div class="fileInputContainer">
                <input class="inputFile hide" type="file" accept="image/png,image/jpeg,image/jpg">
                <label class="btnPrimary labelFileBtn">Examinar</label>
                <p>o arrastra tus evidencias aquí</p>
            </div>
        </div>
    </div>
  `;
}