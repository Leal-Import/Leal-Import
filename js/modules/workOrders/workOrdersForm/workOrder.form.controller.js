import { appendToDom, cleanRow, DOMRefs, initStaticRows, insertEmployees, loadExtraInputs, loadViewDom, loadViewSaleInfo, loadViewUpdateOrder, reindexTable, renderImportButton, renderServiceSuggestions, renderSparePartSuggestions, renderTotals, renderTotalsPanel, renderVehicleData, renderVehiclePrice, openServiceImageModal, renderPreview } from "./workOrder.form.dom.js";
import { resetWorkOrdersFormState, workOrdersFormState } from "./workOrder.form.state.js";
import { approveOrder, getDataVehicleById, getServices, getSpareParts, getWorkOrderById, completeWorkOrder, postWorkOrder, putWorkOrder, cancelWorkOrder } from "./workOrder.form.service.js";
import { safeParseFloat, validateDate } from "../../../utils/validators.js";
import { buildParams, cleanOneShotParams, disableElement, hideElement, qsa, removeDisable, showElement, showMessage, createModuleInitializer, toggleModal } from "../../../utils/dom.js";
import { DraftManager } from "../../../utils/draft.manager.js";
import { navigateTo, replaceTo, ROUTES } from "../../../utils/router.js";
import { initializeModalListeners } from "../../picsAmounts/picsAmount.controller.js";
import { initWorkOrdersEvents, initServiceImageModalEvents } from "./workOrder.form.event.js";
import { pushService, pushSparePart, hydrateContextFromURL, calculateWorkOrderTotals, validateOrder, buildOrderFormData } from "./workOrder.form.logic.js";
import { addNewPayment, initPaymentsController } from "../../payments/payments.controller.js";
import { createBtnUrl } from "../../picsAmounts/picAmounts.dom.js";
import { calculateTotals } from "../../../core/logic/calculate.totals.logic.js";
import { generateWorkOrderReport } from "../../../core/reports/workorders/workorders.report.js";
import { handleApiError } from "../../../utils/api.utils.js";
import { getActiveEmployees } from "../../employees/employees.service.js";
import { canAccess } from "../../../utils/privilegesValidator.js";

import { initCancelSale, saleCancelledUIUpdate } from "../../cancelSale/cancelSale.controller.js";
import { showFloatingMenu } from "../../../utils/floatingMenu.js";
import { generateServiceReport } from "../../../core/reports/workorders/workorderService.report.js";

// Centralizar manejo de borradores con DraftManager
const workOrderDraft = new DraftManager(workOrdersFormState.saleKey, {
    data: {},
    totals: {}
});

const addNewPartToTable = () => {
    if (!workOrdersFormState.context.idNewPart || !workOrdersFormState.context.newPartName) return;
    const normalizedPart = pushSparePart(workOrdersFormState.data.selectedSpareParts, {
        idSparePart: workOrdersFormState.context.idNewPart,
        sparePartName: workOrdersFormState.context.newPartName,
        priceApplied: workOrdersFormState.context.newPartSuggestedPrice
    });
    if (normalizedPart === null) return;
    appendToDom({
        tBody: DOMRefs.refs.tBodySpareParts,
        data: normalizedPart,
        arraySelected: workOrdersFormState.data.selectedSpareParts,
        arrayDelete: workOrdersFormState.data.sparePartsToDelete,
        onWritePrice,
        onDelete,
        renderButton: () => renderImportButton(DOMRefs.refs.tBodySpareParts, onImportSparePart, DOMRefs.refs.tBodyServices, DOMRefs.refs.tBodySpareParts),
        onClickCreatePerson
    });
};

const onWritePrice = (e, data) => {
    const value = safeParseFloat(e.target.textContent);
    data.priceApplied = value;
    calculateAllTotals();
};

const onAddService = (service) => {
    const normalizedService = pushService(workOrdersFormState.data.selectedServices, service);
    if (normalizedService === null) return;
    appendToDom({
        tBody: DOMRefs.refs.tBodyServices,
        data: normalizedService,
        arraySelected: workOrdersFormState.data.selectedServices,
        arrayDelete: workOrdersFormState.data.servicesToDelete,
        onWritePrice,
        onDelete,
        onClickCreatePerson,
        onActionsServices
    });

    DOMRefs.refs.txtAddService.value = '';
    reindexTable(DOMRefs.refs.tBodyServices);
    hideElement(DOMRefs.refs.boxServ);
    calculateAllTotals();
};

