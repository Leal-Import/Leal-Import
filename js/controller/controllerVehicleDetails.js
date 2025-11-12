import { getVehicles } from '../service/serviceVehicle.js';

const brand = document.getElementById("brand");
const price = document.getElementById("price");
const model = document.getElementById("model");
const vin = document.getElementById("vin");
const year = document.getElementById("year");
const dui = document.getElementById("dui");
const customerName = document.getElementById("customerName");
const suggestedPrice = document.getElementById("suggestedPrice");
const status = document.getElementById("status");
const params = new URLSearchParams(window.location.search);

document.addEventListener('DOMContentLoaded', async () => {
    await loadVehicle();
})

let loadVehicle = async () => {
    const vehicle = await getVehicles(0, 15, params.get("id"));
    console.log(vehicle)
    loadDataVehicle(vehicle.content[0]);
}

let loadDataVehicle = (vehicle) => {
    console.log(vehicle)
    brand.textContent = vehicle.brand;
    price.textContent = `$${vehicle.price}`;
    model.textContent = vehicle.model;
    vin.textContent = vehicle.vin;
    year.textContent = vehicle.year;
    customerName.textContent = vehicle.fullName;
    status.textContent = vehicle.nameStatus;
    vehicle.suggestedPrice != null ? suggestedPrice.textContent = `$${vehicle.suggestedPrice}` : suggestedPrice.closest(".infoRow").classList.add("hide");
    dui.textContent = vehicle.dui

    console.log(suggestedPrice)
    loadImgs(vehicle.photos)
}

let swiper = null;
let thumbsSwiper = null;

let loadImgs = (photos = []) => {

    // Inicializar Swipers solo una vez
    if (!swiper) {
        thumbsSwiper = new Swiper("#thumbsSwiper", {
            slidesPerView: 3,
            spaceBetween: 10,
        });

        swiper = new Swiper("#mainSwiper", {
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            thumbs: {
                swiper: thumbsSwiper
            },
            lazy: true
        });
    }

    swiper.removeAllSlides();
    thumbsSwiper.removeAllSlides();

    if (photos.length === 0) {
        swiper.addSlide(0, `
            <div class="swiper-slide no-image">
                <p>No hay imágenes disponibles</p>
            </div>
        `);
        return;
    }

    photos.forEach(photo => {
        const mainSlide = document.createElement("div");
        mainSlide.classList.add("swiper-slide");
        mainSlide.innerHTML = `<img src="${photo.photoUrl}" class="previewImg"/>`;
        swiper.addSlide(swiper.slides.length, mainSlide);

        const thumbSlide = document.createElement("div");
        thumbSlide.classList.add("swiper-slide");
        thumbSlide.innerHTML = `<img src="${photo.photoUrl}">`;
        thumbsSwiper.addSlide(thumbsSwiper.slides.length, thumbSlide);
    });

    thumbsSwiper.update();
    swiper.update();
};
