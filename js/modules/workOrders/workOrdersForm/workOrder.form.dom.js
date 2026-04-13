import { formatDecimalInput, formatWithCommas, formatOnFocus, formatOnBlur } from "../../../utils/formatters.js";
import { $, existsById, qs, qsa, showElement } from "../../../utils/dom.js";
import { ROUTES } from "../../../utils/router.js";
import { showFloatingMenu } from "../../../utils/floatingMenu.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            txtAmount: $("txtAmount"),
            cmbPaymentMethod: $("paymentMethod"),
            dtEstimated: $("dtEstimated"),
            boxServ: $("suggestionsService"),
            boxSparePart: $("suggestionsSpareParts"),
            txtSearchSparePart: $("txtSearchSparePart"),
            txtAddService: $("txtAddService"),
            loaderAddOrder: $("loaderAddOrder"),
            btnSaveOrder: $("btnSaveOrder"),
            btnAddPayment: $("btnAddPayment"),
            frmWorkOrder: $("frmWorkOrder"),
            txtNotes: $("txtNotes"),
            tBodySpareParts: $("tBodySpareParts"),
            tBodyServices: $("tBodyServices"),
            totalCost: $("totalCost"),
            totalRepairCost: $("totalRepairCost"),
            vehiclePrice: $("vehiclePrice"),
            totalValueSpareParts: $("totalValueSpareParts"),
            totalValueService: $("totalValueService"),
            totalOrder: $("totalOrder"),
            totalPaid: $("totalPaid"),
            due: $("due"),
            firstBread: $("firstBread"),
            secondBread: $("secondBread"),
            paymentForm: qs(".paymentForm"),
            year: $("year"),
            brand: $("brand"),
            model: $("model"),
            vin: $("vin"),
            txts: qsa(".rightColumn .txtInputs"),
            txtTotal: $("txtTotal"),
            btnCompleteOrder: $("btnCompleteOrder"),
            loaderCompleteOrder: $("loaderCompleteOrder"),
            btnGeneratePdf: $("btnGeneratePdf"),
            modalPersonContainer: $("modalPersonContainer"),
            modalPersonItemName: $("modalPersonItemName"),
            btnClosePersonModal: $("btnClosePersonModal"),
            employeeList: $("employeeList"),
            txtSearchEmployee: $("txtSearchEmployee"),
            btnApproveOrder: $("btnApproveOrder"),
            loaderApproveOrder: $("loaderApproveOrder"),
            btnOpenCancelSale: $("btnOpenCancelSale"),
            loaderCancelOrder: $("loaderCancelOrder"),
            // Modal de imágenes de servicios
            modalServiceImages: $("modalServiceImages"),
            btnCloseServiceImages: $("btnCloseServiceImages"),
            serviceImageTitle: $("serviceImageTitle"),
            serviceImageSubtitle: $("serviceImageSubtitle"),
            serviceImagePreview: $("serviceImagePreview"),
            serviceImageFileInput: $("serviceImageFileInput"),
            btnSelectServiceImage: $("btnSelectServiceImage"),
            btnCancelServiceImage: $("btnCancelServiceImage")
        };
        return this.refs;
    }
};

const SELECTORS = {
    TD_PERSON: '.tdPerson',
    TD_NAME: '.tdName',
    TD_PRICE: '.tdPrice',
    TD_IMAGES: '.tdImages',
    TD_TRASH: '.tdTrash',
    TBODY_DATA: '.tBodyData',
    BTN_IMPORT: '.btnImport',
    BTN_TRASH: '.btnTrash',
    BTN_SERVICE_IMAGES: '.btnServiceImages'
};

export const loadViewUpdateOrder = (vin, Refs) => {
    Refs.btnSaveOrder.querySelector("span").textContent = "Actualizar";
    Refs.firstBread.textContent = "Actualizar orden >";
    Refs.firstBread.href = ROUTES.WORK_ORDERS;
    Refs.secondBread.textContent = vin;
};

export const loadViewSaleInfo = (vin, Refs) => {
    Refs.firstBread.textContent = "Ventas >";
    Refs.firstBread.href = ROUTES.SALES;
    Refs.secondBread.textContent = vin;
};

export const renderVehicleData = (data, Refs) => {
    if (!data) return;
    if (Refs.vin) Refs.vin.textContent = data.vin || '-';
    if (Refs.model) Refs.model.textContent = data.model || '-';
    if (Refs.brand) Refs.brand.textContent = data.brand || '-';
    if (Refs.year) Refs.year.textContent = data.year || '-';
};

