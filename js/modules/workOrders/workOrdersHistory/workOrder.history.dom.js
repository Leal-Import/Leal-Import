import { $ } from "../../../utils/dom.js";
import { formatWithCommas } from "../../../utils/formatters.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            woDetailsTBody: $('woDetailsTBody'),
            loaderWorkOrders: $('loaderWorkOrders'),
            btnAddOrder: $('btnAddOrder'),
            txtSearchData: $('txtSearchData'),
            cmbSearchByStatus: $('cmbSearchByStatus'),
            infoItem: $('infoItem'),
            vin: $('vin'),
            finalized: $('finalized'),
            pending: $('pending'),
            delayed: $('delayed'),
            tableHistory: $('tableHistory')
        };

        return this.refs;
    }
};

export const resetWorkOrderHistoryFilters = (refs) => {
    const { txtSearchData, cmbSearchByStatus } = refs;
    txtSearchData.value = "";
    cmbSearchByStatus.value = "";
};

export const loadStats = (data, Refs) => {
    const { finalized, pending, delayed } = data.statistics;
    const { finalized: finalizedRef, pending: pendingRef, delayed: delayedRef } = Refs;
    finalizedRef.textContent = finalized;
    pendingRef.textContent = pending;
    delayedRef.textContent = delayed;
};

export const loadVehicleInfo = (data, Refs) => {
    const { brand, model, year, vin } = data.vehicleInfo;
    const { infoItem, vin: vinRef } = Refs;
    infoItem.textContent = `${brand} ${model} ${year}`;
    vinRef.textContent = vin;
};

export const insertWorkOrderHistory = (container, workOrders, onActions, tableHistory) => {
    if (!container || !tableHistory) return;

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
        tableHistory.style.height = "100%";
        return;
    }
    tableHistory.style.height = "fit-content";
    workOrders.forEach(wo => {
        const tr = document.createElement("tr");

        const tdEmployee = document.createElement("td");
        tdEmployee.textContent = wo.employeeName ?? "—";

        const tdCustomer = document.createElement("td");
        tdCustomer.textContent = wo.customerName ?? "Sin cliente";

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
        tdStatus.appendChild(containerDtStatus);
        if (wo.statusName === "Pendiente") {
            orderColor.classList.add("colorPending");
            statusBadge.classList.add("pendingOrder");
            statusBadge.textContent = "Pendiente";
        } else if (wo.statusName === "Finalizada") {
            orderColor.classList.add("colorCompleted");
            statusBadge.classList.add("completedOrder");
            statusBadge.textContent = "Finalizada";
        } else if (wo.statusName === "Cancelada") {
            orderColor.classList.add("colorCancelled");
            statusBadge.classList.add("cancelledOrder");
            statusBadge.textContent = "Cancelada";
        } else if (wo.statusName === "Retraso") {
            orderColor.classList.add("colorDelay");
            statusBadge.classList.add("delayOrder");
            statusBadge.textContent = "Retraso";
        } else if (wo.statusName === "Espera de Aprobación") {
            orderColor.classList.add("colorWaitingApproval");
            statusBadge.classList.add("waitingApprovalOrder");
            statusBadge.textContent = "Espera de Aprobación";
        }

        const tdCost = document.createElement("td");
        tdCost.textContent = formatWithCommas(wo.repairCost);

        const tdDue = document.createElement("td");
        tdDue.textContent = formatWithCommas(wo.amountDue);
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
