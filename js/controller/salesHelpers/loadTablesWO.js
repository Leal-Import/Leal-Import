import { formatOnBlur, formatOnFocus } from "../salesHelpers/payments.js";
import { formatWithCommas, allowDecimal } from "../../utils.js";

const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $ = id => document.getElementById(id);

export function appendToDom(tBodyS, data, rows, addEventsPrice, extraMethods, createTrashOption, calculateAmountDue) {
    const tBody = qsa(tBodyS); if (!tBody) return false;
    let emptyRow = qsa(`${tBodyS} tr`).find(r => r.querySelector('.tdName').textContent.trim() === '');
    if (!emptyRow) {
        // si no hay fila vacía, añadimos una fila a ambas tablas y reintentamos
        addRowToBothTables();
        emptyRow = qsa(`${tBodyS} tr`).find(r => r.querySelector('.tdName').textContent.trim() === '');
    }

    const nameCell = emptyRow.querySelector('.tdName');
    const priceCell = emptyRow.querySelector('.tdPrice');
    nameCell.textContent = data.name;
    priceCell.textContent = `$${formatWithCommas(data.price)}`;
    priceCell.setAttribute('contenteditable', 'true');

    // limpiar inputs ocultos previos
    emptyRow.dataset.id = data.id;
    if (data.idWo) emptyRow.dataset.idWo = data.idWo;
    if (createTrashOption) {
        const btn = createTrashOption(data.id, data.idWo, nameCell, priceCell);
        emptyRow.appendChild(btn);
    }
    // listener para editar precio (preservando cursor)
    if (addEventsPrice) {
        allowDecimal(priceCell);
        priceCell.addEventListener('input', (e) => {
            addEventsPrice();
            calculateAmountDue();
        });
    }

    priceCell.addEventListener("focus", (e) => {
        formatOnFocus(e);
    })
    priceCell.addEventListener("blur", (e) => {
        formatOnBlur(e);
    });


    if (rows) rows++;
    if (extraMethods) extraMethods();
    return true;
}

// ---------- Helpers para filas dinámicas ----------
function createEmptyRow() {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td'); tdName.className = 'tdName';
    const tdPrice = document.createElement('td'); tdPrice.className = 'tdPrice';
    tr.append(tdName, tdPrice);
    return tr;
}

function addRowToBothTables() {
    const tBodyServices = $('tBodyServices');
    const tBodyParts = $('tBodySpareParts');
    if (tBodyServices) tBodyServices.appendChild(createEmptyRow());
    if (tBodyParts) tBodyParts.appendChild(createEmptyRow());
}