const onAddSparePart = (sparePart) => {
    const normalizedPart = pushSparePart(workOrdersFormState.data.selectedSpareParts, sparePart);
    if (normalizedPart === null) return;
    appendToDom({
        tBody: DOMRefs.refs.tBodySpareParts,
        data: normalizedPart,
        arraySelected: workOrdersFormState.data.selectedSpareParts,
        arrayDelete: workOrdersFormState.data.sparePartsToDelete,
        onWritePrice,
        onDelete,
        renderButton: () => renderImportButton(DOMRefs.refs.tBodySpareParts, onImportSparePart, DOMRefs.refs.tBodyServices, DOMRefs.refs.tBodySpareParts),
        onClickCreatePerson
    });

    DOMRefs.refs.txtSearchSparePart.value = '';
    reindexTable(DOMRefs.refs.tBodySpareParts);
    hideElement(DOMRefs.refs.boxSparePart);
    renderImportButton(DOMRefs.refs.tBodySpareParts, onImportSparePart, DOMRefs.refs.tBodyServices, DOMRefs.refs.tBodySpareParts);
    calculateAllTotals();
};

const onClickCreatePerson = async (itemName, arraySelected, id, cell) => {
    if (workOrdersFormState.context.isView) return;
    const itemSelected = arraySelected.find(i => i.id === id);
    if (itemSelected?.assignedEmployee) {
        workOrdersFormState.employeeContext.employeeSelected = {
            idEmployee: itemSelected.idEmployee,
            fullName: itemSelected.assignedEmployee
        };
    }
    toggleModal(DOMRefs.refs.modalPersonContainer, true);
    let employees;
    if (workOrdersFormState.employeeList.length > 0) {
        employees = workOrdersFormState.employeeList;
    } else {
        employees = await loadEmployees('');
    }
    insertEmployees(DOMRefs.refs.employeeList, employees, onSelectEmployee, workOrdersFormState.employeeContext.employeeSelected);
    DOMRefs.refs.modalPersonItemName.textContent = itemName;
    workOrdersFormState.employeeContext = {
        selectedArray: arraySelected,
        idItem: id,
        cell: cell,
        employeeSelected: {
            idEmployee: itemSelected.idEmployee,
            fullName: itemSelected.assignedEmployee
        }
    };
};

const onDelete = (item, arraySelected, arrayDelete, row, tBody, renderButton) => {
    const index = arraySelected.indexOf(item);
    if (index !== -1) {
        arraySelected.splice(index, 1);
    }

    if (item.idWorkOrderService || item.idWorkOrdersSpareParts) {
        arrayDelete.push(item.idWorkOrderService || item.idWorkOrdersSpareParts);
    }

    cleanRow(row);
    calculateAllTotals();
    reindexTable(tBody);
    renderButton?.(DOMRefs.refs.tBodySpareParts, onImportSparePart);
};
const onOpenServiceImageModal = (serviceId, imageType) => {
    // Obtener la imagen actual si existe
    const currentService = workOrdersFormState.data.selectedServices.find(s => s.idService === serviceId);
    const currentImages = currentService?.photos || [];
    const currentPhoto = currentImages.find(photo => String(photo.stage || photo.imageStage || '').toUpperCase() === imageType);
    const currentImage = currentPhoto ? (currentPhoto.photoUrl || currentPhoto.photo || null) : null;
    workOrdersFormState.currentServiceForImage = serviceId;
    workOrdersFormState.currentTypeForImage = imageType;
    // Abrir el modal
    openServiceImageModal(currentService.name, imageType, currentImage);
    if (workOrdersFormState.context.isView) {
        hideElement(DOMRefs.refs.btnSelectServiceImage);
        hideElement(DOMRefs.refs.btnDeleteServiceImage);
    }
};

