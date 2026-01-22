import { $ } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";

export const loadStats = (data) => {
    $("finalized").textContent = data.statistics.finalized;
    $("pending").textContent = data.statistics.pending;
    $("delayed").textContent = data.statistics.delayed;
    $("totalOrdersQuantity").textContent = `$${formatWithCommas(data.statistics.totalBilled)}`;
}

export const loadVehicleInfo = (data) => {
    $("infoItem").textContent = `${data.vehicleInfo.brand} ${data.vehicleInfo.model} ${data.vehicleInfo.year}`;
    $("vin").textContent = data.vehicleInfo.vin;
}

export const insertWorkOrderHistory = (container, workOrders, onActions) => {
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

        actionButton.addEventListener("click", (e) => onActions(e, wo));

        tr.append(tdEmployee, tdCustomer, tdOrderDate, tdStatus, tdCost, tdDue, tdActions);

        fragment.appendChild(tr);
    });

    container.appendChild(fragment);
};