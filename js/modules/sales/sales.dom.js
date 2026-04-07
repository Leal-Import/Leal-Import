import { $, qsa, qs, buildParams } from "../../utils/dom.js";
import { ROUTES } from "../../utils/router.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            panelContainer: qs('.panelContainer'),
            loaderSales: $('loaderSales'),
            modalAskSale: $("modalAskSale"),
            txtSearchData: $("txtSearchData"),
            cmbSearchByStatus: $("cmbSearchByStatus"),
            containerFilterType: qs('.containerFilterType'),
            btnAskSale: $("btnAskSale"),
            btnCloseModalAsk: $("btnCloseModalAsk"),
            fromDt: $("fromDt"),
            toDt: $("toDt"),
            selectedLines: qsa(".filterType .lineSelected")
        };
        return this.refs;
    }
};

export const resetSalesFilters = (refs) => {
    const { txtSearchData, cmbSearchByStatus, btnAskSale, selectedLines, fromDt, toDt } = refs;
    txtSearchData.value = "";
    cmbSearchByStatus.value = "";
    fromDt.value = "";
    toDt.value = "";
    const hasNonDefaultSelected = selectedLines.some(line =>
        line.id !== "all" && line.querySelector(".lineSelected")?.classList.contains("selected")
    );
    if (hasNonDefaultSelected) selectLineButton(btnAskSale, selectedLines);
};

