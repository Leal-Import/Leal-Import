import { getPaymentMethods } from '../../service/serviceConfiguration.js';
import { allowDecimal, fillSelect, formatWithCommas, safeParseFloat } from '../../utils.js'


/* Aca se cargan todos los metodos de pago */
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

/* Aca solo se calcula la deuda de todas las interfaces vinculadas a este archivo */
export function calculateDebt(
    saveState,
    calculateTotal,
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

    saveState && saveState();
}

/* Se crean los pagos de los abonos */
export function createInitialPaymentField(
    amount = 0,
    paymentMethodId = null,
    receiptUrl = null,
    idPayment = null,
    saveState,
    createBtnUrl,
    calculateTotal,
    arrayDeleteIds,
    selectedAmounts
) {
    const amountContainer = document.getElementById("amounts");
    if (!amountContainer) return;

    const index = amountContainer.children.length + 1;

    const tr = document.createElement("tr");
    tr.classList.add("paymentRow");
    tr.dataset.index = index;
    console.log(idPayment)
    if (idPayment) tr.dataset.id = idPayment;
    const logicalId = idPayment || crypto.randomUUID();
    tr.dataset.logicalId = logicalId;
    // Asegurar que selectedAmounts siempre tenga este payment
    if (selectedAmounts) {
        selectedAmounts.push({
            id: logicalId,
            amount: safeParseFloat(amount),
            idPaymentMethod: paymentMethodId || null,
            idPayment: idPayment || null,
            paymentURL: receiptUrl || null
        });
    }

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
            const receiptBtn = createBtnUrl(index, receiptUrl, selectedAmounts);
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
            if (selectedAmounts) {
                const idx = selectedAmounts.findIndex(a => a.id === logicalId);
                if (idx !== -1) selectedAmounts.splice(idx, 1);
            }
            const id = tr.dataset.id;
            if (id && arrayDeleteIds) arrayDeleteIds.push(id);
            console.log(arrayDeleteIds);
            tr.remove();
            calculateDebt(saveState, calculateTotal);
            reindexPayments();
        });
        if (createBtnUrl) containerActions.appendChild(deleteBtn);
    }



    /* ===== ENSAMBLAR ===== */
    tr.append(tdAmount, tdMethod);
    if (createBtnUrl) tr.appendChild(tdActions);
    else if (amountContainer.children.length != 0) {
        tr.appendChild(deleteBtn)
    };
    reindexPayments();
    amountContainer.appendChild(tr);

    fillSelect(select.id, paymentMethodsList, "idPaymentMethod", "methodName", "Metodo de pago");
    select.dataset.filled = true;
    select.addEventListener("change", () => {
        if (!selectedAmounts) return;
        const item = selectedAmounts.find(a => a.id === logicalId);
        if (item) {
            item.idPaymentMethod = select.value || null;
        }
    });

    if (paymentMethodId) select.value = paymentMethodId;

    input.addEventListener("focus", e => formatOnFocus(e, true));
    input.addEventListener("blur", e => formatOnBlur(e, true));

    input.addEventListener("input", () => {
        if (selectedAmounts) {
            const item = selectedAmounts.find(a => a.id === logicalId);
            if (item) {
                item.amount = safeParseFloat(input.value);
            }
            console.log(selectedAmounts)
        }
        calculateDebt(saveState, calculateTotal);
    });


    saveState && input.addEventListener("input", saveState);
    saveState && select.addEventListener("change", saveState);
}

/* Se re acomodan los pagos */
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

/* Utilidad para cuando se quita el focus de un input o elemento editable */
export function formatOnBlur(event, isInput) {
    const element = event.target;
    let value = isInput ? element.value : element.textContent;

    // Si está vacío al salir → 0
    if (!value || value.trim() === '') {
        if (isInput) element.value = '$0.00';
        else element.textContent = '$0.00';
        return;
    }

    const number = safeParseFloat(value);

    // Si no es número → 0
    if (isNaN(number)) {
        if (isInput) element.value = '$0.00';
        else element.textContent = '$0.00';
        return;
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formatted = formatter.format(number);

    if (isInput) element.value = formatted;
    else element.textContent = formatted;
}


/* Utilidad para cuando se hace focus de un input o elemento editable */
export function formatOnFocus(event, isInput) {
    const element = event.target;
    let value = isInput ? element.value : element.innerText;

    if (!value) return;

    // Si es $0.00, dejar vacío (significa "no hay nada")
    if (value === '$0.00') {
        if (isInput) element.value = '';
        else element.textContent = '';
        return;
    }

    // Quitar formato visual
    let clean = value.replace(/\$/g, '').replace(/,/g, '');

    // Si termina en .00, quitar decimales
    if (clean.endsWith('.00')) {
        clean = clean.slice(0, -3);
    }

    if (isInput) {
        element.value = clean;
    } else {
        element.textContent = clean;
    }
}
