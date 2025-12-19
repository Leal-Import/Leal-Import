import { formatWithCommas } from '../../utils.js'

export async function insertSpareParts(
    spareParts,
    idtBody,
    createBtnAdd,
    verifyIds
) {
    const container = document.getElementById(idtBody);
    if (!container) return;

    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    if (!spareParts || spareParts.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        td.classList.add("no-data-message");
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);

        const tableEl = document.querySelector(".table");
        if (tableEl) tableEl.style.height = "100%";

        container.appendChild(fragment);
        return;
    }

    for (const sparePart of spareParts) {

        if (verifyIds?.(sparePart.idSpareParts)) continue;

        const tr = document.createElement("tr");
        const tdImage = document.createElement("td");
        const image = document.createElement("img");
        const name = document.createElement("td");
        const cost = document.createElement("td");
        const suggestedPriceTd = document.createElement("td");

        image.src = sparePart.photoUrl || "";
        name.textContent = sparePart.nameSpareParts || sparePart.sparePartName;
        cost.textContent = `$${formatWithCommas(sparePart.total || sparePart.totalCost || 0)}`;
        suggestedPriceTd.textContent = `$${formatWithCommas(sparePart.suggestedPrice || sparePart.priceApplied || 0)}`;

        tr.classList.add("tableRow");
        image.classList.add("imgSparePart");

        tdImage.appendChild(image);
        tr.append(tdImage, name, cost, suggestedPriceTd);

        if (createBtnAdd) {
            const btn = await createBtnAdd(sparePart, tr);
            tr.appendChild(btn);
        }

        fragment.appendChild(tr);
    }

    container.appendChild(fragment);
}
