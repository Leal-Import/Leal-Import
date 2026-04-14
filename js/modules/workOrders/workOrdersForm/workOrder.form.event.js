import { addModalCloseEvents, debounce } from "../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initWorkOrdersEvents = ({
    Refs,
    onSearchSpareParts,
    onSearchService,
    onSubmitOrder,
    onSaveNotes,
    onSaveDate,
    onAddNewService,
    onCompleteOrder,
    onGeneratePdf,
    onClosePersonModal,
    onSearchEmployee,
    onApproveOrder
}) => {
    const { txtAmount, txtSearchSparePart, txtAddService, txtNotes, frmWorkOrder, dtEstimated, btnCompleteOrder, btnGeneratePdf, btnClosePersonModal, modalPersonContainer, txtSearchEmployee, btnApproveOrder } = Refs;

    const search = debounce((e, onSearch) => {
        const value = e.target.value;
        onSearch({ target: { value } });
    }, 1000);

    const searchEmployee = debounce((e) => {
        const query = e.target.value.trim();
        onSearchEmployee({ target: { value: query } });
    }, 1000);

    txtSearchEmployee.addEventListener("input", searchEmployee);

    addModalCloseEvents(modalPersonContainer, onClosePersonModal);
    btnClosePersonModal.addEventListener("click", onClosePersonModal);

    txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
    txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
    formatDecimalInput(txtAmount);

    txtSearchSparePart.addEventListener("input", (e) =>
        search(e, onSearchSpareParts)
    );

    txtAddService.addEventListener("input", (e) =>
        search(e, onSearchService)
    );
    txtAddService.addEventListener("keydown", onAddNewService);

    txtNotes.addEventListener("input", onSaveNotes);

    frmWorkOrder.addEventListener("submit", onSubmitOrder);

    dtEstimated.addEventListener("change", onSaveDate);

    btnCompleteOrder.addEventListener("click", onCompleteOrder);
    btnApproveOrder.addEventListener("click", onApproveOrder);

    btnGeneratePdf?.addEventListener("click", onGeneratePdf);
};

/**
 * Inicializa los listeners del modal de imágenes de servicio
 */
export const initServiceImageModalEvents = ({ Refs, onImageSelect, onDeleteServiceImage, onCloseModalImageServices }) => {
    const { serviceImagePreview, serviceImageFileInput, btnDeleteServiceImage, btnSelectServiceImage, btnCloseServiceImages, modalServiceImages } = Refs;
    const onClickAddImage = () => serviceImageFileInput.click();

    addModalCloseEvents(modalServiceImages, onCloseModalImageServices);
    // Agregar listeners
    serviceImagePreview.addEventListener('click', onClickAddImage);
    btnSelectServiceImage.addEventListener('click', onClickAddImage);
    serviceImageFileInput.addEventListener('change', onImageSelect);
    btnDeleteServiceImage.addEventListener('click', onDeleteServiceImage);
    btnCloseServiceImages.addEventListener('click', onCloseModalImageServices);
};
