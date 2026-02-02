
export let insertCustomers = (container, customers, type) => {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    
    if (customers.length == 0) {
        // Estado vacío mejorado
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        
        // Crear SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("viewBox", "0 0 24 24");
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("d", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z");
        svg.appendChild(path);
        
        // Crear título
        const title = document.createElement("h3");
        title.textContent = "No hay clientes disponibles";
        
        // Crear descripción
        const description = document.createElement("p");
        description.textContent = "No se encontraron clientes en el sistema";
        
        emptyState.append(svg, title, description);
        fragment.appendChild(emptyState);
    } else {
        customers.forEach((customer, index) => {
            // Crear elemento principal
            const customerLink = document.createElement("a");
            customerLink.classList.add("customer");
            customerLink.dataset.customerId = customer.idCustomer;
            
            // Establecer href según el tipo
            if (type == "sparePart") {
                customerLink.href = `sparePartSale.html?idCustomer=${customer.idCustomer}&customerName=${encodeURIComponent(customer.fullName)}`;
            } else if (type == "vehicle") {
                customerLink.href = `vehicleSale.html?idCustomer=${customer.idCustomer}&customerName=${encodeURIComponent(customer.fullName)}`;
            }
            
            // Crear indicador de selección
            const selectionIndicator = document.createElement("span");
            selectionIndicator.className = "selectionIndicator";
            
            const indicatorSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            indicatorSvg.setAttribute("fill", "none");
            indicatorSvg.setAttribute("stroke", "currentColor");
            indicatorSvg.setAttribute("viewBox", "0 0 24 24");
            
            const indicatorPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            indicatorPath.setAttribute("stroke-linecap", "round");
            indicatorPath.setAttribute("stroke-linejoin", "round");
            indicatorPath.setAttribute("stroke-width", "3");
            indicatorPath.setAttribute("d", "M9 5l7 7-7 7");
            indicatorSvg.appendChild(indicatorPath);
            selectionIndicator.appendChild(indicatorSvg);
            
            // Crear contenedor de avatar
            const avatarContainer = document.createElement("div");
            avatarContainer.className = "customerAvatarContainer";
            
            const avatarSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            avatarSvg.setAttribute("class", "customerAvatar");
            avatarSvg.setAttribute("fill", "none");
            avatarSvg.setAttribute("stroke", "currentColor");
            avatarSvg.setAttribute("viewBox", "0 0 24 24");
            
            const avatarPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            avatarPath.setAttribute("stroke-linecap", "round");
            avatarPath.setAttribute("stroke-linejoin", "round");
            avatarPath.setAttribute("stroke-width", "2");
            avatarPath.setAttribute("d", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z");
            avatarSvg.appendChild(avatarPath);
            avatarContainer.appendChild(avatarSvg);
            
            // Crear status
            const customerStatus = document.createElement("div");
            customerStatus.className = "customerStatus";
            
            const statusBadge = document.createElement("span");
            statusBadge.className = "statusBadge";
            statusBadge.textContent = "Activo";
            customerStatus.appendChild(statusBadge);
            
            // Crear body del cliente
            const customerBody = document.createElement("div");
            customerBody.className = "customerBody";
            
            // Crear nombre
            const customerName = document.createElement("h3");
            customerName.classList.add("customerName");
            customerName.textContent = customer.fullName;
            
            // Crear info row para DUI
            const duiRow = document.createElement("div");
            duiRow.className = "customerInfoRow";
            
            const duiIcon = document.createElement("div");
            duiIcon.className = "infoIcon";
            
            const duiSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            duiSvg.setAttribute("fill", "none");
            duiSvg.setAttribute("stroke", "currentColor");
            duiSvg.setAttribute("viewBox", "0 0 24 24");
            
            const duiPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            duiPath.setAttribute("stroke-linecap", "round");
            duiPath.setAttribute("stroke-linejoin", "round");
            duiPath.setAttribute("stroke-width", "2");
            duiPath.setAttribute("d", "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2");
            duiSvg.appendChild(duiPath);
            duiIcon.appendChild(duiSvg);
            
            const duiContent = document.createElement("div");
            duiContent.className = "infoContent";
            
            const duiLabel = document.createElement("div");
            duiLabel.className = "infoLabel";
            duiLabel.textContent = "DUI";
            
            const dui = document.createElement("span");
            dui.classList.add("dui");
            dui.textContent = customer.dui;
            
            duiContent.append(duiLabel, dui);
            duiRow.append(duiIcon, duiContent);
            
            // Crear info row para Teléfono
            const phoneRow = document.createElement("div");
            phoneRow.className = "customerInfoRow";
            
            const phoneIcon = document.createElement("div");
            phoneIcon.className = "infoIcon";
            
            const phoneSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            phoneSvg.setAttribute("fill", "none");
            phoneSvg.setAttribute("stroke", "currentColor");
            phoneSvg.setAttribute("viewBox", "0 0 24 24");
            
            const phonePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            phonePath.setAttribute("stroke-linecap", "round");
            phonePath.setAttribute("stroke-linejoin", "round");
            phonePath.setAttribute("stroke-width", "2");
            phonePath.setAttribute("d", "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z");
            phoneSvg.appendChild(phonePath);
            phoneIcon.appendChild(phoneSvg);
            
            const phoneContent = document.createElement("div");
            phoneContent.className = "infoContent";
            
            const phoneLabel = document.createElement("div");
            phoneLabel.className = "infoLabel";
            phoneLabel.textContent = "Teléfono";
            
            const phone = document.createElement("span");
            phone.classList.add("phone");
            phone.textContent = customer.personalPhone;
            
            phoneContent.append(phoneLabel, phone);
            phoneRow.append(phoneIcon, phoneContent);
            
            // Ensamblar el body
            customerBody.append(customerName, duiRow, phoneRow);
            
            // Ensamblar todo el customer link
            customerLink.append(selectionIndicator, avatarContainer, customerStatus, customerBody);
            
            fragment.appendChild(customerLink);
        });
    }
    
    container.appendChild(fragment);
}