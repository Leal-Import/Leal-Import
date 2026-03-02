// vehicles.detail.dom.js

import { $, disableElement, qs, qsa, removeDisable, toggleModal } from "../../utils/dom.js";
import { initThumbsCarousel, verifyCarouselBtns } from "../dom/carousel.dom.js";

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
            txtCosts: qsa('.txtCosts'),
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
            txtMileage: $("txtMileage"),
            externalElements: qsa(".isExternalContainer > *"),
            txtSuggestedPrice: $("txtSuggestedPrice"),
            costsSection: $("costsSection"),
            btnsCarousel: qsa(".btnsCarousel"),
            modalUpload: $("modalUpload"),
            uploadTitle: $("uploadTitle")
        };

        return this.refs;
    }
};

export function loadDomData(typeAction, btnSaveData) {
    typeAction.textContent = "Actualizar vehiculo";
    btnSaveData.querySelector("span").textContent = "Actualizar"
}

export const verifyBtnsCarousel = (btnsCarousel, mainSwiperWrapper) => {
    verifyCarouselBtns(btnsCarousel, mainSwiperWrapper);
}

export function renderExternalMode(config, txtCosts, btnImgs, groupCustomer, txtCustomer, txtTotal) {
    txtCosts.push(DOMRefs.refs.txtSuggestedPrice);
    txtCosts.forEach(txt => {
        if (config.clearCosts) txt.value = '';
        if (config.costsRequired) {
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
                <div class="noImageContainer">
                    <div class="noImageIcon">📷</div>
                    <p>No hay imágenes disponibles</p>
                </div>
            </div>
        `;
        _createPlusButton(thumbsWrapper, onAddClick);
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
        thumb.querySelector('.thumb-delete').addEventListener('click', e => {
            e.stopPropagation();
            onDelete(index);
        });
        thumbsWrapper.appendChild(thumb);
    });

    _createPlusButton(thumbsWrapper, onAddClick);
    initThumbsCarousel("#mainSwiper", "#thumbsSwiper", { lazy: true }, { slidesPerView: 4 });
}

function _createPlusButton(wrapper, onAddClick) {
    const addThumb = document.createElement("div");
    addThumb.classList.add("swiper-slide", "thumb-add");
    addThumb.textContent = "+";
    addThumb.addEventListener("click", onAddClick);
    wrapper.appendChild(addThumb);
}

export function openUploadModal(type, state, modalUpload, uploadTitle, dropArea) {
    const config = UPLOAD_CONFIG[type];
    if (!config) return;

    state.currentUploadType = type;
    if (state.urls[type]) renderUploadPreview(state.urls[type], dropArea);
    uploadTitle.textContent = config.title;

    toggleModal(modalUpload, true);
}

export function renderUploadPreview(source, dropArea) {
    if (!source || !dropArea) return null;

    dropArea.innerHTML = '';

    let src = null;

    if (source instanceof File) {
        src = URL.createObjectURL(source);
    } else if (typeof source === 'string') {
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

export function closeAndCleanUpdateModal(Refs) {
    const dropArea = Refs.uploadDropArea;
    const inputFile = Refs.uploadFileInput;


    if (inputFile) inputFile.value = '';

    if (dropArea) {
        dropArea.classList.remove('dragover');
        dropArea.innerHTML = `
            <div class="dropContent">
                <span class="dropIcon">☁️</span>
                <p id="uploadDropText">Arrastra el archivo aquí</p>
            </div>
        `;
    }
}