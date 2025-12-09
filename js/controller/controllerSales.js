import { setupModal } from '../utils.js'
import { getSales } from '../service/serviceSales.js'

setupModal("#btnAskSale", "#modalAskSale", "#btnCloseModalAsk", null, "¿Que deseas vender?");

const filterLinesButtons = document.querySelectorAll(".filterType");

document.addEventListener("DOMContentLoaded", async () => {
    filterLinesButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            filterLinesButtons.forEach(btn => {
                btn.querySelector(".lineSelected").classList.remove("selected");
            });
            button.querySelector(".lineSelected").classList.add("selected");
        })
    });
    await loadSales();
});

let loadSales = async () => {
    const sales = await getSales();
    insertSales(sales.content)
}

let insertSales = (sales) => {
    console.log(sales)
    const container = document.querySelector(".panelContainer");
    const fragment = document.createDocumentFragment();
    container.innerHTML = "";
    if (sales.length === 0) {
        const noDataMessage = document.createElement("div");
        noDataMessage.textContent = "No hay ventas registradas";
        noDataMessage.classList.add("noDataMessage");
        fragment.appendChild(noDataMessage)
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

            if (sale.productType == "SparePart" && sale.extraPartsCount > 0) {
                const moreParts = document.createElement("span");
                moreParts.textContent = `+ ${sale.extraPartsCount} Repuestos`;
                moreParts.classList.add("moreParts")
                productData.appendChild(moreParts)
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
            if (sale.productType == "Vehicle") {
                // VIN
                const vinDataSale = document.createElement("div");
                vinDataSale.classList.add("dataSale");
                const lblVin = document.createElement("span");
                lblVin.classList.add("lbl");
                lblVin.textContent = "Vin:";
                const vinSpan = document.createElement("span");
                vinSpan.textContent = sale.vin || "N/A"; // VIN
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
            sellerDataSale.append(lblSeller, sellerSpan);

            // Cliente
            const customerDataSale = document.createElement("div");
            customerDataSale.classList.add("dataSale");
            const lblCustomer = document.createElement("span");
            lblCustomer.classList.add("lbl");
            lblCustomer.textContent = "Cliente:";
            const customerSpan = document.createElement("span");
            customerSpan.textContent = sale.customerName || "N/A"; // Cliente
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
            totalSpan.textContent = `$${sale.totalAmount.toLocaleString('es-SV')}` || "$N/A"; // Monto Total
            totalAmountData.append(lblTotal, totalSpan);

            // Deuda
            const amountDueData = document.createElement("div");
            amountDueData.classList.add("dataSale", "amountDue");
            const lblDue = document.createElement("span");
            lblDue.classList.add("lbl");
            lblDue.textContent = "Deuda:";
            const dueSpan = document.createElement("span");
            dueSpan.textContent = `$${sale.amountDue.toLocaleString('es-SV')}` || "$N/A"; // Deuda
            amountDueData.append(lblDue, dueSpan);

            // Contenedor de Botones
            const containerButtonsData = document.createElement("div");
            containerButtonsData.classList.add("containerButtonsData");

            // Botón "Ver mas"
            const btnView = document.createElement("a");
            btnView.classList.add("btnSecondary");
            btnView.textContent = "Ver mas";


            // Botón "Editar"
            const btnEdit = document.createElement("a");
            btnEdit.classList.add("btnPrimary");
            btnEdit.textContent = "Editar";

            if (sale.productType == "Vehicle") {
                btnEdit.href = `vehicleSale.html?idSale=${sale.idSale}&idVehicle=${sale.idVehicle}&customerName=${sale.customerName}`;
                btnView.href = `vehicleViewSale.html?idSale=${sale.idSale}&idVehicle=${sale.idVehicle}&customerName=${sale.customerName}`;
            } else {
                btnEdit.href = `sparePartSale.html?idSale=${sale.idSale}&idVehicle=${sale.idVehicle}&customerName=${sale.customerName}`;
                btnView.href = `sparePartsSaleView.html?idSale=${sale.idSale}&idVehicle=${sale.idVehicle}&customerName=${sale.customerName}`;
            }

            containerButtonsData.append(btnView, btnEdit);

            rightDataSale.append(totalAmountData, amountDueData, containerButtonsData);

            // --- 6. Ensamblar el Panel ---
            dataSaleContainer.append(leftDataSale, rightDataSale);
            panel.append(containerImgSale, dataSaleContainer, typeSale);

            fragment.appendChild(panel);
        });

    }
    container.appendChild(fragment);
}