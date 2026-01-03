import { toggleModal } from "../../utils/dom.js";

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

    currentLinkType = type;

    $('modalLinkTitle').textContent = config.title;
    $('txtLink').value = vehicleDetailState.urls?.[config.stateKey] || '';

    toggleModal($('modalLink'), true);
}

export function closeLinkModal() {
    toggleModal($('modalLink'), false);
    $('txtLink').value = '';
    currentLinkType = null;
}

export function saveLinkModal() {
    if (!currentLinkType) return;

    const value = $('txtLink').value.trim();
    const { stateKey } = LINK_CONFIG[currentLinkType];

    vehicleDetailState.urls[stateKey] = value;

    closeLinkModal();
}

function loadImage(file) {
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
        imgPart.src = reader.result;
        imgPart.style.display = "block";
        placeholderMsg.style.display = "none";
    };
    reader.readAsDataURL(file);
}