// Callback para cuando se selecciona una imagen
const onSelectServiceImage = (e) => {
    const file = e.target.files[0];
    const serviceId = workOrdersFormState.currentServiceForImage;
    const imageType = workOrdersFormState.currentTypeForImage;
    if (!file) return;
    const service = workOrdersFormState.data.selectedServices.find(s => s.idService === serviceId);
    if (!service) return;

    const existingPhotoIndex = service.photos.findIndex(photo => String(photo.stage || photo.imageStage || '').toUpperCase() === imageType);
    const newObj = {
        stage: imageType,
        imageStage: imageType,
        photo: file
    };
    if (existingPhotoIndex >= 0) {
        service.photos[existingPhotoIndex] = newObj;
    } else {
        service.photos.push(newObj);
    }
    console.log(file);
    renderPreview(file, DOMRefs.refs);
};

const onSearchService = (e) => {
    onSearch(e, getServices, renderServiceSuggestions, DOMRefs.refs.boxServ, onAddService, workOrdersFormState.data.selectedServices);
};

const onSearchSpareParts = (e) => {
    onSearch(e, getSpareParts, renderSparePartSuggestions, DOMRefs.refs.boxSparePart, onAddSparePart, workOrdersFormState.data.selectedSpareParts);
};

const onSubmitOrder = async (e) => {
    e.preventDefault();
    const camps = qsa(".txtInputs, .btnPrimary, .btnTrash, .btnImport, .btnSecondary");
    const isEditing = !!workOrdersFormState.context.idWorkOrder;
    const errorValidate = validateOrder(
        workOrdersFormState.data,
        workOrdersFormState.context.idVehicle,
        workOrdersFormState.totals.total,
        !isEditing // requirePayment solo en POST
    );

    if (errorValidate) {
        showMessage('Error de validación', errorValidate, 'warning');
        return;
    }

    const fd = buildOrderFormData(workOrdersFormState, isEditing);

    showElement(DOMRefs.refs.loaderAddOrder);
    camps.forEach(disableElement);

    try {
        let response;
        if (workOrdersFormState.context.idWorkOrder) {
            response = await putWorkOrder(fd, workOrdersFormState.context.idWorkOrder);
            await showMessage('Orden actualizada', 'Éxito', 'success');
        } else {
            response = await postWorkOrder(fd, workOrdersFormState.context.idVehicle, workOrdersFormState.context.idSale);
            await showMessage('Orden registrada', 'Éxito', 'success');
        }

        if (response) {
            workOrderDraft.clear();
            DOMRefs.refs.frmWorkOrder.reset();
        }
        if (workOrdersFormState.context.idSale) {
            replaceTo(ROUTES.SALES, { id: workOrdersFormState.context.idSale });
        } else {
            const params = buildParams({
                idWorkOrder: response.idWorkOrder,
                idVehicle: workOrdersFormState.context.idVehicle,
                idCustomer: workOrdersFormState.context.idCustomer
            });
            replaceTo(ROUTES.WORK_ORDERS, Object.fromEntries(params.entries()));
        }
    } catch (error) {
        await handleApiError(error, 'No se pudo guardar la orden. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderAddOrder);
        camps.forEach(removeDisable);
    }
};

const onSaveNotes = (e) => {
    const value = e.target.value.trim() || '';
    workOrdersFormState.data.notes = value;
};

const onSaveDate = (e) => {
    const value = e.target.value || null;
    workOrdersFormState.data.estimatedDate = value;
};

const loadDataVehicle = async (Refs) => {
    try {
        const vehicle = await getDataVehicleById(workOrdersFormState.context.idVehicle);
        if (workOrdersFormState.context.idSale) {
            loadViewSaleInfo(vehicle.vin, Refs);
        } else if (workOrdersFormState.context.idWorkOrder) {
            loadViewUpdateOrder(vehicle.vin, Refs);
        }
        renderVehicleData(vehicle, Refs);
        renderVehiclePrice(workOrdersFormState.context.vehiclePrice, Refs.vehiclePrice);
    } catch (error) {
        await handleApiError(error, 'No se pudo cargar la información del vehículo. Por favor, inténtalo de nuevo.');
    }
};

const onImportSparePart = () => {
    workOrderDraft.save({
        data: workOrdersFormState.data,
        totals: workOrdersFormState.totals
    });
    const params = buildParams({
        workOrder: true,
        idWorkOrder: workOrdersFormState.context.idWorkOrder,
        idSale: workOrdersFormState.context.idSale,
        customerName: workOrdersFormState.context.customerName,
        idVehicle: workOrdersFormState.context.idVehicle,
        idCustomer: workOrdersFormState.context.idCustomer,
        totalPrice: workOrdersFormState.context.vehiclePrice
    });
    navigateTo(ROUTES.SPARE_PART_FORM, Object.fromEntries(params.entries()));
};

const recalculateTotalsPanel = () => {
    const items = [
        ...workOrdersFormState.data.selectedServices,
        ...workOrdersFormState.data.selectedSpareParts
    ];
    const { total, due } = calculateTotals({
        items,
        paid: workOrdersFormState.totals.totalPaid
    });
    workOrdersFormState.totals.total = total;
    workOrdersFormState.totals.due = due;
    renderTotalsPanel({ total, due, totalPaid: workOrdersFormState.totals.totalPaid }, DOMRefs.refs);
};

const calculateAllTotals = () => {
    const totals = calculateWorkOrderTotals({
        services: workOrdersFormState.data.selectedServices,
        spareParts: workOrdersFormState.data.selectedSpareParts,
        payments: workOrdersFormState.data.payments,
        vehiclePrice: workOrdersFormState.context.vehiclePrice
    });
    workOrdersFormState.totals.total = totals.total;
    workOrdersFormState.totals.due = totals.due;
    workOrdersFormState.totals.totalPaid = totals.totalPaid;
    renderTotals(totals, DOMRefs.refs);
};

/**
 * Carga datos de borrador guardados en localStorage
 * Restaura servicios, repuestos, pagos, notas y totales
 */
const loadDraftData = (Refs) => {
    const draft = workOrderDraft.load();
    if (!draft.data || Object.keys(draft.data).length === 0) return;

    try {
        workOrdersFormState.data.estimatedDate = draft.data?.estimatedDate || "";
        workOrdersFormState.data.notes = draft.data?.notes || "";
        workOrdersFormState.data.paymentsToDelete = draft.data?.paymentsToDelete || [];
        workOrdersFormState.data.sparePartsToDelete = draft.data?.sparePartsToDelete || [];
        workOrdersFormState.data.servicesToDelete = draft.data?.servicesToDelete || [];
        if (draft.totals) workOrdersFormState.totals = { ...workOrdersFormState.totals, ...draft.totals };

        loadExtraInputs(workOrdersFormState.data.notes, workOrdersFormState.data.estimatedDate, Refs);

        // Cargar spare parts
        (draft.data?.selectedSpareParts || []).forEach(part => {
            const normalizedPart = pushSparePart(workOrdersFormState.data.selectedSpareParts, part);
            if (normalizedPart === null) return;
            appendToDom({
                tBody: DOMRefs.refs.tBodySpareParts,
                data: normalizedPart,
                arraySelected: workOrdersFormState.data.selectedSpareParts,
                arrayDelete: workOrdersFormState.data.sparePartsToDelete,
                onWritePrice,
                onDelete,
                renderButton: () => renderImportButton(DOMRefs.refs.tBodySpareParts, onImportSparePart, DOMRefs.refs.tBodyServices, DOMRefs.refs.tBodySpareParts),
                onClickCreatePerson
            });
        });

        // Cargar servicios
        (draft.data?.selectedServices || []).forEach(service => {
            const normalizedService = pushService(workOrdersFormState.data.selectedServices, service);
            if (normalizedService === null) return;
            appendToDom({
                tBody: DOMRefs.refs.tBodyServices,
                data: normalizedService,
                arraySelected: workOrdersFormState.data.selectedServices,
                arrayDelete: workOrdersFormState.data.servicesToDelete,
                onWritePrice,
                onDelete,
                onClickCreatePerson,
                onActionsServices
            });
        });

        // Cargar pagos
        (draft.data?.payments || []).forEach(payment => {
            addNewPayment({
                state: workOrdersFormState.data,
                totals: workOrdersFormState.totals,
                payment
            });
        });
    } catch (error) {
        handleApiError(error, 'No se pudo cargar el borrador de la orden. Por favor, inténtalo de nuevo.');
    }
};

const loadWorkOrder = async (Refs) => {
    const workOrder = await getWorkOrderById(workOrdersFormState.context.idWorkOrder);
    workOrdersFormState.workOrder = workOrder;
    workOrdersFormState.context.idVehicle = workOrder.idVehicle;
    workOrdersFormState.data.estimatedDate = workOrder.estimatedDate || "";
    workOrdersFormState.data.notes = workOrder.notes || "";
    loadViewUpdateOrder(workOrder.vehicleInfo.vin, Refs);
    renderVehicleData(workOrder.vehicleInfo, Refs);
    loadExtraInputs(workOrdersFormState.data.notes, workOrdersFormState.data.estimatedDate, Refs);
    workOrder.workOrdersSpareParts.forEach(part => {
        const normalizedPart = pushSparePart(workOrdersFormState.data.selectedSpareParts, part);
        appendToDom({
            tBody: DOMRefs.refs.tBodySpareParts,
            data: normalizedPart,
            arraySelected: workOrdersFormState.data.selectedSpareParts,
            arrayDelete: workOrdersFormState.data.sparePartsToDelete,
            onWritePrice,
            onDelete,
            renderButton: () => renderImportButton(DOMRefs.refs.tBodySpareParts, onImportSparePart, DOMRefs.refs.tBodyServices, DOMRefs.refs.tBodySpareParts),
            isView: workOrdersFormState.context.isView,
            onClickCreatePerson
        });
    });
    workOrder.workOrdersServices.forEach(service => {
        const normalizedService = pushService(workOrdersFormState.data.selectedServices, service);
        appendToDom({
            tBody: DOMRefs.refs.tBodyServices,
            data: normalizedService,
            arraySelected: workOrdersFormState.data.selectedServices,
            arrayDelete: workOrdersFormState.data.servicesToDelete,
            onWritePrice,
            onDelete,
            isView: workOrdersFormState.context.isView,
            onClickCreatePerson,
            onActionsServices
        });
    });
    workOrder.workOrdersPayments.forEach(payment => {
        addNewPayment({
            state: workOrdersFormState.data,
            totals: workOrdersFormState.totals,
            payment
        });
    });

    if (workOrder.status === "Cancelada") {
        saleCancelledUIUpdate(workOrder.cancellationReason);
    }

    if (workOrder.status === "Espera de Aprobación") {
        if (canAccess(['WRITE_WORK_ORDERS'])) showElement(Refs.btnApproveOrder);
        hideElement(Refs.btnCompleteOrder);
    } else if (workOrder.status !== "Finalizada" && workOrder.status !== "Cancelada") {
        if (canAccess(['WRITE_WORK_ORDERS'])) showElement(Refs.btnCompleteOrder);
        hideElement(Refs.btnApproveOrder);
    }
};

const onPatchOrder = async (patchOrder, loader, succesWord, errorWord) => {
    const camps = qsa(".txtInputs, .btnPrimary, .btnTrash, .btnEdit, .btnImport, .btnSecondary");
    showElement(loader);
    camps.forEach(disableElement);
    try {
        const answer = await patchOrder(workOrdersFormState.context.idWorkOrder);
        await showMessage("Exito", `Orden ${succesWord}`, "success", true);
        if (answer) {
            const params = buildParams({
                idVehicle: workOrdersFormState.context.idVehicle,
                idCustomer: workOrdersFormState.context.idCustomer
            });
            replaceTo(ROUTES.WORK_ORDER_HISTORY, Object.fromEntries(params.entries()));
        }
    } catch (error) {
        await handleApiError(error, `No se pudo ${errorWord.toLowerCase()}. Por favor, inténtalo de nuevo.`);
    } finally {
        hideElement(loader);
        camps.forEach(removeDisable);
    }
};

const onApproveOrder = async () => {
    await onPatchOrder(approveOrder, DOMRefs.refs.loaderApproveOrder, 'aprobada', 'aprobar');
};

const onCompleteOrder = async () => {
    await onPatchOrder(completeWorkOrder, DOMRefs.refs.loaderCompleteOrder, 'completada', 'completar');
};

const loadEmployees = async (query) => {
    try {
        const employeesResponse = await getActiveEmployees(0, 10, query);
        workOrdersFormState.employeeList = employeesResponse.content || [];
        return workOrdersFormState.employeeList;
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los empleados. Por favor, inténtalo de nuevo.');
    }
};

const onSearchEmployee = async (e) => {
    const query = e.target.value.trim();
    let employees;
    if (workOrdersFormState.employeeList.length && query.length >= 3) {
        employees = workOrdersFormState.employeeList.filter(emp => emp.fullName.toLowerCase().includes(query.toLowerCase()));
    } else {
        employees = await loadEmployees(query);
    }
    insertEmployees(DOMRefs.refs.employeeList, employees, onSelectEmployee, workOrdersFormState.employeeContext.employeeSelected);
};

const onSelectEmployee = (employee) => {
    const { selectedArray, idItem, cell } = workOrdersFormState.employeeContext;
    // Encontrar y actualizar el objeto en arraySelected con el id coincidente
    const item = selectedArray.find(i => i.id === idItem);

    if (item) {
        item.idEmployee = employee.idEmployee;
        item.assignedEmployee = employee.fullName;
    }

    cell.querySelector('span').textContent = employee.fullName;
    // Cerrar el modal después de seleccionar
    onClosePersonModal();
};

const onSearch = async (e, getData, renderData, box, onAdd, selected) => {
    const query = e.target.value.trim();
    if (!query) {
        hideElement(box);
        return;
    }
    try {
        const res = await getData(query);
        renderData(selected, box, res.content || [], onAdd);
    } catch (err) { await handleApiError(err, 'No se pudieron cargar los datos. Por favor, inténtalo de nuevo.'); }
};

const onAddNewService = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (!val) return;
        onAddService({ idService: null, serviceName: val, priceApplied: 0 });
    }
};

