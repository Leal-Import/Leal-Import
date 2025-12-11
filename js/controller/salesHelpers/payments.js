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

export function managePaymentsAndCalculateDebt() {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    // Eliminar abonos vacíos excepto el primero
    let allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    allPayments.forEach((payment, idx) => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat((input?.value || "").toString().replace(/[$,]/g, "")) || 0;
        if (idx > 0 && value === 0) payment.remove();
    });
    // Refrescar nodos y renumerar
    allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    allPayments.forEach((payment, i) => {
        const number = i + 1;
        payment.setAttribute("data-index", number);
        const input = payment.querySelector(".amountInput");
        if (input) input.placeholder = `Abono ${number}`;

        // Asegurar que los selects estén llenos
        const select = payment.querySelector(".paymentTypeSelect");
        if (select && !select.dataset.filled) {
            fillSelect(select.id, paymentMethodsList, "idPaymentMethod", "methodName");
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
        if (lastValue > 0) addNewPaymentField();
    } else {
        // No hay campos, crear uno
        createInitialPaymentField();
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
}

function addNewPaymentField() {
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
    createInitialPaymentField(0, null, null);
}

let verifySelects = () => {
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


export function createInitialPaymentField(amount = 0, paymentMethodId = null, receiptUrl = null) {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    const index = amountContainer.children.length + 1;

    const div = document.createElement("div");
    div.classList.add("containerAmount");
    div.setAttribute("data-index", index);

    // Input monto
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Abono ${index}`;
    input.classList.add("txtInputs", "amountInput");
    input.id = `amountInput${index}`;

    if (amount > 0) {
        input.value = `$${formatWithCommas(amount)}`;
    }

    allowDecimal(input);

    // Select metodo pago
    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");
    select.id = `paymentTypeSelect${index}`;

    // Llenar select con métodos de pago cargados
    div.append(input, select);
    amountContainer.appendChild(div);
    fillSelect(select.id, paymentMethodsList, "idPaymentMethod", "methodName");
    select.dataset.filled = true;

    // Ensamblar

    // Si vino con amount sin formato, formatearlo
    if (amount > 0 && input.value && !input.value.startsWith('$')) {
        input.value = `$${formatWithCommas(parseCurrencyStringToNumber(input.value))}`;
    }
    input.addEventListener("focus", (e) => {
        formatOnFocus(e, true);
    });
    input.addEventListener("blur", (e) => {
        formatOnBlur(e, true);
    })

    input.addEventListener("input", (e) => {
        managePaymentsAndCalculateDebt(e, select);
    }
    );
    
}

function calculateTotal() {
    let total = 0;
    const containerTotal = document.getElementById("containerTotal");
    const containerDue = document.getElementById("containerAmountDue");
    const prices = document.querySelectorAll("#tBodySelected .finalPrice");
    const totalText = document.getElementById("total");
    const dueText = document.getElementById("due");

    prices.forEach(priceElement => {
        const priceText = priceElement.textContent;
        const cleanValue = priceText.replace(/[$,]/g, "");
        const value = parseFloat(cleanValue) || 0;
        total += value;
    });

    const moneyPaid = calculatePaid();
    const due = total - moneyPaid;

    if (totalText) totalText.textContent = `$${formatWithCommas(total)}`;
    if (dueText) {
        dueText.textContent = `$${formatWithCommas(due)}`;
        dueText.style.color = due > 0 ? 'var(--danger-color)' : 'var(--success-color)';
    }

    if (total === 0) {
        containerDue?.classList.remove("show");
        containerTotal?.classList.remove("show");
    } else {
        containerDue?.classList.add("show");
        containerTotal?.classList.add("show");
    }

    return total;
}

function calculatePaid() {
    let totalPaid = 0;
    const amountInputs = document.querySelectorAll(".amounts .amountInput");
    amountInputs.forEach(input => {
        const cleanValue = (input.value || "").toString().replace(/[$,]/g, "") || "0";
        totalPaid += parseFloat(cleanValue) || 0;
    });
    return totalPaid;
}

export function formatOnBlur(event, isInput) {
    const element = event.target;
    let value
    if (isInput) {
        value = element.value;
        let number = safeParseFloat(value);
        // 2. Formatear el número como moneda
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        });
        // 3. Actualizar el contenido con el valor formateado
        element.value = formatter.format(number);
    } else {
        value = element.textContent
        let number = safeParseFloat(value);
        // 2. Formatear el número como moneda
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        });
        // 3. Actualizar el contenido con el valor formateado
        element.textContent = formatter.format(number);
    }
}

export function formatOnFocus(event, isInput) {
    const element = event.target;
    let value;
    if (isInput) {
        value = element.value;
        let cleanValue = value.replace('$', '').replace(/,/g, '');
        element.value = cleanValue;
    }
    else {
        value = element.innerText;
        let cleanValue = value.replace('$', '').replace(/,/g, '');
        element.textContent = cleanValue;
    }
}