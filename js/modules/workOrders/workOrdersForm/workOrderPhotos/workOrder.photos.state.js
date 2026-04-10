// Estado específico para la gestión de fotos de servicios
export const workOrderPhotosState = {
    // Estado del modal de fotos
    modal: {
        isOpen: false,
        currentService: null,
        currentStage: null,
        currentPhotoIndex: 0
    },

    // Estado de carga y errores
    loading: {
        uploading: false,
        error: null
    }
};

export const resetWorkOrderPhotosState = () => {
    workOrderPhotosState.modal = {
        isOpen: false,
        currentService: null,
        currentStage: null,
        currentPhotoIndex: 0
    };
    workOrderPhotosState.loading = {
        uploading: false,
        error: null
    };
};
