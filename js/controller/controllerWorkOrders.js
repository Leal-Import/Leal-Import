import { getVehiclesWOrders, getWOStatus } from '../service/serviceWorkOrders.js'
import { createPagination } from '../pagination.js'
import { showMessage, fillSelect, initSession } from '../utils.js'

const txtSearch = document.getElementById("txtSearchData");
const cmbSearchByStatus = document.getElementById("cmbSearchByStatus");
let statusList = [];

let searchTimeout = null;
txtSearch.addEventListener("input", () => {
    filterData();
})

cmbSearchByStatus.addEventListener("change", () => {
    filterData();
})

let loadStatusSelect = async () => {
    try {
        const status = await getWOStatus();
        statusList = status;
        fillSelect('cmbSearchByStatus', statusList, 'idOrdersStatus', 'ordersStatus');
    } catch (error) {
        console.error('Error al cargar estados:', error);
    }
};

let filterData = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        pagination.update({
            page: 1,
            filters: {
                search: txtSearch.value.trim(),
                idStatus: cmbSearchByStatus.value
            }

        })
    }, 1500);
}

let loadWorkOrders = async ({ page, size, filters }) => {
    try {
        const data = await getVehiclesWOrders(page - 1, size, filters.search || '', filters.idStatus || '');
        insertWorkOrders(data.content)
        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1, // volvemos a 1-based
            size: data.page.size
        });
    } catch (error) {
        showMessage("Error", "No se pudieron cargar las ventas." + error, "error");
        console.error(error)
    }
}

const pagination = createPagination({ initialSize: 10, onChange: loadWorkOrders })

document.addEventListener("DOMContentLoaded", async () => {
    const user = await initSession();
    if(!user)return;
    
    await loadStatusSelect();
    pagination.update({});
})

let insertWorkOrders = (workOrders) => {
    const container = document.querySelector(".cardContainer");
    container.innerHTML = "";
    console.log(workOrders)

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
            } else if (workOrder.statusName === "Completado") {
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

            containerInfoVehicle.append(
                containerOrderStatus,
                clientItem,
                vinItem,
                dateItem
            );

            const moreInfoContainer = document.createElement("div");
            moreInfoContainer.classList.add("moreInfoContainer");

            const moreInfoText = document.createElement("div");
            moreInfoText.classList.add("moreInfoInfo");
            moreInfoText.textContent = "Ver más →";

            const btnView = document.createElement("a");
            btnView.classList.add("btnPrimary");
            btnView.textContent = "Ver más";
            btnView.href = `workOrderDetails.html?idVehicle=${workOrder.idVehicle}`;

            moreInfoContainer.append(moreInfoText, btnView);

            footerCard.append(vehicleName, containerInfoVehicle, moreInfoContainer);
            card.append(containerImgVehicle, footerCard);
            fragment.appendChild(card);
        });
    }

    container.appendChild(fragment);
};
