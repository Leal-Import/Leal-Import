import { $, qsa } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            btnsCarousel: qsa(".btnsCarousel"),
            mainSwiperWrapper: $("mainSwiperWrapper"),
            imageInput: $("imageInput"),
            thumbsWrapper: $("thumbsWrapper")
        };
        return this.refs;
    }
};

let mainSwiperInstance = null;
let thumbsSwiperInstance = null;

const CLOSE_ICON = `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round">
        <path d="m6 6 12 12M18 6 6 18" />
    </svg>`;

const ADD_ICON = `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M12 5v14M5 12h14" />
    </svg>`;

const IMAGE_PLACEHOLDER_ICON = `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
    </svg>`;

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

const createImage = (url, className, alt) => {
    const image = document.createElement('img');
    image.src = url;
    image.className = className;
    image.alt = alt;
    return image;
};

const createImageSlide = (url, className, alt) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.appendChild(createImage(url, className, alt));
    return slide;
};

const createDeleteButton = onDelete => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb-delete';
    button.setAttribute('aria-label', 'Eliminar imagen');
    button.title = 'Eliminar imagen';
    button.innerHTML = CLOSE_ICON;
    button.addEventListener('click', event => {
        event.stopPropagation();
        onDelete();
    });
    return button;
};

const createThumbnail = (url, index, onDelete) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'swiper-slide thumb-box';
    thumbnail.append(
        createImage(url, '', `Miniatura ${index + 1}`),
        createDeleteButton(() => onDelete(index))
    );
    return thumbnail;
};

export const renderImages = (images, mainWrapper, thumbsWrapper, onDelete, onAddClick) => {
    mainWrapper.innerHTML = '';
    if (thumbsWrapper) thumbsWrapper.innerHTML = '';

    if (!images.length) {
        mainWrapper.innerHTML = `
            <div class="swiper-slide">
                <div class="noImageContainer">
                    <div class="noImageIcon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>
                    <p>No hay imágenes disponibles</p>
                </div>
            </div>
        `;
        _createPlusButton(thumbsWrapper, onAddClick);
        return;
    }

    images.forEach((img, index) => {
        mainWrapper.appendChild(createImageSlide(img.url, 'previewImg', `Imagen ${index + 1}`));
        thumbsWrapper.appendChild(createThumbnail(img.url, index, onDelete));
    });

    _createPlusButton(thumbsWrapper, onAddClick);
    initThumbsCarousel("#mainSwiper", "#thumbsSwiper", { lazy: true }, { slidesPerView: 4 });
};

const _createPlusButton = (wrapper, onAddClick) => {
    const addThumb = document.createElement('button');
    addThumb.type = 'button';
    addThumb.classList.add('swiper-slide', 'thumb-add');
    addThumb.setAttribute('aria-label', 'Agregar imágenes');
    addThumb.title = 'Agregar imágenes';
    addThumb.innerHTML = ADD_ICON;
    addThumb.addEventListener('click', onAddClick);
    wrapper.appendChild(addThumb);
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

    gridImages[0].classList.add("selected");

    gridImages.forEach((img, index) => {
        img.addEventListener("click", () => {
            mainSwiperInstance.slideTo(index);
            gridImages.forEach(i => i.classList.remove("selected"));
            img.classList.add("selected");
        });
    });

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

export const verifyCarouselBtns = (btnsCarousel, images) => {
    const hasImages = images.length > 0;
    btnsCarousel.forEach(btn => btn.classList.toggle("hide", !hasImages));
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
                    <div class="no-image-icon">${IMAGE_PLACEHOLDER_ICON}</div>
                    <p>No hay imágenes disponibles</p>
                </div>
            </div>
        `;
        _createPlusButton(thumbsWrapper, onAddClick);
        return;
    }

    images.forEach((img, index) => {
        mainWrapper.appendChild(createImageSlide(img.url, 'previewImg', `Imagen ${index + 1}`));
        thumbsWrapper.appendChild(createThumbnail(img.url, index, onDelete));
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
        mainWrapper.appendChild(createImageSlide(img.photoUrl, 'mainImage', 'Imagen principal'));

        if (thumbsWrapper) {
            thumbsWrapper.appendChild(createImageSlide(img.photoUrl, 'thumbImage', 'Miniatura'));
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