// Funciones auxiliares para cada flujo
const initNewPartFlow = async (Refs) => {
    loadDraftData(Refs);
    addNewPartToTable();
    validateDate(Refs.dtEstimated, Refs.dtEstimated.value || new Date());
    await loadDataVehicle(Refs);
    workOrderDraft.clear();
};

const initEditOrderFlow = async (Refs) => {
    await loadWorkOrder(Refs);
    if (canAccess(['WRITE_WORK_ORDERS'])) showElement(Refs.btnOpenCancelSale);

    if (workOrdersFormState.context.isView) {
        loadViewDom(Refs);
        if (canAccess(['READ_WORK_ORDERS'])) showElement(Refs.btnGeneratePdf);
        hideElement(Refs.btnSaveOrder);
        hideElement(Refs.paymentForm);
        hideElement(Refs.txtSearchSparePart);
        hideElement(Refs.txtAddService);
    } else {
        validateDate(Refs.dtEstimated, Refs.dtEstimated.value || new Date());
    }
};

const initNewOrderFlow = async (Refs) => {
    await loadDataVehicle(Refs);
    validateDate(Refs.dtEstimated, new Date());
};

const onClosePersonModal = () => {
    toggleModal(DOMRefs.refs.modalPersonContainer, false);
    DOMRefs.refs.txtSearchEmployee.value = '';
    DOMRefs.refs.employeeList.innerHTML = '';
    // Limpiar el contexto del empleado para evitar estado residual
    workOrdersFormState.employeeContext = {};
};

