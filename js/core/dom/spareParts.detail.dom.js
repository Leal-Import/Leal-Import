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
            btnSaveSparePart: $('btnSaveSparePart'),
            txtFormat: qsa('.txtFormat'),
            modalLink: $('modalLink'),
            btnSaveLink: $('btnSaveLink'),
            btnCloseLink: $('btnCloseLink'),
            btnOpenLinkBill: $('btnOpenLinkBill'),
            btnOpenLinkTracking: $('btnOpenLinkTracking'),
            typeAction: $('typeAction'),
            btnDeleteImg: $('btnDeleteImg'),
            btnAddImg: $('btnAddImg'),
            modalLinkTitle: $('modalLinkTitle'),
            txtLink: $('txtLink'),
            defaultText: $('defaultText'),
            errorLinkLote: $('errorLinkLote'),
            validateUrlMessage: $('validateUrlMessage'),
            camps: qsa('.txtInputs, .btnPrimary')
        };

        return this.refs;
    }
};

export const loadUpdateInfo = (Refs) => {
    Refs.typeAction.textContent = "Actualizar repuesto";
    Refs.btnSaveSparePart.querySelector("span").textContent = "Actualizar";
    Refs.btnDeleteImg.classList.add("hide");
    Refs.btnAddImg.textContent = "Actualizar foto";
};

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

export const openLinkModal = (type, state, Refs, onValidateUrl) => {
    const config = LINK_CONFIG[type];
    if (!config) return;

    state.currentLinkType = type;

    onValidateUrl?.(state.links?.[config.stateKey] || '');
    Refs.modalLinkTitle.textContent = config.title;
    Refs.txtLink.value = state.links?.[config.stateKey] || '';

    toggleModal(Refs.modalLink, true);
};

export const closeLinkModal = (state, Refs) => {
    toggleModal(Refs.modalLink, false);
    Refs.txtLink.value = '';
    state.currentLinkType = null;
};

export const saveLinkModal = (state, Refs) => {
    if (!state.currentLinkType) return;

    const value = Refs.txtLink.value.trim();
    const { stateKey } = LINK_CONFIG[state.currentLinkType];

    state.links[stateKey] = value;

    closeLinkModal(state, Refs);
};

export const loadImage = (source, Refs) => {
    if (!source) return;

    // 🔹 Caso 1: viene una URL (string)
    if (typeof source === "string") {
        Refs.imgPart.src = source;
        Refs.imgPart.style.display = "block";
        Refs.placeholderMsg.style.display = "none";
        return;
    }

    // 🔹 Caso 2: viene un File
    if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
            Refs.imgPart.src = reader.result;
            Refs.imgPart.style.display = "block";
            Refs.placeholderMsg.style.display = "none";
        };
        reader.readAsDataURL(source);
        return;
    }

    // 🔹 Caso 3: objeto con { file, url } (opcional / futuro)
    if (source?.file instanceof File) {
        loadImage(source.file, Refs);
        return;
    }

    if (source?.url) {
        loadImage(source.url, Refs);
        return;
    }

    console.warn("loadImage: tipo de fuente no soportado", source);
};
