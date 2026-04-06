import { showMessage } from "../../utils/dom.js";
import { renderImages, verifyCarouselBtns, DOMRefs } from "./carousel.dom.js";
import { addImageToCarouselState, addMultipleImagesToCarouselState, removeImageFromCarouselState, validateNewImages } from "./carousel.logic.js";
import { carouselState } from "./carousel.state.js";
import { initCarouselEvents } from "./carousel.event.js";

export const initCarouselController = (formState, { imagesStateName, imagesToDeleteIdsStateName }) => {
    try {
        carouselState.state = formState;
        carouselState.imagesStateName = imagesStateName;
        carouselState.imagesToDeleteIdsStateName = imagesToDeleteIdsStateName;

        const refs = DOMRefs.init();

        initCarouselEvents({
            imageInput: refs.imageInput,
            onAddImage: (e) => onAddImages(e),
            btnsCarousel: refs.btnsCarousel,
            mainSwiperWrapper: refs.mainSwiperWrapper,
            thumbsWrapper: refs.thumbsWrapper
        });

        // Renderizar imágenes iniciales si existen
        const images = formState[imagesStateName];
        renderImages(
            images,
            refs.mainSwiperWrapper,
            refs.thumbsWrapper,
            (index) => handleDeleteImage(formState, index),
            () => refs.imageInput.click()
        );
        verifyCarouselBtns(refs.btnsCarousel, images);
    } catch (error) {
        throw new Error("Error inicializando carrusel de imágenes: " + error.message, { cause: error });
    }
};

const onAddImages = (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const validateionError = validateNewImages(carouselState.state[carouselState.imagesStateName], files);
    if (validateionError) {
        showMessage("Error", validateionError, "warning");
        return;
    }
    addMultipleImagesToCarouselState(carouselState.state, carouselState.imagesStateName, files);
    renderImages(
        carouselState.state[carouselState.imagesStateName],
        DOMRefs.refs.mainSwiperWrapper,
        DOMRefs.refs.thumbsWrapper,
        (index) => handleDeleteImage(carouselState.state, index),
        () => DOMRefs.refs.imageInput.click()
    );
    verifyCarouselBtns(DOMRefs.refs.btnsCarousel, carouselState.state[carouselState.imagesStateName]);
    DOMRefs.refs.mainSwiperWrapper.classList.add("mainSwiperUsed");
    DOMRefs.refs.imageInput.value = "";
};

export const handleAddImage = (state, image) => {
    const currentImages = state[carouselState.imagesStateName];
    const validationError = validateNewImages(currentImages, image);
    if (validationError) {
        showMessage("Error", validationError, "warning");
        return;
    }
    addImageToCarouselState(state, carouselState.imagesStateName, image);
    const updatedImages = state[carouselState.imagesStateName];

    renderImages(
        updatedImages,
        DOMRefs.refs.mainSwiperWrapper,
        DOMRefs.refs.thumbsWrapper,
        (index) => handleDeleteImage(state, index),
        () => DOMRefs.refs.imageInput.click()
    );
    verifyCarouselBtns(DOMRefs.refs.btnsCarousel, updatedImages);
    DOMRefs.refs.mainSwiperWrapper.classList.add("mainSwiperUsed");
    DOMRefs.refs.imageInput.value = "";
};

const handleDeleteImage = (formState, index) => {
    removeImageFromCarouselState(
        formState,
        carouselState.imagesStateName,
        carouselState.imagesToDeleteIdsStateName,
        index
    );

    const refs = DOMRefs.refs;
    const updatedImages = formState[carouselState.imagesStateName];

    renderImages(
        updatedImages,
        refs.mainSwiperWrapper,
        refs.thumbsWrapper,
        (idx) => handleDeleteImage(formState, idx),
        () => refs.imageInput.click()
    );

    verifyCarouselBtns(refs.btnsCarousel, updatedImages);

    if (!updatedImages.length) {
        refs.mainSwiperWrapper.classList.remove("mainSwiperUsed");
    }
};

/**
 * Public API para acciones del carrusel
 */
export const getCarouselImages = () => {
    if (!carouselState.state || !carouselState.imagesStateName) {
        throw new Error("Carrusel no inicializado");
    }
    return carouselState.state[carouselState.imagesStateName];
};

export const renderCarouselImages = () => {
    if (!carouselState.state || !carouselState.imagesStateName) {
        throw new Error("Carrusel no inicializado");
    }
    const refs = DOMRefs.refs;
    const images = carouselState.state[carouselState.imagesStateName];
    renderImages(
        images,
        refs.mainSwiperWrapper,
        refs.thumbsWrapper,
        (index) => handleDeleteImage(carouselState.state, index),
        () => refs.imageInput.click()
    );
    verifyCarouselBtns(refs.btnsCarousel, images);
};

export const resetCarousel = () => {
    if (!carouselState.state) return;
    const refs = DOMRefs.refs;
    const images = carouselState.state[carouselState.imagesStateName];
    images.length = 0;
    carouselState.state[carouselState.imagesToDeleteIdsStateName].length = 0;
    refs.mainSwiperWrapper.innerHTML = '';
    refs.thumbsWrapper.innerHTML = '';
    refs.imageInput.value = "";
    refs.mainSwiperWrapper.classList.remove("mainSwiperUsed");
    verifyCarouselBtns(refs.btnsCarousel, images);
};
