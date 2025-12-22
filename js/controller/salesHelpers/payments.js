import { getPaymentMethods } from '../../service/serviceConfiguration.js';
import { allowDecimal, fillSelect, formatWithCommas } from '../../utils.js'


function safeParseFloat(v) { const n = parseFloat(String(v || '').replace(/[$,\s]/g, '')); return isNaN(n) ? 0 : n; }

let paymentMethodsList = [];
export async function loadPayMethods() {
    try {
        const roles = await getPaymentMethods();
        // Tu API puede devolver array o { content: [...] }
        paymentMethodsList = Array.isArray(roles) ? roles : (roles?.content || []);
    } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
        paymentMethodsList = [];
    }
}

/* ================== MAIN LOGIC ================== */
export function managePaymentsAndCalculateDebt(
    saveState,
    createBtnUrl,
    calculateTotal,
    arrayDeleteIds
) {
    const rows = document.querySelectorAll('#amounts .paymentRow')

    let totalPaid = 0

    rows.forEach(row => {
        const input = row.querySelector('.amountInput')
        totalPaid += safeParseFloat(input?.value)
    })

    let totalSale;
    if (calculateTotal) totalSale = calculateTotal();
    else totalSale = 0;
    const debt = totalSale - totalPaid;

    const dueText = document.getElementById('due')
    const paidText = document.getElementById('totalPaid')

    if (paidText) {
        paidText.textContent = `$${formatWithCommas(totalPaid)}`
        paidText.style.color =
            totalPaid > 0 ? 'var(--success-color)' : 'var(--text-muted)'
    }

    if (dueText) {
        dueText.textContent = `$${formatWithCommas(debt)}`
        dueText.style.color =
            debt > 0 ? 'var(--danger-color)' : 'var(--success-color)'
    }

    saveState && saveState()
}


export function createInitialPaymentField(
    amount = 0,
    paymentMethodId = null,
    receiptUrl = null,
    idPayment = null,
    saveState,
    createBtnUrl,
    calculateTotal,
    arrayDeleteIds
) {
    const amountContainer = document.getElementById("amounts");
    if (!amountContainer) return;

    const index = amountContainer.children.length + 1;

    const tr = document.createElement("tr");
    tr.classList.add("paymentRow");
    tr.dataset.index = index;
    if (idPayment) tr.dataset.id = idPayment;

    /* ===== MONTO ===== */
    const tdAmount = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("txtInputs", "amountInput");
    input.placeholder = `Abono ${index}`;
    input.id = `amountInput${index}`;

    if (amount > 0) {
        input.value = `$${formatWithCommas(amount)}`;
    }

    allowDecimal(input);
    tdAmount.appendChild(input);

    /* ===== MÉTODO ===== */
    const tdMethod = document.createElement("td");
    tdMethod.classList.add("tdMethod");
    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");
    select.id = `paymentTypeSelect${index}`;

    tdMethod.appendChild(select);

    /* ===== ACCIONES ===== */
    let tdActions;
    let containerActions;
    let deleteBtn;
    if (createBtnUrl) {
        tdActions = document.createElement("td");
        containerActions = document.createElement("div");
        tdActions.appendChild(containerActions);
        containerActions.classList.add("actionsPayments");

        if (createBtnUrl) {
            const receiptBtn = createBtnUrl(index, receiptUrl);
            containerActions.appendChild(receiptBtn);
        }
    }
    if (amountContainer.children.length != 0) {
        deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.classList.add("btnTrash");
        deleteBtn.innerHTML = '<img src="../../media/appMedia/trashIcon.png" alt="Eliminar abono">';

        deleteBtn.addEventListener("click", () => {
            const rows = document.querySelectorAll(".amounts .paymentRow");

            // 🗑 Eliminación normal
            const id = tr.dataset.id;
            if (id && arrayDeleteIds) arrayDeleteIds.push(id);
            tr.remove();
            managePaymentsAndCalculateDebt(saveState, createBtnUrl, calculateTotal, arrayDeleteIds);
            reindexPayments();
        });
        if (createBtnUrl) containerActions.appendChild(deleteBtn);
    }



    /* ===== ENSAMBLAR ===== */
    tr.append(tdAmount, tdMethod);
    if (createBtnUrl) tr.appendChild(tdActions);
    else if(amountContainer.children.length != 0) {
        tr.appendChild(deleteBtn)
    };
    reindexPayments();
    amountContainer.appendChild(tr);

    fillSelect(select.id, paymentMethodsList, "idPaymentMethod", "methodName", "Metodo de pago");
    select.dataset.filled = true;

    if (paymentMethodId) select.value = paymentMethodId;

    input.addEventListener("focus", e => formatOnFocus(e, true));
    input.addEventListener("blur", e => formatOnBlur(e, true));

    input.addEventListener("input", () => {
        managePaymentsAndCalculateDebt(saveState, createBtnUrl, calculateTotal, arrayDeleteIds);
        calculateTotal()
    });

    saveState && input.addEventListener("input", saveState);
    saveState && select.addEventListener("change", saveState);
}

function reindexPayments() {
    const rows = document.querySelectorAll("#amounts .paymentRow");
    rows.forEach((row, i) => {
        const index = i + 1;
        row.dataset.index = index;

        const input = row.querySelector(".amountInput");
        const select = row.querySelector(".paymentTypeSelect");

        if (input) {
            input.id = `amountInput${index}`;
            input.placeholder = `Abono ${index}`;
        }

        if (select) {
            select.id = `paymentTypeSelect${index}`;
        }

        // 🔥 Botón comprobante (si depende del index)
        const receiptBtn = row.querySelector("[data-receipt-btn]");
        if (receiptBtn) {
            receiptBtn.dataset.index = index;
        }
    });
}


export function formatOnBlur(event, isInput) {
    const element = event.target;
    let value = isInput ? element.value : element.textContent;

    // Convertir a número
    let number = safeParseFloat(value);

    // Si resulta en NaN, lo dejamos vacío
    if (isNaN(number)) {
        if (isInput) element.value = "";
        else element.textContent = "";
        return;
    }

    // Formateador USD
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });

    // Aplicar formato
    const formatted = formatter.format(number);

    if (isInput) element.value = formatted;
    else element.textContent = formatted;
}


export function formatOnFocus(event, isInput) {
    const element = event.target;
    let value = isInput ? element.value : element.innerText;

    // Quitar símbolo de dólar y comas
    let clean = value.replace('$', '').replace(/,/g, '');

    // Si incluía decimales escritos por el usuario, mantenerlos
    // Detecta si el valor original NO estaba formateado automáticamente.
    const userTypedDecimals =
        (value.includes('.') || value.includes(',')) &&
        !value.includes('$') &&
        !value.includes(',');

    if (!userTypedDecimals) {
        // Quitar decimales si no fueron escritos manualmente
        clean = clean.split('.')[0];
        clean = clean.split(',')[0];
    }

    if (isInput) {
        element.value = clean;
    } else {
        element.textContent = clean;
    }
}