const onCloseModalImageServices = () => {
    toggleModal(DOMRefs.refs.modalServiceImages, false);
    workOrdersFormState.currentServiceForImage = null;
    workOrdersFormState.currentTypeForImage = null;
};

const onActionsServices = (e, serviceData) => {
    e.stopPropagation();
    const serviceId = serviceData.idService;
    const servicePhotos = serviceData.photos || [];
    const hasPhoto = (stage) => servicePhotos.some(photo => String(photo.stage || photo.imageStage || '').toUpperCase() === stage);

    const buildOption = (stage, labelSuffix) => ({
        label: `Ver ${labelSuffix}`,
        onClick: () => onOpenServiceImageModal(serviceId, stage)
    });

    let options = [];

    if (workOrdersFormState.context.isView) {
        if (hasPhoto('BEFORE')) options.push(buildOption('BEFORE', 'Antes'));
        if (hasPhoto('DURING')) options.push(buildOption('DURING', 'Durante'));
        if (hasPhoto('AFTER')) options.push(buildOption('AFTER', 'Después'));
    } else {
        const labelForStage = (stage) => {
            const label = hasPhoto(stage) ? 'Ver' : 'Añadir';
            if (stage === 'BEFORE') return `${label} Antes`;
            if (stage === 'DURING') return `${label} Durante`;
            if (stage === 'AFTER') return `${label} Después`;
            return label;
        };

        options = [
            { label: labelForStage('BEFORE'), onClick: () => onOpenServiceImageModal(serviceId, 'BEFORE') },
            { label: labelForStage('DURING'), onClick: () => onOpenServiceImageModal(serviceId, 'DURING') },
            { label: labelForStage('AFTER'), onClick: () => onOpenServiceImageModal(serviceId, 'AFTER') }
        ];

    }
    if (serviceData.idWorkOrderService) {
        options.push({ label: 'Reporte de servicio', onClick: () => generateServiceReport(serviceData) });
    }

    if (options.length === 0) return;
    showFloatingMenu(e, options);
};