export const loadViewDom = (Refs) => {
    Refs.txts.forEach(txt => {
        txt.disabled = true;
    });
    Refs.firstBread.textContent = "Ver orden >";
};

const MIN_STATIC_ROWS = 7;
export const initStaticRows = () => {
    const tBodys = qsa(SELECTORS.TBODY_DATA);
    tBodys.forEach(tBody => {
        if (tBody.querySelectorAll('tr').length >= MIN_STATIC_ROWS) return;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < MIN_STATIC_ROWS; i++) {
            frag.appendChild(createEmptyRow());
        }
        tBody.appendChild(frag);
    });
};

export const renderSparePartSuggestions = (selectedSpareParts, boxSparePart, list, onAddSparePart) => {
    if (!boxSparePart) return;
    boxSparePart.innerHTML = '';
    list.forEach(p => {
        if (existsById(selectedSpareParts, p.idSpareParts, 'idSparePart')) return;
        const div = document.createElement('div');
        div.classList.add('suggestionItem');
        div.classList.add('suggestionPart');
        const containerImgName = document.createElement('div');
        containerImgName.classList.add('containerImgNameSuggest');
        const containerImg = document.createElement('div');
        containerImg.classList.add('containerImgSuggest');
        const img = document.createElement('img');
        const name = document.createElement('span');
        const suggestedPrice = document.createElement('span');
        img.src = p.imageUrl;
        name.textContent = p.nameSpareParts;
        suggestedPrice.textContent = formatWithCommas(p.suggestedPrice);
        containerImg.appendChild(img);
        containerImgName.append(containerImg, name);
        div.append(containerImgName, suggestedPrice);
        div.addEventListener('click', () => onAddSparePart(p));
        boxSparePart.appendChild(div);
    });
    showElement(boxSparePart);
};

export const renderServiceSuggestions = (selectedServices, boxServ, list, onAddService) => {
    if (!boxServ) return;
    boxServ.innerHTML = '';
    list.forEach(s => {
        if (existsById(selectedServices, s.idService, 'idService')) return;
        const div = document.createElement('div');
        div.className = 'suggestionItem';
        div.textContent = s.serviceName;
        div.addEventListener('click', () => onAddService(s));
        boxServ.appendChild(div);
    });
    showElement(boxServ);
};

const findOrCreateEmptyRow = (tBody) => {
    let emptyRow = [...tBody.querySelectorAll('tr')]
        .find(r => r.querySelector(SELECTORS.TD_NAME)?.textContent.trim() === '');

    if (!emptyRow) {
        emptyRow = createEmptyRow();
        tBody.appendChild(emptyRow);
    }

    return emptyRow;
};

const setupPriceCell = (priceCell, data, onWritePrice, isView) => {
    priceCell.textContent = formatWithCommas(data.priceApplied);
    priceCell.classList.add('finalPrice');

    if (!isView) {
        priceCell.setAttribute('contenteditable', 'true');
        formatDecimalInput(priceCell);
        priceCell.addEventListener('input', (e) => onWritePrice(e, data));
        priceCell.addEventListener('focus', formatOnFocus);
        priceCell.addEventListener('blur', formatOnBlur);
    }
};

const onCreateBtnPerson = (onClickCreatePerson, employeeName, itemName, arraySelected, id, cell) => {
    const span = document.createElement('span');
    span.classList.add('btnPerson');
    span.dataset.privilege = 'WRITE_WORK_ORDERS';
    span.textContent = employeeName ?? 'Agregar';
    span.addEventListener('click', () => onClickCreatePerson(itemName, arraySelected, id, cell));
    return span;
};

const getInitials = (fullName = '') => fullName.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

const createSelectEmployee = (employeeSelected) => {
    const item = document.createElement('div');
    item.className = 'employeeItem selected';
    item.dataset.id = employeeSelected.idEmployee;
    const avatar = document.createElement('div');
    avatar.className = 'employeeAvatar';
    avatar.textContent = getInitials(employeeSelected.fullName);
    const info = document.createElement('div');
    info.className = 'employeeInfo';
    const name = document.createElement('span');
    name.className = 'employeeName';
    name.textContent = employeeSelected.fullName;
    const role = document.createElement('span');
    role.className = 'employeeRole';
    role.textContent = employeeSelected.roleName;
    const check = document.createElement('div');
    check.className = 'employeeCheck on';
    check.id = `check-${employeeSelected.idEmployee}`;
    info.append(name, role);
    item.append(avatar, info, check);
    return item;
};

