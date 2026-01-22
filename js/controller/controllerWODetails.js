import { createPagination } from '../pagination.js'
import { showMessage } from '../utils.js';
import { getDetailsOrders, getDashboardWorkorder } from '../service/workOrder.history.service.js';
import { getWOStatus } from '../service/serviceWorkOrders.js';
import { formatWithCommas, showFloatingMenu, fillSelect, initSession } from '../utils.js';

const params = new URLSearchParams(window.location.search);
const txtSearchData = document.getElementById("txtSearchData");
const cmbFilterData = document.getElementById("cmbSearchByStatus");

const idVehicle = params.get("idVehicle") || null;
let searchTimeout = null;
let statusList = [];

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
    searchTimeout = setTimeout(() => {
        pagination.update({
            page: 1,
            filters: {
                search: txtSearchData.value.trim(),
                idStatus: cmbFilterData.value
            }
        })
    }, 1500)
}

txtSearchData.addEventListener("input", () => {
    filterData();
})

cmbFilterData.addEventListener("change", () => {
    filterData();
})

let loadWorkOrders = async ({ page, size, filters }) => {
    try {
        const data = await getDetailsOrders(idVehicle, page - 1, size, filters.search || '', filters.idStatus || '');
        insertWOrders(data.content);
        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1, // volvemos a 1-based
            size: data.page.size
        });
    } catch (error) {
        showMessage("Error", "No se pudieron cargar los vehículos." + error, "error");
        console.error(error)
    }
}

let loadDashboard = async () => {
    try {
        const data = await getDashboardWorkorder(idVehicle)
        loadStats(data);
        loadVehicleInfo(data);
    } catch (error) {
        showMessage("Error", "No se pudieron cargar las estadisticas de ordenes del vehiculo." + error, "error");
        console.error(error)
    }
}

let loadStats = (data) => {
    document.getElementById("finalized").textContent = data.statistics.finalized;
    document.getElementById("pending").textContent = data.statistics.pending;
    document.getElementById("delayed").textContent = data.statistics.delayed;
    document.getElementById("totalOrdersQuantity").textContent = `$${formatWithCommas(data.statistics.totalBilled)}`;
}

let loadVehicleInfo = (data) => {
    document.getElementById("infoItem").textContent = `${data.vehicleInfo.brand} ${data.vehicleInfo.model} ${data.vehicleInfo.year}`;
    document.getElementById("vin").textContent = data.vehicleInfo.vin;
}

const pagination = createPagination({ initialSize: 10, onChange: loadWorkOrders });

let loadAddLink = () => {
    document.getElementById("openModalCustomer").href = `addWorkOrder.html?idVehicle=${idVehicle}`
}

document.addEventListener("DOMContentLoaded", async () => {
    const user = await initSession();
    if (!user) return;
    loadAddLink();

    await loadStatusSelect();
    await loadDashboard();
    pagination.update({});
})

let insertWOrders = (workOrders) => {
    const container = document.getElementById("woDetailsTBody");
    if (!container) return;

    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    if (!workOrders || workOrders.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 7;
        td.textContent = "No hay órdenes de trabajo registradas";
        td.classList.add("no-data-message");
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);
        container.appendChild(fragment);
        document.querySelector(".table").style.height = "100%";
        return;
    }
    document.querySelector(".table").style.height = "fit-content";
    workOrders.forEach(wo => {
        const tr = document.createElement("tr");

        const tdEmployee = document.createElement("td");
        tdEmployee.textContent = wo.employeeName ?? "—";

        const tdCustomer = document.createElement("td");
        tdCustomer.textContent = wo.employeeName ?? "—";//Por el momento sale el empleado pero aca va el cliente

        const tdOrderDate = document.createElement("td");
        tdOrderDate.textContent = wo.estimatedDate;

        const tdStatus = document.createElement("td");
        const containerDtStatus = document.createElement("div");
        containerDtStatus.classList.add("containerDtStatus");
        const orderColor = document.createElement("div");
        orderColor.classList.add("orderColor", "orderColor");
        const statusBadge = document.createElement("span");
        statusBadge.textContent = wo.statusName;
        containerDtStatus.appendChild(orderColor);
        containerDtStatus.appendChild(statusBadge);
        tdStatus.appendChild(containerDtStatus)
        if (wo.statusName == "Pendiente") {
            orderColor.classList.add("colorPending");
            statusBadge.classList.add("pendingOrder");
        } else if (wo.statusName == "Completada") {
            orderColor.classList.add("colorCompleted");
            statusBadge.classList.add("completedOrder");
        } else {
            orderColor.classList.add("colorDelay");
            statusBadge.classList.add("delayOrder");
        }

        const tdCost = document.createElement("td");
        tdCost.textContent = `$${formatWithCommas(wo.repairCost)}`;

        const tdDue = document.createElement("td");
        tdDue.textContent = `$${formatWithCommas(wo.amountDue)}`;
        if (wo.amountDue > 0) tdDue.classList.add("textDanger");

        /* ACCIONES (MENÚ FLOTANTE) */
        const tdActions = document.createElement("td");
        const actionButton = document.createElement("button");

        actionButton.textContent = "⋯";
        actionButton.classList.add("actionButton");
        tdActions.appendChild(actionButton);

        const woId = wo.idWorkOrder ?? Math.random().toString(36).slice(2);

        actionButton.addEventListener("click", (e) => {
            e.stopPropagation();

            showFloatingMenu(e, [
                {
                    label: "Ver orden",
                    id: `btnViewWO-${woId}`,
                    onClick: () => viewWorkOrder(wo.idWorkOrder, wo.idVehicle)
                },
                {
                    label: "Editar orden",
                    id: `btnEditWO-${woId}`,
                    onClick: () => editWorkOrder(wo.idWorkOrder, wo.idVehicle)
                }
            ]);
        });

        tr.append(tdEmployee, tdCustomer, tdOrderDate, tdStatus, tdCost, tdDue, tdActions);

        fragment.appendChild(tr);
    });

    container.appendChild(fragment);
};

let viewWorkOrder = (idWorkOrder, idVehicle) => {
    window.location.href = `addWorkOrder.html?idWorkOrder=${idWorkOrder}&idVehicle=${idVehicle}&isView=true`;
}

let editWorkOrder = (idWorkOrder, idVehicle) => {
    window.location.href = `addWorkOrder.html?idWorkOrder=${idWorkOrder}&idVehicle=${idVehicle}`;
}
