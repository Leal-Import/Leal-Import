import { $, toggleModal, qsa } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            txtCosts: qsa('.txtCosts'),
            txtTotal: $('txtTotalCost'),
            frmSpareParts: $('frmSpareParts'),
            placeholderMsg: $('placeholderMsg'),
            imgPart: $('imgPart'),
            dropArea: $('dropZone'),
            fileInput: $('fileInput'),
            loaderAddSparePart: $('loaderAddSparePart'),
            btnSaveSparePart: $('btnSaveSparePart')
        };

        return this.refs;
    }
};

export function loadUpdateInfo() {
    $("typeAction").textContent = "Actualizar repuesto";
    $("btnSaveSparePart").querySelector("span").textContent = "Actualizar";
    $("btnDeleteImg").classList.add("hide");
    $("btnAddImg").textContent = "Actualizar foto";
}

const LINK_CONFIG = {
    bill: {
        title: 'Agregar enlace de la factura',
        stateKey: 'bill'
    },
    tracking: {
        title: 'Agregar enlace del tracking',
        stateKey: 'tracking'
    }
};

export function openLinkModal(type, state) {
    const config = LINK_CONFIG[type];
    if (!config) return;

    state.currentLinkType = type;

    $('modalLinkTitle').textContent = config.title;
    $('txtLink').value = state.links?.[config.stateKey] || '';

    toggleModal($('modalLink'), true);
}

export function closeLinkModal(state) {
    toggleModal($('modalLink'), false);
    $('txtLink').value = '';
    console.log(state)
    state.currentLinkType = null;
}

export function saveLinkModal(state) {
    if (!state.currentLinkType) return;

    const value = $('txtLink').value.trim();
    const { stateKey } = LINK_CONFIG[state.currentLinkType];

    state.links[stateKey] = value;

    closeLinkModal(state);
}

export function loadImage(source) {
    if (!source) return;

    // 🔹 Caso 1: viene una URL (string)
    if (typeof source === "string") {
        imgPart.src = source;
        imgPart.style.display = "block";
        placeholderMsg.style.display = "none";
        return;
    }

    // 🔹 Caso 2: viene un File
    if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
            imgPart.src = reader.result;
            imgPart.style.display = "block";
            placeholderMsg.style.display = "none";
        };
        reader.readAsDataURL(source);
        return;
    }

    // 🔹 Caso 3: objeto con { file, url } (opcional / futuro)
    if (source?.file instanceof File) {
        loadImage(source.file);
        return;
    }

    if (source?.url) {
        loadImage(source.url);
        return;
    }

    console.warn("loadImage: tipo de fuente no soportado", source);
}