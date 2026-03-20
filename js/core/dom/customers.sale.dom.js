import { $, qs } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            loaderCustomers: $('loaderCustomers'),
            txtSearchData: $('txtSearchData'),
            cardContainer: qs('.cardContainer')
        };
        return this.refs;
    }
};

export const resetCustomerSaleFilters = (txtSearchData) => {
    txtSearchData.value = '';
};

const createSVG = (pathD, options = {}) => {
    const { strokeWidth = "2", className = "" } = options;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("viewBox", "0 0 24 24");
    if (className) svg.setAttribute("class", className);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-width", strokeWidth);
    path.setAttribute("d", pathD);

    svg.appendChild(path);
    return svg;
};

const createInfoRow = (svg, label, value) => {
    const icon = document.createElement("div");
    icon.className = "infoIcon";
    icon.appendChild(svg);

    const content = document.createElement("div");
    content.className = "infoContent";
    content.append(
        Object.assign(document.createElement("div"), { className: "infoLabel", textContent: label }),
        Object.assign(document.createElement("span"), { textContent: value })
    );
    const row = document.createElement("div");
    row.className = "customerInfoRow";
    row.append(icon, content);
    return row;
};
export const insertCustomers = (container, customers, type, idVehicle, newSparePart) => {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (customers.length === 0) {
        const div = document.createElement('div');
        div.textContent = 'No hay clientes disponibles.';
        div.classList.add('noDataMessage');
        fragment.appendChild(div);
    } else {
        customers.forEach((customer) => {
            const customerLink = document.createElement("a");
            customerLink.classList.add("customer");
            customerLink.dataset.customerId = customer.idCustomer;

            if (type === "sparePart") {
                const queryParams = new URLSearchParams({
                    idCustomer: customer.idCustomer,
                    customerName: customer.fullName,
                    sparePartId: newSparePart?.id,
                    sparePartName: newSparePart?.name,
                    suggestedPrice: newSparePart?.suggestedPrice,
                    isNewPart: newSparePart?.isNewPart
                });
                customerLink.href = `sparePartSale.html?${queryParams.toString()}`;
            } else if (type === "vehicle") {
                customerLink.href = `vehicleSale.html?idCustomer=${customer.idCustomer}&customerName=${encodeURIComponent(customer.fullName)}&idVehicle=${idVehicle}`;
            }

            const selectionIndicator = document.createElement("span");
            selectionIndicator.className = "selectionIndicator";
            selectionIndicator.appendChild(createSVG("M9 5l7 7-7 7", { strokeWidth: "3" }));

            const avatarContainer = document.createElement("div");
            avatarContainer.className = "customerAvatarContainer";
            avatarContainer.appendChild(createSVG("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", { className: "customerAvatar" }));

            const statusBadge = document.createElement("span");
            statusBadge.className = "statusBadge";
            statusBadge.textContent = customer.status === 'T' ? 'Activo' : 'Inactivo'; // fix bug anterior

            const customerStatus = document.createElement("div");
            customerStatus.className = "customerStatus";
            customerStatus.appendChild(statusBadge);

            const customerBody = document.createElement("div");
            customerBody.className = "customerBody";
            customerBody.append(
                Object.assign(document.createElement("h3"), { className: "customerName", textContent: customer.fullName }),
                createInfoRow(createSVG("M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"), "DUI", customer.dui),
                createInfoRow(createSVG("M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"), "Teléfono", customer.personalPhone)
            );

            customerLink.append(selectionIndicator, avatarContainer, customerStatus, customerBody);
            fragment.appendChild(customerLink);
        });
    }

    container.appendChild(fragment);
};