const onDeleteServiceImage = () => {
    const serviceId = workOrdersFormState.currentServiceForImage;
    const imageType = workOrdersFormState.currentTypeForImage;
    if (!serviceId || !imageType) return;
    const service = workOrdersFormState.data.selectedServices.find(s => s.idService === serviceId);
    if (!service) return;
    const existingPhotoIndex = service.photos.findIndex(photo => String(photo.stage || photo.imageStage || '').toUpperCase() === imageType);

    let photoIdToDelete = null;
    if (existingPhotoIndex >= 0) {
        photoIdToDelete = service.photos[existingPhotoIndex].idPhoto;
        service.photos.splice(existingPhotoIndex, 1);
    }

    if (service.idWorkOrderService && photoIdToDelete) {
        workOrdersFormState.data.servicePhotosToDelete.push(photoIdToDelete);
    }
    renderPreview(null, DOMRefs.refs);
};

const initializeUI = async (Refs) => {
    // Inicialización de componentes UI
    initStaticRows();

    await initPaymentsController({
        totalCalculator: recalculateTotalsPanel,
        onStateChange: null,
        createReceiptBtn: createBtnUrl,
        isView: workOrdersFormState.context.isView,
        state: workOrdersFormState
    });

    initWorkOrdersEvents({
        Refs,
        onSearchSpareParts,
        onSearchService,
        onSubmitOrder,
        onSaveNotes,
        onAddNewService,
        onSaveDate,
        onCompleteOrder,
        onClosePersonModal,
        onApproveOrder,
        onGeneratePdf: () => generateWorkOrderReport(workOrdersFormState.workOrder),
        onSearchEmployee
    });

    initializeModalListeners(workOrdersFormState.data, workOrdersFormState.context.isView);

    // Inicializar los event listeners del modal
    initServiceImageModalEvents({
        Refs,
        onImageSelect: onSelectServiceImage,
        onCloseModalImageServices,
        onDeleteServiceImage
    });

    if (workOrdersFormState.context.idWorkOrder) {
        initCancelSale(workOrdersFormState.context.idWorkOrder, cancelWorkOrder, ROUTES.WORK_ORDERS, "orden de trabajo");
    }
};

const loadDataFlow = async (Refs) => {
    const { context } = workOrdersFormState;

    // Determinar qué flujo ejecutar
    if (context.isNewPart) {
        await initNewPartFlow(Refs);
        const paramsToClean = ["isNewPart", "idNewPart", "newPartName", "newPartSuggestedPrice"];
        cleanOneShotParams(paramsToClean);
    } else if (context.idWorkOrder !== null) {
        await initEditOrderFlow(Refs);
    } else {
        await initNewOrderFlow(Refs);
    }

    // Renderizado condicional
    if (!context.isView) {
        renderImportButton(Refs.tBodySpareParts, onImportSparePart, Refs.tBodyServices, Refs.tBodySpareParts);
    }
};

const finalizeTotals = () => {
    calculateAllTotals();
    recalculateTotalsPanel();
};

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================

const init = createModuleInitializer({
    resetState: async () => {
        resetWorkOrdersFormState();
        const hydrated = await hydrateContextFromURL(workOrdersFormState);
        if (!hydrated) throw new Error('Failed to hydrate context');
    },
    initialize: initializeUI,
    load: async (refs) => {
        await loadDataFlow(refs);
        finalizeTotals();
    },
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
