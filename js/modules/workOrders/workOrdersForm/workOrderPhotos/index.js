// Módulo de fotos de servicios para órdenes de trabajo
// Arquitectura modular siguiendo el patrón MVC

export { workOrderPhotosState, resetWorkOrderPhotosState } from './workOrder.photos.state.js';
export { createPhotoSections, getPhotoCount } from './workOrder.photos.dom.js';
export {
    addPhotoToService,
    removePhotoFromService,
    openServicePhotoModal,
    navigatePhoto,
    removeCurrentPhoto,
    addServicePhoto,
    closeServicePhotoModal
} from './workOrder.photos.controller.js';
