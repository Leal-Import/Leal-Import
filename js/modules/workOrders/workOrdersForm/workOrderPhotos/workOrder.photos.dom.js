import { openServicePhotoModal } from "./workOrder.photos.controller.js";

// ============================================
// FUNCIONES PARA FOTOS DE SERVICIOS
// ============================================

export const createPhotoSections = (service) => {
    const container = document.createElement('div');
    container.className = 'service-photos';
    container.dataset.serviceId = service.id;

    // Solo una sección de foto por servicio
    const section = createPhotoSection(service);
    container.appendChild(section);

    return container;
};

const createPhotoSection = (service) => {
    const section = document.createElement('div');
    section.className = 'photo-section';

    const title = document.createElement('h5');
    title.textContent = 'Fotos del Servicio';
    section.appendChild(title);

    // Crear secciones para antes, durante, después
    const stages = ['antes', 'durante', 'después'];
    stages.forEach(stage => {
        const stageSection = createStageSection(service, stage);
        section.appendChild(stageSection);
    });

    return section;
};

const createStageSection = (service, stage) => {
    const stageDiv = document.createElement('div');
    stageDiv.className = 'stage-section';

    const stageTitle = document.createElement('h6');
    stageTitle.textContent = stage.charAt(0).toUpperCase() + stage.slice(1);
    stageDiv.appendChild(stageTitle);

    const photoGrid = createPhotoGrid(service.photos?.[stage] || [], service, stage);
    stageDiv.appendChild(photoGrid);

    return stageDiv;
};

const createPhotoGrid = (photos, service, stage) => {
    const grid = document.createElement('div');
    grid.className = 'photo-grid';

    // Mostrar fotos existentes (solo una)
    if (photos && photos.length > 0) {
        const photoItem = createPhotoItem(photos[0], service, 0, stage);
        grid.appendChild(photoItem);
    } else {
        // Botón para agregar nueva foto
        const addBtn = createAddPhotoBtn(service, stage);
        grid.appendChild(addBtn);
    }

    return grid;
};

const createPhotoItem = (photo, service, index, stage) => {
    const item = document.createElement('div');
    item.className = 'photo-item';

    const img = document.createElement('img');
    if (photo instanceof File) {
        img.src = URL.createObjectURL(photo);
    } else {
        img.src = photo;
    }
    img.addEventListener('click', () => openServicePhotoModal(service, stage));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove-photo';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removePhotoFromService(service, index, stage);
    });

    item.append(img, removeBtn);
    return item;
};

const createAddPhotoBtn = (service, stage) => {
    const btn = document.createElement('button');
    btn.className = 'btn-add-photo';
    btn.textContent = '+';
    btn.addEventListener('click', () => openServicePhotoModal(service, stage));
    return btn;
};

const removePhotoFromService = (service, index, stage) => {
    if (service.photos && service.photos[stage] && service.photos[stage][index]) {
        service.photos[stage].splice(index, 1);
        updateServicePhotoUI(service);
    }
};

export const updateServicePhotoUI = (service) => {
    const photoSection = document.querySelector(`[data-service-id="${service.id}"] .photo-section`);
    if (photoSection) {
        const photoGrid = createPhotoGrid(service.photos || [], service);
        const existingGrid = photoSection.querySelector('.photo-grid');
        if (existingGrid) {
            existingGrid.replaceWith(photoGrid);
        }
    }
};

export const getPhotoCount = (service) => {
    let count = 0;
    if (service.photos) {
        const stages = ['antes', 'durante', 'después'];
        stages.forEach(stage => {
            if (service.photos[stage]) {
                count += service.photos[stage].length;
            }
        });
    }
    return count > 0 ? `${count} foto${count > 1 ? 's' : ''}` : 'Sin foto';
};