export const insertEmployees = (container, employees, onSelect, employeeSelected) => {
    if (!container) return;

    if (!employees.length) {
        container.innerHTML = `<p class="emptyEmployees">No se encontraron empleados</p>`;
        return;
    }

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    if (employeeSelected !== null && employeeSelected !== undefined) {
        fragment.appendChild(createSelectEmployee(employeeSelected));
    }

    employees.forEach(emp => {
        const alreadySelected = employeeSelected && emp.idEmployee === employeeSelected.idEmployee;
        if (alreadySelected) return;
        const item = document.createElement('div');
        item.className = 'employeeItem';
        item.dataset.id = emp.idEmployee;

        const avatar = document.createElement('div');
        avatar.className = 'employeeAvatar';
        avatar.textContent = getInitials(emp.fullName);

        const info = document.createElement('div');
        info.className = 'employeeInfo';

        const name = document.createElement('span');
        name.className = 'employeeName';
        name.textContent = emp.fullName;

        const role = document.createElement('span');
        role.className = 'employeeRole';
        role.textContent = emp.roleName;

        const check = document.createElement('div');
        check.className = 'employeeCheck';
        check.id = `check-${emp.idEmployee}`;

        info.append(name, role);
        item.append(avatar, info, check);

        item.addEventListener('click', () => {
            document.querySelectorAll('.employeeItem').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.employeeCheck').forEach(el => el.classList.remove('on'));
            item.classList.add('selected');
            check.classList.add('on');
            onSelect(emp);
        });

        fragment.appendChild(item);
    });
    container.appendChild(fragment);
};

export const appendToDom = ({
    tBody,
    data,
    arraySelected,
    arrayDelete,
    onWritePrice,
    onDelete,
    renderButton,
    isView,
    onClickCreatePerson,
    onServiceImages
}) => {
    if (!tBody) return false;

    const row = findOrCreateEmptyRow(tBody);
    if (!row) return false;

    const personCell = row.querySelector(SELECTORS.TD_PERSON);
    const nameCell = row.querySelector(SELECTORS.TD_NAME);
    const priceCell = row.querySelector(SELECTORS.TD_PRICE);
    const tdImages = row.querySelector(SELECTORS.TD_IMAGES);
    const tdTrash = row.querySelector(SELECTORS.TD_TRASH);

    const employeeName = onCreateBtnPerson(onClickCreatePerson, data.assignedEmployee, data.name, arraySelected, data.id, personCell);
    personCell.appendChild(employeeName);

    nameCell.textContent = data.name;
    setupPriceCell(priceCell, data, onWritePrice, isView);
    if (!isView) {
        // Botón para gestionar imágenes del servicio
        if (tdImages && onServiceImages) {
            const btnImages = createServiceImagesButton(data.id, onServiceImages);
            tdImages.appendChild(btnImages);
        }

        const btn = createTrashOption({
            row,
            item: data,
            arraySelected,
            arrayDelete,
            onDelete,
            renderButton,
            tBody
        });
        tdTrash.appendChild(btn);
    }

    return true;
};

