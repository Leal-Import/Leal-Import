import { formatWithCommas } from "../../utils.js";

export async function createRowTable(tBody, id, name, price, createTrashOption, addEventsPrice, className, classPrice, calculateTotal, isView) {
    const container = document.getElementById(tBody);
    if (!container) return;
    console.log(id, name, price)

    // Remover row 'no data' si existe
    const rowNoData = container.querySelector(".rowNoData");
    if (rowNoData) rowNoData.remove();

    const tr = document.createElement("tr");
    const partName = document.createElement("td");
    const tdPrice = document.createElement("td");
    if (id) tr.setAttribute("data-id", id);

    partName.textContent = name;
    tdPrice.textContent = "$" + formatWithCommas(price);

    partName.classList.add(className);
    tdPrice.classList.add(classPrice);
    tr.classList.add("tableRow");

    let btnTrash;
    if (createTrashOption) btnTrash = await createTrashOption(container, tr, id);
    if (addEventsPrice) addEventsPrice(tdPrice);
    tr.append(partName, tdPrice);
    if(btnTrash) tr.appendChild(btnTrash);
    container.appendChild(tr);


    if(calculateTotal) calculateTotal();
}
