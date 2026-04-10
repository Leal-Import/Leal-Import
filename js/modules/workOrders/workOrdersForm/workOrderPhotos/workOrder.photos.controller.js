import { DOMRefs } from "../workOrder.form.dom.js";
import { toggleModal } from "../../../../utils/dom.js";
import { workOrderPhotosState, resetWorkOrderPhotosState } from "./workOrder.photos.state.js";
import { updateServicePhotoUI } from "./workOrder.photos.dom.js";

export const addPhotoToService = (file, service, stage) => {
    if (!service.photos) service.photos = {};
    if (!service.photos[stage]) service.photos[stage] = [];
    // Solo una foto por etapa
    service.photos[stage] = [file];
    updateServicePhotoUI(service);
};

export const removePhotoFromService = (service, index, stage) => {
    if (service.photos && service.photos[stage] && service.photos[stage][index]) {
        service.photos[stage].splice(index, 1);
        updateServicePhotoUI(service);
    }
};

export const openServicePhotoModal = (service, stage) => {
    workOrderPhotosState.modal.currentService = service;
    workOrderPhotosState.modal.currentStage = stage;
    workOrderPhotosState.modal.currentPhotoIndex = 0;
    workOrderPhotosState.modal.isOpen = true;

    // Actualizar título del modal
    DOMRefs.refs.servicePhotoName.textContent = service.name;
    DOMRefs.refs.servicePhotoStage.textContent = stage.charAt(0).toUpperCase() + stage.slice(1);

    const photos = service.photos?.[stage] || [];

    if (photos.length === 0) {
        // Mostrar estado vacío
        DOMRefs.refs.servicePhotoEmptyState.classList.remove('hide');
        DOMRefs.refs.servicePhotoPreview.classList.add('hide');
    } else {
        // Mostrar primera foto
        DOMRefs.refs.servicePhotoEmptyState.classList.add('hide');
        DOMRefs.refs.servicePhotoPreview.classList.remove('hide');
        showPhoto(photos[0]);
        updateNavigationButtons(photos.length);
    }

    toggleModal(DOMRefs.refs.modalServicePhotos, true);
};

const showPhoto = (photo) => {
    const img = DOMRefs.refs.servicePhotoImage;
    if (photo instanceof File) {
        img.src = URL.createObjectURL(photo);
    } else {
        img.src = photo;
    }
};

const updateNavigationButtons = (totalPhotos) => {
    const prevBtn = DOMRefs.refs.btnPrevPhoto;
    const nextBtn = DOMRefs.refs.btnNextPhoto;
    const counter = DOMRefs.refs.photoCounter;

    prevBtn.disabled = workOrderPhotosState.modal.currentPhotoIndex === 0;
    nextBtn.disabled = workOrderPhotosState.modal.currentPhotoIndex === totalPhotos - 1;
    counter.textContent = `${workOrderPhotosState.modal.currentPhotoIndex + 1} de ${totalPhotos}`;
};

export const navigatePhoto = (direction) => {
    const service = workOrderPhotosState.modal.currentService;
    const stage = workOrderPhotosState.modal.currentStage;
    const photos = service.photos?.[stage] || [];
    const newIndex = workOrderPhotosState.modal.currentPhotoIndex + direction;

    if (newIndex >= 0 && newIndex < photos.length) {
        workOrderPhotosState.modal.currentPhotoIndex = newIndex;
        showPhoto(photos[newIndex]);
        updateNavigationButtons(photos.length);
    }
};

export const removeCurrentPhoto = () => {
    const service = workOrderPhotosState.modal.currentService;
    const stage = workOrderPhotosState.modal.currentStage;
    const photos = service.photos?.[stage] || [];

    if (photos.length === 0) return;

    photos.splice(workOrderPhotosState.modal.currentPhotoIndex, 1);

    if (photos.length === 0) {
        // No hay más fotos, mostrar estado vacío
        DOMRefs.refs.servicePhotoEmptyState.classList.remove('hide');
        DOMRefs.refs.servicePhotoPreview.classList.add('hide');
    } else {
        // Ajustar índice si es necesario
        if (workOrderPhotosState.modal.currentPhotoIndex >= photos.length) {
            workOrderPhotosState.modal.currentPhotoIndex = photos.length - 1;
        }
        showPhoto(photos[workOrderPhotosState.modal.currentPhotoIndex]);
        updateNavigationButtons(photos.length);
    }

    updateServicePhotoUI(service);
};

export const addServicePhoto = () => {
    const input = DOMRefs.refs.servicePhotoFileInput;
    input.onchange = (e) => {
        const files = Array.from(e.target.files);
        const service = workOrderPhotosState.modal.currentService;
        const stage = workOrderPhotosState.modal.currentStage;

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                addPhotoToService(file, service, stage);
            }
        });

        // Reset input
        input.value = '';

        // Actualizar modal si estaba vacío
        const photos = service.photos?.[stage] || [];
        if (photos.length > 0) {
            DOMRefs.refs.servicePhotoEmptyState.classList.add('hide');
            DOMRefs.refs.servicePhotoPreview.classList.remove('hide');
            workOrderPhotosState.modal.currentPhotoIndex = photos.length - 1; // Mostrar la última foto agregada
            showPhoto(photos[workOrderPhotosState.modal.currentPhotoIndex]);
            updateNavigationButtons(photos.length);
        }
    };
    input.click();
};

export const closeServicePhotoModal = () => {
    toggleModal(DOMRefs.refs.modalServicePhotos, false);
    resetWorkOrderPhotosState();
};