export const createTrashOption = ({
    row,
    item,
    arraySelected,
    arrayDelete,
    onDelete,
    renderButton,
    tBody
}) => {
    const btn = document.createElement('button');
    btn.classList.add(SELECTORS.BTN_TRASH.slice(1));
    btn.dataset.privilege = 'WRITE_WORK_ORDERS';
    btn.type = 'button';
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
        </svg>
    `;

    btn.addEventListener('click', () => {
        onDelete(item, arraySelected, arrayDelete, row, tBody, renderButton);
        row.querySelector(SELECTORS.TD_PRICE).classList.remove("finalPrice");
    });

    return btn;
};

export const reindexTable = (tBody) => {
    if (!tBody) return;

    const rows = [...tBody.querySelectorAll('tr')];
    const active = [];
    const empty = [];

    rows.forEach(row => {
        const nameCell = row.querySelector(SELECTORS.TD_NAME);
        if (nameCell && nameCell.textContent.trim() !== '') {
            active.push(row);
        } else {
            empty.push(row);
        }
    });

    const desiredTotalRows = Math.max(active.length, MIN_STATIC_ROWS);
    const currentTotalRows = active.length + empty.length;
    const extraRows = currentTotalRows - desiredTotalRows;
    const rowsToKeep = [...active];

    if (extraRows > 0) {
        // Eliminar filas vacías sobrantes
        rowsToKeep.push(...empty.slice(0, empty.length - extraRows));
    } else {
        rowsToKeep.push(...empty);
    }

    const fragment = document.createDocumentFragment();
    rowsToKeep.forEach(row => fragment.appendChild(row));

    if (rowsToKeep.length < desiredTotalRows) {
        const missing = desiredTotalRows - rowsToKeep.length;
        for (let i = 0; i < missing; i++) {
            fragment.appendChild(createEmptyRow());
        }
    }

    tBody.innerHTML = '';
    tBody.appendChild(fragment);
};

export const renderImportButton = (tBody, onImport, tBodyServices, tBodySpareParts) => {
    if (!tBody) return;

    tBody.querySelectorAll(SELECTORS.BTN_IMPORT).forEach(b => b.remove());

    const rows = [...tBody.querySelectorAll('tr')];
    let targetRow = rows.find(r =>
        r.querySelector(SELECTORS.TD_NAME)?.textContent.trim() === '' && r.querySelector(SELECTORS.TD_PRICE)?.textContent.trim() === ''
    );

    if (!targetRow) {
        addRowToBothTables(tBodyServices, tBodySpareParts);
        targetRow = [...tBody.querySelectorAll('tr')]
            .find(r => r.querySelector(SELECTORS.TD_NAME)?.textContent.trim() === '' && r.querySelector(SELECTORS.TD_PRICE)?.textContent.trim() === '');
    }

    if (!targetRow) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add(SELECTORS.BTN_IMPORT.slice(1));
    btn.dataset.privilege = 'WRITE_WORK_ORDERS';
    btn.textContent = 'IMPORTAR';
    btn.addEventListener('click', onImport);

    targetRow.appendChild(btn);
};

export const renderTotalsPanel = ({ total, due, totalPaid }, Refs) => {
    if (Refs.totalPaid) {
        Refs.totalPaid.textContent = formatWithCommas(totalPaid);
    }
    if (Refs.due) {
        Refs.due.textContent = formatWithCommas(due);
    }
    if (Refs.totalOrder) {
        Refs.totalOrder.textContent = formatWithCommas(total);
    }
};

export const cleanRow = (row) => {
    const tdPerson = row.querySelector(SELECTORS.TD_PERSON);
    const tdName = row.querySelector(SELECTORS.TD_NAME);
    const tdPrice = row.querySelector(SELECTORS.TD_PRICE);
    const btnTrash = row.querySelector(SELECTORS.BTN_TRASH);

    tdPerson.textContent = "";
    tdName.textContent = "";
    tdPrice.textContent = "";
    tdPrice.removeAttribute("contenteditable");
    btnTrash.remove();
};

export const renderTotals = ({
    servicesTotal,
    sparePartsTotal,
    total,
    totalPaid,
    due,
    orderTotal
}, Refs) => {
    renderTotalServices(servicesTotal, Refs.totalValueService);
    renderTotalSpareParts(sparePartsTotal, Refs.totalValueSpareParts);
    renderTotalRepairCost(total, Refs.totalRepairCost, Refs.txtTotal);
    renderTotalsPanel({ total, due, totalPaid }, Refs);
    renderOrderTotal(orderTotal, Refs.totalCost);
};

export const renderTotalServices = (servicesTotal, spanTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(servicesTotal);
};

export const renderTotalSpareParts = (sparePartsTotal, spanTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(sparePartsTotal);
};

export const renderTotalRepairCost = (total, spanTotal, txtTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(total);
    if (txtTotal) txtTotal.value = formatWithCommas(total);
};

export const loadExtraInputs = (notes, date, Refs) => {
    if (Refs.dtEstimated) Refs.dtEstimated.value = date;
    if (Refs.txtNotes) Refs.txtNotes.value = notes || '';
};

export const renderOrderTotal = (orderTotal, spanTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(orderTotal);
};

export const renderVehiclePrice = (vehiclePrice, spanVehiclePrice) => {
    if (spanVehiclePrice) spanVehiclePrice.textContent = formatWithCommas(vehiclePrice) || 0.00;
};

const createEmptyRow = () => {
    const tr = document.createElement('tr');
    const tdPerson = document.createElement('td');
    tdPerson.classList.add(SELECTORS.TD_PERSON.slice(1));
    const tdName = document.createElement('td');
    tdName.classList.add(SELECTORS.TD_NAME.slice(1));
    const tdPrice = document.createElement('td');
    tdPrice.classList.add(SELECTORS.TD_PRICE.slice(1));
    const tdImages = document.createElement('td');
    tdImages.classList.add(SELECTORS.TD_IMAGES.slice(1));
    const tdTrash = document.createElement("td");
    tdTrash.classList.add(SELECTORS.TD_TRASH.slice(1));
    tr.append(tdPerson, tdName, tdPrice, tdImages, tdTrash);
    return tr;
};

export const addRowToBothTables = (tBodyServices, tBodySpareParts) => {
    if (tBodyServices) tBodyServices.appendChild(createEmptyRow());
    if (tBodySpareParts) tBodySpareParts.appendChild(createEmptyRow());
};

/**
 * Crea el botón flotante (3 puntitos) para gestionar imágenes del servicio
 */
const createServiceImagesButton = (serviceId, onServiceImages) => {
    const btn = document.createElement('button');
    btn.classList.add(SELECTORS.BTN_SERVICE_IMAGES.slice(1));
    btn.type = 'button';
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="19" r="2"/>
        </svg>
    `;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showFloatingMenu(e, [
            { label: 'Añadir Antes', onClick: () => onServiceImages(serviceId, 'BEFORE') },
            { label: 'Añadir Durante', onClick: () => onServiceImages(serviceId, 'DURING') },
            { label: 'Añadir Después', onClick: () => onServiceImages(serviceId, 'AFTER') }
        ]);
    });
    return btn;
};

