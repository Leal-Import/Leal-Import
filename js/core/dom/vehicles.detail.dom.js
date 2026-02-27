import { $, disableElement, qs, qsa, removeDisable, setFormReadOnly, toggleModal } from "../../utils/dom.js";

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

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            previewImage: qs("#mainSwiper .previewImg"),
            mainSwiperWrapper: $("mainSwiperWrapper"),
            thumbsWrapper: $("thumbsWrapper"),
            frmVehicles: $("frmVehicles"),
            boxCustomer: $("suggestionsCustomer"),
            imageInput: $("imageInput"),
            isExternalOpt: $("isExternalOpt"),
            modalLinkLote: $("modalLinkLote"),
            uploadDropArea: $("uploadDropArea"),
            loaderSaveVehicle: $("loaderSaveVehicle"),
            txtCustomer: $("txtCustomer"),
            txtYear: $("txtYear"),
            btnCloseLink: qs("#modalLinkLote .btnClose"),
            typeAction: $("typeAction"),
            btnSaveData: $("btnSaveData"),
            txtCosts: qsa('.txtCosts, #txtSuggestedPrice'),
            btnImgs: qsa('.btnImgs'),
            groupCustomer: qs('.groupCustomer'),
            txtTotal: $('txtTotal'),
            defaultText: $("defaultText"),
            errorLinkLote: $("errorLinkLote"),
            validateUrlMessage: $("validateUrlMessage"),
            selectedCustomerText: $("selectedCustomerText"),
            txtLink: $("txtLink"),
            btnSaveLinkLote: $("btnSaveLinkLote"),
            txtFormat: qsa(".txtFormat"),
            btnLinkLote: qs(".btnLinkLote"),
            txtMileage: $("txtMileage")
        };

        return this.refs;
    }
};

export function loadDomData(typeAction, btnSaveData) {
    typeAction.textContent = "Actualizar vehiculo";
    btnSaveData.querySelector("span").textContent = "Actualizar"
}

let mainSwiperInstance = null;
let thumbsSwiperInstance = null;

export function renderExternalMode(config, txtCosts, btnImgs, groupCustomer, txtCustomer, txtTotal) {

    txtCosts.forEach(txt => {
        if (config.clearCosts) txt.value = '';
        if(config.costsRequired){
            txt.setAttribute('required', true);
            removeDisable(txt);
        } else {
            txt.removeAttribute('required');
            disableElement(txt);
        }
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
            swiper: thumbsSwiperInstance,
        },
        lazy: true,
    });
}

export function openUploadModal(type, state) {
    const modal = $('modalUpload');
    const title = $('uploadTitle');
    const config = UPLOAD_CONFIG[type];
    if (!config) return;

    state.currentUploadType = type;
    if (state.urls[type]) renderUploadPreview(state.urls[type]);
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


export function closeAndCleanUpdateModal(state) {
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
    state.currentUploadType = null;
}
