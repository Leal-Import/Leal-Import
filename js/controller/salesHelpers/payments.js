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

export function managePaymentsAndCalculateDebt(savedState, createBtnUrl, calculateTotal, arrayDeleteIds) {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    // Eliminar abonos vacíos excepto el primero
    let allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    allPayments.forEach((payment, idx) => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat((input?.value || "").toString().replace(/[$,]/g, "")) || 0;
        if (idx > 0 && value === 0) {
            const idPayment = payment.dataset.id; // <-- ID real de ese pago
            if (idPayment && arrayDeleteIds) arrayDeleteIds.push(idPayment);
            payment.remove();
        }
    });
    // Refrescar nodos y renumerar
    allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    allPayments.forEach((payment, i) => {
        const number = i + 1;
        payment.setAttribute("data-index", number);
        const input = payment.querySelector(".amountInput");
        const select = payment.querySelector(".paymentTypeSelect");
        if (input && select) {
            input.placeholder = `Abono ${number}`
            input.id = `amountInput${number}`
            select.id = `paymentTypeSelect${number}`
        };

        // Asegurar que los selects estén llenos
        if (select && !select.dataset.filled) {
            fillSelect(select.id, paymentMethodsList, "idPaymentMethod", "methodName", "Metodo de pago");
            select.dataset.filled = true;
        }
    });

    // Recalcular total pagado
    let totalPaid = 0;
    allPayments.forEach(payment => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat((input?.value || "").toString().replace(/[$,]/g, "")) || 0;
        totalPaid += value;
    });

    // Si el último abono tiene valor → crear otro campo vacío
    const lastPayment = allPayments[allPayments.length - 1];
    if (lastPayment) {
        const lastInput = lastPayment.querySelector(".amountInput");
        const lastValue = parseFloat((lastInput?.value || "").toString().replace(/[$,]/g, "")) || 0;
        if (lastValue > 0) addNewPaymentField(savedState, createBtnUrl, calculateTotal);
    } else {
        // No hay campos, crear uno
        createInitialPaymentField(0, null, null, null, savedState, createBtnUrl, calculateTotal);
    }

    // Calcular deuda y actualizar UI
    const totalSale = calculateTotal();
    const debt = totalSale - totalPaid;
    const dueText = document.getElementById("due");
    if (dueText) {
        dueText.textContent = `$${formatWithCommas(debt)}`;
        dueText.style.color = debt > 0 ? 'var(--danger-color)' : 'var(--success-color)';
    }

    verifySelects();
    savedState ? savedState() : null;
}

function addNewPaymentField(savedState, createBtnUrl, calculateTotal) {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    const lastChild = amountContainer.lastElementChild;
    if (lastChild) {
        const lastInput = lastChild.querySelector(".amountInput");
        const lastValue = parseFloat((lastInput?.value || "").toString().replace(/[$,]/g, "")) || 0;
        if (lastValue === 0) return; // si ultimo está vacío, no crear
    }

    // crear field usando la función que centraliza comportamiento
    verifySelects();
    createInitialPaymentField(0, null, null, null, savedState, createBtnUrl, calculateTotal);
}

export let verifySelects = () => {
    const amounts = document.querySelectorAll(".amounts .containerAmount");
    amounts.forEach(amount => {
        const input = amount.querySelector(".amountInput");
        const select = amount.querySelector(".paymentTypeSelect");

        if (!input || !select) return;

        const rawValue = (input.value || "").trim();
        const numeric = parseFloat(rawValue.replace(/[$,]/g, "")) || 0;

        if (numeric === 0) {
            select.disabled = true;
            select.value = ""; // evita selects colgados
        } else {
            select.disabled = false;
        }
    });
};


export function createInitialPaymentField(amount = 0, paymentMethodId = null, receiptUrl = null, idPayment = null, saveState, createBtnUrl, calculateTotal, arrayDeleteIds) {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    const index = amountContainer.children.length + 1;

    const div = document.createElement("div");
    div.classList.add("containerAmount");
    div.setAttribute("data-index", index);
    if (idPayment) div.setAttribute("data-id", idPayment)

    // Input monto
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Abono ${index}`;
    input.classList.add("txtInputs", "amountInput");
    input.id = `amountInput${index}`;

    if (amount > 0) {
        input.value = `$${formatWithCommas(amount)}`;
    }
    saveState ? input.addEventListener("input", saveState) : null;

    // Select metodo pago
    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");
    select.id = `paymentTypeSelect${index}`;

    allowDecimal(input)

    // Llenar select con métodos de pago cargados
    div.append(input, select);
    amountContainer.appendChild(div);
    fillSelect(select.id, paymentMethodsList, "idPaymentMethod", "methodName", "Metodo de pago");
    select.dataset.filled = true;
    saveState ? select.addEventListener("change", saveState) : null;
    if (createBtnUrl) {
        let image = createBtnUrl(index, receiptUrl);
        div.appendChild(image);
    }
    // Si vino con amount sin formato, formatearlo
    if (amount > 0 && input.value && !input.value.startsWith('$')) {
        input.value = `$${formatWithCommas(parseCurrencyStringToNumber(input.value))}`;
    }
    if (paymentMethodId) select.value = paymentMethodId;
    input.addEventListener("focus", (e) => {
        formatOnFocus(e, true);
    });
    input.addEventListener("blur", (e) => {
        formatOnBlur(e, true);
    })

    input.addEventListener("input", () => {
        managePaymentsAndCalculateDebt(saveState, createBtnUrl, calculateTotal, arrayDeleteIds);
    }
    );

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