/**
 * Abre el modal para seleccionar/cargar una imagen
 */
export const openServiceImageModal = (serviceId, type, currentImage, onImageSelect) => {
    const typeLabels = {
        before: 'Antes del servicio',
        during: 'Durante el servicio',
        after: 'Después del servicio'
    };

    const refs = DOMRefs.refs;

    // Actualizar títulos
    refs.serviceImageTitle.textContent = `Imagen - ${typeLabels[type] || type}`;
    refs.serviceImageSubtitle.textContent = `Carga una imagen del servicio - ${typeLabels[type]}`;

    // Limpiar y resetear preview
    refs.serviceImagePreview.innerHTML = '';
    if (currentImage) {
        const img = document.createElement('img');
        img.src = currentImage;
        img.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain;';
        refs.serviceImagePreview.appendChild(img);
    } else {
        const placeholder = document.createElement('p');
        placeholder.textContent = 'Sin imagen - Haz clic para seleccionar';
        placeholder.style.cssText = 'color: #999; text-align: center;';
        refs.serviceImagePreview.appendChild(placeholder);
    }

    // Resetear input file
    refs.serviceImageFileInput.value = '';

    // Event listeners
    const handlePreviewClick = () => refs.serviceImageFileInput.click();
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                refs.serviceImagePreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain;';
                refs.serviceImagePreview.appendChild(img);
                onImageSelect(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => closeServiceImageModal();
    const handleSelectBtn = () => refs.serviceImageFileInput.click();

    // Agregar listeners
    refs.serviceImagePreview.addEventListener('click', handlePreviewClick);
    refs.serviceImageFileInput.addEventListener('change', handleFileSelect);
    refs.btnCancelServiceImage.addEventListener('click', handleCancel);
    refs.btnSelectServiceImage.addEventListener('click', handleSelectBtn);
    refs.btnCloseServiceImages.addEventListener('click', handleCancel);

    // Mostrar modal
    refs.modalServiceImages.classList.remove('hide');

    // Guardar referencias de cleanup para usarlas después
    refs.modalServiceImages._cleanup = () => {
        refs.serviceImagePreview.removeEventListener('click', handlePreviewClick);
        refs.serviceImageFileInput.removeEventListener('change', handleFileSelect);
        refs.btnCancelServiceImage.removeEventListener('click', handleCancel);
        refs.btnSelectServiceImage.removeEventListener('click', handleSelectBtn);
        refs.btnCloseServiceImages.removeEventListener('click', handleCancel);
    };
};

export const closeServiceImageModal = () => {
    const modal = DOMRefs.refs.modalServiceImages;
    if (modal._cleanup) modal._cleanup();
    modal.classList.add('hide');
};
