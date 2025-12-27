import { formatWithCommas } from "../../utils.js";

export function createRowTable(tBody, id, name, price, createTrashOption, addEventsPrice, className, classPrice, calculateTotal, idSaleItem, arraySelected) {
    const container = document.getElementById(tBody);
    if (!container) return;
    // Remover row 'no data' si existe
    const rowNoData = container.querySelector(".rowNoData");
    if (rowNoData) rowNoData.remove();

    const tr = document.createElement("tr");
    const partName = document.createElement("td");
    const tdPrice = document.createElement("td");
    if (id) tr.setAttribute("data-id", id);
    if (idSaleItem) tr.setAttribute("data-idSaleItem", idSaleItem);
    if(arraySelected && id && name && price !== undefined) {
        arraySelected.push({
            idSparePart: id,
            name: name,
            priceApplied: price,
            idSaleItem: idSaleItem || null
        });
    }

    partName.textContent = name;
    tdPrice.textContent = "$" + formatWithCommas(price);

    partName.classList.add(className);
    tdPrice.classList.add(classPrice);
    tr.classList.add("tableRow");

    let btnTrash;
    if (createTrashOption) btnTrash = createTrashOption(container, tr, id, idSaleItem);
    if (addEventsPrice) addEventsPrice(tdPrice, arraySelected, id);
    tr.append(partName, tdPrice);
    if(btnTrash) tr.appendChild(btnTrash);
    container.appendChild(tr);


    if(calculateTotal) calculateTotal();
}

