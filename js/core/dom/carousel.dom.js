// utils/carousel.js

let mainSwiperInstance = null;
let thumbsSwiperInstance = null;

const destroySwipers = () => {
    if (mainSwiperInstance) {
        mainSwiperInstance.destroy(true, true);
        mainSwiperInstance = null;
    }
    if (thumbsSwiperInstance) {
        thumbsSwiperInstance.destroy(true, true);
        thumbsSwiperInstance = null;
    }
};

export const initSimpleCarousel = (
    mainSelector = "#mainSwiper",
    gridSelector = ".imageGrid",
    swiperOptions = {}
) => {
    destroySwipers();

    mainSwiperInstance = new Swiper(mainSelector, {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        ...swiperOptions
    });

    const gridImages = document.querySelectorAll(`${gridSelector} img`);
    if (!gridImages.length) return mainSwiperInstance;

    // Seleccionar primera imagen por defecto
    gridImages[0].classList.add("selected");

    // Click en miniatura → ir al slide
    gridImages.forEach((img, index) => {
        img.addEventListener("click", () => {
            mainSwiperInstance.slideTo(index);
            gridImages.forEach(i => i.classList.remove("selected"));
            img.classList.add("selected");
        });
    });

    // Cambio de slide → actualizar miniatura seleccionada
    mainSwiperInstance.on("slideChange", () => {
        const current = mainSwiperInstance.activeIndex;
        gridImages.forEach(i => i.classList.remove("selected"));
        if (gridImages[current]) gridImages[current].classList.add("selected");
    });

    return mainSwiperInstance;
};

export const initThumbsCarousel = (
    mainSelector = "#mainSwiper",
    thumbsSelector = "#thumbsSwiper",
    mainOptions = {},
    thumbsOptions = {}
) => {
    destroySwipers();

    thumbsSwiperInstance = new Swiper(thumbsSelector, {
        slidesPerView: 4,
        spaceBetween: 10,
        watchSlidesProgress: true,
        ...thumbsOptions
    });

    mainSwiperInstance = new Swiper(mainSelector, {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        thumbs: {
            swiper: thumbsSwiperInstance
        },
        lazy: true,
        ...mainOptions
    });

    return { main: mainSwiperInstance, thumbs: thumbsSwiperInstance };
};

export const verifyCarouselBtns = (btnsCarousel, mainWrapper) => {
    const hasImages = mainWrapper.querySelectorAll(".swiper-slide").length > 0;
    btnsCarousel.forEach(btn => btn.classList.toggle("hide", !hasImages));
};

const _createPlusButton = (wrapper, onAddClick) => {
    const addThumb = document.createElement("div");
    addThumb.classList.add("swiper-slide", "thumb-add");
    addThumb.textContent = "+";
    addThumb.addEventListener("click", onAddClick);
    wrapper.appendChild(addThumb);
};

export const renderAndInitThumbsCarousel = ({
    images,
    mainWrapper,
    thumbsWrapper,
    onDelete,
    onAddClick,
    mainSelector = "#mainSwiper",
    thumbsSelector = "#thumbsSwiper",
    mainOptions = {},
    thumbsOptions = {}
}) => {
    mainWrapper.innerHTML = '';
    thumbsWrapper.innerHTML = '';

    if (!images.length) {
        mainWrapper.innerHTML = `
            <div class="swiper-slide">
                <div class="no-image-container">
                    <div class="no-image-icon">📷</div>
                    <p>No hay imágenes disponibles</p>
                </div>
            </div>
        `;
        _createPlusButton(thumbsWrapper, onAddClick);
        return;
    }

    images.forEach((img, index) => {
        // Slide principal
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<img src="${img.url}" class="previewImg">`;
        mainWrapper.appendChild(slide);

        // Thumb
        const thumb = document.createElement('div');
        thumb.className = 'swiper-slide thumb-box';
        thumb.innerHTML = `
            <img src="${img.url}">
            <div class="thumb-delete">×</div>
        `;
        thumb.querySelector('.thumb-delete').addEventListener('click', e => {
            e.stopPropagation();
            onDelete(index);
        });
        thumbsWrapper.appendChild(thumb);
    });

    _createPlusButton(thumbsWrapper, onAddClick);
    initThumbsCarousel(mainSelector, thumbsSelector, mainOptions, thumbsOptions);
};

export const renderAndInitViewCarousel = ({
    photos,
    mainWrapper,
    thumbsWrapper = null,
    mainSelector = "#mainSwiper",
    thumbsSelector = "#thumbsSwiper",
    thumbsOptions = {}
}) => {
    mainWrapper.innerHTML = '';
    if (thumbsWrapper) thumbsWrapper.innerHTML = '';

    photos.forEach(img => {
        mainWrapper.innerHTML += `
            <div class="swiper-slide">
                <img src="${img.photoUrl}" class="mainImage" alt="vehicle image">
            </div>
        `;

        if (thumbsWrapper) {
            thumbsWrapper.innerHTML += `
                <div class="swiper-slide">
                    <img src="${img.photoUrl}" class="thumbImage" alt="thumbnail">
                </div>
            `;
        }
    });

    if (thumbsWrapper) {
        initThumbsCarousel(mainSelector, thumbsSelector, {}, {
            slidesPerView: 6,
            freeMode: true,
            ...thumbsOptions
        });
    } else {
        initSimpleCarousel(mainSelector);
    }
};