export const insertSales = (container, sales) => {
    if (!container) return;
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (sales.length === 0) {
        const noDataMessage = document.createElement("div");
        noDataMessage.textContent = "No hay ventas registradas";
        noDataMessage.classList.add("noDataMessage");
        fragment.appendChild(noDataMessage);
    } else {
        sales.forEach(sale => {
            const panel = document.createElement("div");
            panel.classList.add("panel");

            const containerImgSale = document.createElement("div");
            containerImgSale.classList.add("containerImgSale");

            const imgSaleItem = document.createElement("img");
            // Usar la URL de la imagen de la venta (ajustar la propiedad según tu objeto 'sale')
            imgSaleItem.src = sale.imageUrl || "url-imagen-por-defecto.jpg";
            imgSaleItem.alt = sale.nameVehicle || "Imagen del producto vendido";
            imgSaleItem.classList.add("imgSaleItem");

            containerImgSale.appendChild(imgSaleItem);

            // --- 3. Contenedor de Datos de Venta (Principal) ---
            const dataSaleContainer = document.createElement("div");
            dataSaleContainer.classList.add("dataSaleContainer");

            // --- 4. Lado Izquierdo (Datos Principales) ---
            const leftDataSale = document.createElement("div");
            leftDataSale.classList.add("leftDataSale");

            // Header
            const headerDataSale = document.createElement("div");
            headerDataSale.classList.add("headerDataSale");

            const productData = document.createElement("div");
            productData.classList.add("dataSale", "productData");
            const nameVehicle = document.createElement("span");
            nameVehicle.classList.add("nameVehicle");
            nameVehicle.textContent = sale.productName || "Producto Desconocido"; // Nombre del Vehículo/Producto
            productData.appendChild(nameVehicle);

            if (sale.productType === "SparePart" && sale.extraPartsCount > 0) {
                const moreParts = document.createElement("span");
                moreParts.textContent = `+ ${sale.extraPartsCount} Repuestos`;
                moreParts.classList.add("moreParts");
                productData.appendChild(moreParts);
            }

            const dateDataSale = document.createElement("div");
            dateDataSale.classList.add("dataSale");
            const lblDate = document.createElement("span");
            lblDate.classList.add("lbl");
            lblDate.textContent = "Fecha de venta:";
            const dateSpan = document.createElement("span");
            dateSpan.textContent = sale.saleDate || "N/A"; // Fecha de Venta
            dateDataSale.append(lblDate, dateSpan);

            headerDataSale.append(productData, dateDataSale);

            // Body
            const bodyDataSale = document.createElement("div");
            bodyDataSale.classList.add("bodyDataSale");

            const downLeft = document.createElement("div");
            downLeft.classList.add("downLeft");

            const typeSale = document.createElement("div");
            typeSale.classList.add("typeSale");
            if (sale.productType === "Vehicle") {
                // VIN
                const vinDataSale = document.createElement("div");
                vinDataSale.classList.add("dataSale");
                const lblVin = document.createElement("span");
                lblVin.classList.add("lbl");
                lblVin.textContent = "Vin:";
                const vinSpan = document.createElement("span");
                vinSpan.textContent = sale.vin || "N/A"; // VIN
                vinSpan.classList.add("truncate");
                vinDataSale.append(lblVin, vinSpan);
                downLeft.appendChild(vinDataSale);
                typeSale.textContent = "V";
                typeSale.classList.add("vehicleType");
            } else {
                typeSale.textContent = "R";
                typeSale.classList.add("partType");
            }

            // Vendedor
            const sellerDataSale = document.createElement("div");
            sellerDataSale.classList.add("dataSale");
            const lblSeller = document.createElement("span");
            lblSeller.classList.add("lbl");
            lblSeller.textContent = "Vendedor:";
            const sellerSpan = document.createElement("span");
            sellerSpan.textContent = sale.employeeName || "N/A"; // Vendedor
            sellerSpan.classList.add("truncate");
            sellerDataSale.append(lblSeller, sellerSpan);

            // Cliente
            const customerDataSale = document.createElement("div");
            customerDataSale.classList.add("dataSale");
            const lblCustomer = document.createElement("span");
            lblCustomer.classList.add("lbl");
            lblCustomer.textContent = "Cliente:";
            const customerSpan = document.createElement("span");
            customerSpan.textContent = sale.customerName || "N/A"; // Cliente
            customerSpan.classList.add("truncate");
            customerDataSale.append(lblCustomer, customerSpan);

            downLeft.append(sellerDataSale, customerDataSale);
            bodyDataSale.appendChild(downLeft);

            leftDataSale.append(headerDataSale, bodyDataSale);

            // --- 5. Lado Derecho (Montos y Botones) ---
            const rightDataSale = document.createElement("div");
            rightDataSale.classList.add("rightDataSale");

            // Monto Total
            const totalAmountData = document.createElement("div");
            totalAmountData.classList.add("dataSale", "amount");
            const lblTotal = document.createElement("span");
            lblTotal.classList.add("lbl");
            lblTotal.textContent = "Monto total:";
            const totalSpan = document.createElement("span");
            totalSpan.classList.add("amountQuantity");
            totalSpan.textContent = sale.totalAmount !== null ? `$${sale.totalAmount.toLocaleString('es-SV')}` : "$N/A";
            totalAmountData.append(lblTotal, totalSpan);

            const statusSale = document.createElement("div");
            statusSale.classList.add("saleBadge");
            statusSale.textContent = sale.stateName || "N/A";
            if (sale.stateName === "Cancelada") {
                statusSale.classList.add("cancelled");
            } else if (sale.stateName === "Completada") {
                statusSale.classList.add("completed");
            } else if (sale.stateName === "Pendiente") {
                statusSale.classList.add("pending");
            } else if (sale.stateName === "Reservado") {
                statusSale.classList.add("reserved");
            }

            // Deuda
            const amountDueData = document.createElement("div");
            amountDueData.classList.add("dataSale", "amountDue");
            const lblDue = document.createElement("span");
            lblDue.classList.add("lbl");
            lblDue.textContent = "Deuda:";
            const dueSpan = document.createElement("span");
            dueSpan.textContent = sale.amountDue !== null ? `$${sale.amountDue.toLocaleString('es-SV')}` : "$N/A";
            amountDueData.append(lblDue, dueSpan);

            // Contenedor de Botones
            const containerButtonsData = document.createElement("div");
            containerButtonsData.classList.add("containerButtonsData");

            // Botón "Ver mas"
            const btnView = document.createElement("a");
            btnView.classList.add("btnSecondary");
            btnView.textContent = "Ver mas";

            // Botón "Editar"
            let btnEdit;
            if (sale.stateName !== "Cancelada") {
                btnEdit = document.createElement("a");
                btnEdit.classList.add("btnPrimary");
                btnEdit.textContent = "Editar";
                btnEdit.setAttribute("data-privilege", "WRITE_SALES");
            }
            const params = buildParams({
                idCustomer: sale.idCustomer,
                customerName: sale.customerName,
                idVehicle: sale.idVehicle,
                idSale: sale.idSale
            });
            if (sale.productType === "Vehicle") {
                if (btnEdit) btnEdit.href = `${ROUTES.VEHICLE_SALE}?${params.toString()}`;
                btnView.href = `${ROUTES.VEHICLE_SALE}?${params.toString()}&isView=true`;
            } else {
                if (btnEdit) btnEdit.href = `${ROUTES.SPARE_PART_SALE}?${params.toString()}`;
                btnView.href = `${ROUTES.SPARE_PART_SALE}?${params.toString()}&isView=true`;
            }

            containerButtonsData.appendChild(btnView);
            if (btnEdit) {
                containerButtonsData.appendChild(btnEdit);
            }

            rightDataSale.append(totalAmountData, amountDueData, containerButtonsData, statusSale);

            // --- 6. Ensamblar el Panel ---
            dataSaleContainer.append(leftDataSale, rightDataSale);
            panel.append(containerImgSale, dataSaleContainer, typeSale);

            fragment.appendChild(panel);
        });

    }
    container.appendChild(fragment);
};

export const selectLineButton = (filterBtn, selectedLines) => {
    selectedLines.forEach(l => l.classList.remove("selected"));
    filterBtn.querySelector(".lineSelected")?.classList.add("selected");
};
