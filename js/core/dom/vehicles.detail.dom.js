import { $, qs, qsa, setFormReadOnly, toggleModal } from "../../utils/dom.js";
import { vehicleDetailState } from "../state/vehicles.detail.state.js";

// core/logic/vehicles.upload.config.js
export const UPLOAD_CONFIG = {
    bill: {
        title: 'Añadir comprobante de la factura',
        desc: 'Sube el documento de la factura'
    },
    taxes: {
        title: 'Añadir comprobante de impuestos',
        desc: 'Sube el documento de impuestos'
    },
    ship: {
        title: 'Añadir comprobante de transporte',
        desc: 'Sube el documento del transporte'
    }
};


let mainSwiperInstance = null;
let thumbsSwiperInstance = null;

export function renderExternalMode(config) {
    const txtCosts = qsa('.costsData input');
    const btnImgs = qsa('.btnImgs');
    const groupCustomer = qs('.groupCustomer');
    const txtCustomer = $('txtCustomer');
    const txtTotal = $('txtTotal');

    setFormReadOnly('.costsData', config.readOnlyCosts);

    txtCosts.forEach(txt => {
        if (config.clearCosts) txt.value = '';
        config.costRequired
            ? txt.setAttribute('required', true)
            : txt.removeAttribute('required');
    });

    if (config.readOnlyCosts) txtTotal.value = '';

    btnImgs.forEach(btn =>
        btn.classList.toggle('hide', config.hideImages)
    );

    groupCustomer.classList.toggle('hide', !config.showCustomer);

    if (config.customerRequired) {
        txtCustomer.setAttribute('required', true);
    } else {
        txtCustomer.removeAttribute('required');
        txtCustomer.removeAttribute('data-id');
        txtCustomer.value = '';
    }
}

export function renderCustomersSuggestions(boxCustomer, customers, onSelect) {
    if (!boxCustomer) return;
    boxCustomer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    customers.forEach(customer => {
        const div = document.createElement('div');
        div.classList.add('suggestionItem');
        const name = document.createElement('span');
        const dui = document.createElement('span');
        name.textContent = customer.fullName;
        dui.textContent = `Dui: ${customer.dui}`
        div.append(name, dui);
        div.addEventListener('click', () => onSelect(customer));
        fragment.appendChild(div);
    });
    boxCustomer.appendChild(fragment);
    boxCustomer.classList.add("show");
    boxCustomer.classList.remove("hide");
}


export function renderImages(images, mainWrapper, thumbsWrapper, onDelete, onAddClick) {
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
        createPlusButton(thumbsWrapper, onAddClick);

        return;
    }

    images.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<img src="${img.url}" class="previewImg">`;
        mainWrapper.appendChild(slide);

        const thumb = document.createElement('div');
        thumb.className = 'swiper-slide thumb-box';
        thumb.innerHTML = `
            <img src="${img.url}">
            <div class="thumb-delete">×</div>
        `;

        thumb.querySelector('.thumb-delete')
            .addEventListener('click', e => {
                e.stopPropagation();
                onDelete(index);
            });

        thumbsWrapper.appendChild(thumb);
    });

    createPlusButton(thumbsWrapper, onAddClick);
    initSwipers();
}


function createPlusButton(wrapper, onAddClick) {
    const addThumb = document.createElement("div");
    addThumb.classList.add("swiper-slide", "thumb-add");
    addThumb.textContent = "+";
    addThumb.addEventListener("click", onAddClick);

    wrapper.appendChild(addThumb);
}

function initSwipers() {
    if (mainSwiperInstance) mainSwiperInstance.destroy(true, true);
    if (thumbsSwiperInstance) thumbsSwiperInstance.destroy(true, true);

    thumbsSwiperInstance = new Swiper("#thumbsSwiper", {
        slidesPerView: 4,
        spaceBetween: 10,
        watchSlidesProgress: true,
    });

    mainSwiperInstance = new Swiper("#mainSwiper", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        thumbs: {
            swiper: thumbsSwiper,
        },
        lazy: true,
    });
}

export function openUploadModal(type) {
    const modal = $('modalUpload');
    const title = $('uploadTitle');
    const config = UPLOAD_CONFIG[type];
    if (!config) return;

    vehicleDetailState.currentUploadType = type;
    if (vehicleDetailState.urls[type]) renderUploadPreview(vehicleDetailState.urls[type]);
    title.textContent = config.title;

    toggleModal(modal, true);
}

export function renderUploadPreview(source) {
    if (!source) return null;

    const dropArea = $("uploadDropArea");
    if (!dropArea) return null;

    dropArea.innerHTML = '';

    let src = null;

    // 🟢 Caso 1: File
    if (source instanceof File) {
        src = URL.createObjectURL(source);
    }

    // 🟢 Caso 2: URL
    else if (typeof source === 'string') {
        src = source;
    }
    if (!src) return null;

    const preview = document.createElement('div');
    preview.classList.add('uploadPreview');

    const img = document.createElement('img');
    img.src = src;
    img.classList.add('previewImg');
    img.alt = 'Imagen seleccionada';


    preview.appendChild(img);
    dropArea.appendChild(preview);
    return src;
}


export function closeAndCleanUpdateModal() {
    const modal = $('modalUpload');
    const dropArea = $('uploadDropArea');
    const inputFile = $('uploadFileInput');

    toggleModal(modal, false);

    // Limpiar input file
    if (inputFile) inputFile.value = '';

    // Reset visual del drop area
    if (dropArea) {
        dropArea.classList.remove('dragover');
        dropArea.innerHTML = `
            <div class="dropContent">
                <span class="dropIcon">☁️</span>
                <p id="uploadDropText">Arrastra el archivo aquí</p>
            </div>
        `;
    }

    // Importante: limpiar tipo actual
    vehicleDetailState.currentUploadType = null;
}
