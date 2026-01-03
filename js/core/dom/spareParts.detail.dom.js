import { $, toggleModal } from "../../utils/dom.js";
import { sparePartDetailState } from "../state/spareParts.detail.state.js";

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

export function openLinkModal(type) {
    const config = LINK_CONFIG[type];
    if (!config) return;

    sparePartDetailState.currentLinkType = type;

    $('modalLinkTitle').textContent = config.title;
    $('txtLink').value = sparePartDetailState.links?.[config.stateKey] || '';

    toggleModal($('modalLink'), true);
}

export function closeLinkModal() {
    toggleModal($('modalLink'), false);
    $('txtLink').value = '';
    sparePartDetailState.currentLinkType = null;
}

export function saveLinkModal() {
    if (!sparePartDetailState.currentLinkType) return;

    const value = $('txtLink').value.trim();
    const { stateKey } = LINK_CONFIG[sparePartDetailState.currentLinkType];

    sparePartDetailState.links[stateKey] = value;

    closeLinkModal();
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
