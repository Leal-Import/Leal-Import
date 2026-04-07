import { $, buildParams, qs } from "../../utils/dom.js";
import { ROUTES } from "../../utils/router.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            cardContainer: qs('.cardContainer'),
            loaderWorkOrders: $('loaderWorkOrders'),
            txtSearchData: $('txtSearchData'),
            cmbSearchByStatus: $('cmbSearchByStatus'),
            fromDt: $('fromDt'),
            toDt: $('toDt')
        };

        return this.refs;
    }
};

export const resetWorkOrdersFilters = (refs) => {
    const { txtSearchData, cmbSearchByStatus, fromDt, toDt } = refs;
    txtSearchData.value = '';
    cmbSearchByStatus.value = '';
    fromDt.value = '';
    toDt.value = '';
};

export const insertWorkOrders = (container, workOrders) => {
    container.innerHTML = "";

    const fragment = document.createDocumentFragment();

    if (workOrders.length === 0) {
        const noData = document.createElement("div");
        noData.textContent = "No hay órdenes de trabajo";
        noData.classList.add("noDataMessage");
        fragment.appendChild(noData);
    } else {
        workOrders.forEach(workOrder => {
            const card = document.createElement("div");
            card.classList.add("card");

            const containerImgVehicle = document.createElement("div");
            containerImgVehicle.classList.add("containerImgVehicle");

            const img = document.createElement("img");
            img.src = workOrder.imageUrl || "";
            img.alt = `${workOrder.brand || 'Vehículo'} ${workOrder.model || ''}`.trim();

            containerImgVehicle.appendChild(img);

            const footerCard = document.createElement("div");
            footerCard.classList.add("footerCard");

            const vehicleName = document.createElement("span");
            vehicleName.classList.add("vehicleName", "truncate");
            vehicleName.textContent = `${workOrder.brand || 'Vehículo'} ${workOrder.model || ''}`.trim();

            const containerInfoVehicle = document.createElement("div");
            containerInfoVehicle.classList.add("containerInfoVehicle");

            const containerOrderStatus = document.createElement("div");
            containerOrderStatus.classList.add("containerOrderStatus");

            const orderColor = document.createElement("div");
            orderColor.classList.add("orderColor");

            const orderStatus = document.createElement("div");
            orderStatus.classList.add("orderStatus");

            if (workOrder.statusName === "Pendiente") {
                orderColor.classList.add("colorPending");
                orderStatus.classList.add("pendingOrder");
                orderStatus.textContent = "Pendiente";
            } else if (workOrder.statusName === "Finalizada") {
                orderColor.classList.add("colorCompleted");
                orderStatus.classList.add("completedOrder");
                orderStatus.textContent = "Finalizada";
            } else if (workOrder.statusName === "Cancelada") {
                orderColor.classList.add("colorCancelled");
                orderStatus.classList.add("cancelledOrder");
                orderStatus.textContent = "Cancelada";
            } else if (workOrder.statusName === "Retraso") {
                orderColor.classList.add("colorDelay");
                orderStatus.classList.add("delayOrder");
                orderStatus.textContent = "Retraso";
            } else if (workOrder.statusName === "Espera de Aprobación") {
                orderColor.classList.add("colorWaitingApproval");
                orderStatus.classList.add("waitingApprovalOrder");
                orderStatus.textContent = "Espera de Aprobación";
            }

            containerOrderStatus.append(orderColor, orderStatus);

            const clientItem = document.createElement("div");
            clientItem.classList.add("infoVehicleItem");
            if (!workOrder.customerName) {
                clientItem.innerHTML = `<div>Sin cliente asociado</div>`;
            } else {
                clientItem.innerHTML = `<div>Cliente:</div> <span class="truncate">${workOrder.customerName}</span>`;
            }

            const vinItem = document.createElement("div");
            vinItem.classList.add("infoVehicleItem");
            vinItem.innerHTML = `<div>Vin:</div> <span class="truncate">${workOrder.vin}</span>`;

            const dateItem = document.createElement("div");
            dateItem.classList.add("infoVehicleItem");
            dateItem.innerHTML = `<div>Ultima orden:</div> <span>${workOrder.orderDate}</span>`;

            containerInfoVehicle.append(containerOrderStatus, clientItem, vinItem, dateItem);

            const moreInfoContainer = document.createElement("div");
            moreInfoContainer.classList.add("moreInfoContainer");

            const moreInfoText = document.createElement("div");
            moreInfoText.classList.add("moreInfoInfo");
            moreInfoText.textContent = "Ver más →";

            const btnView = document.createElement("a");
            btnView.classList.add("btnPrimary");
            btnView.textContent = "Ver más";
            const params = buildParams({
                idVehicle: workOrder.idVehicle,
                idCustomer: workOrder.idCustomer,
                customerName: workOrder.customerName
            });
            btnView.href = `${ROUTES.WORK_ORDER_HISTORY}?${params.toString()}`;

            moreInfoContainer.append(moreInfoText, btnView);

            footerCard.append(vehicleName, containerInfoVehicle, moreInfoContainer);
            card.append(containerImgVehicle, footerCard);
            fragment.appendChild(card);
        });
    }

    container.appendChild(fragment);
};
