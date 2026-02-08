import { $, qs } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            cardContainer: qs('.cardContainer'),
            loaderWorkOrders: $('loaderWorkOrders'),
        };

        return this.refs;
    }
};

export let insertWorkOrders = (container, workOrders) => {
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
            img.alt = `${workOrder.brand} ${workOrder.model}` || "Vehículo";

            containerImgVehicle.appendChild(img);

            const footerCard = document.createElement("div");
            footerCard.classList.add("footerCard");

            const vehicleName = document.createElement("span");
            vehicleName.classList.add("vehicleName");
            vehicleName.textContent = `${workOrder.brand} ${workOrder.model}` || "Vehículo";

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
            } else if (workOrder.statusName === "Completada") {
                orderColor.classList.add("colorCompleted");
                orderStatus.classList.add("completedOrder");
                orderStatus.textContent = "Completada";
            } else {
                orderColor.classList.add("colorDelay");
                orderStatus.classList.add("delayOrder");
                orderStatus.textContent = "Retraso";
            }

            containerOrderStatus.append(orderColor, orderStatus);

            const clientItem = document.createElement("div");
            clientItem.classList.add("infoVehicleItem");
            if (!workOrder.customerName) {
                clientItem.innerHTML = `<div>Sin cliente asociado</div>`;
            } else {
                clientItem.innerHTML = `<div>Cliente:</div> <span>${workOrder.customerName}</span>`;
            }

            const vinItem = document.createElement("div");
            vinItem.classList.add("infoVehicleItem");
            vinItem.innerHTML = `<div>Vin:</div> <span>${workOrder.vin}</span>`;

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
            btnView.href = `workOrderDetails.html?idVehicle=${workOrder.idVehicle}&idCustomer=${workOrder.idCustomer}&customerName=${workOrder.customerName}`;

            moreInfoContainer.append(moreInfoText, btnView);

            footerCard.append(vehicleName, containerInfoVehicle, moreInfoContainer);
            card.append(containerImgVehicle, footerCard);
            fragment.appendChild(card);
        });
    }

    container.appendChild(fragment);
};
