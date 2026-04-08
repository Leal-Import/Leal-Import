import { createModuleInitializer } from '../../utils/dom.js';

let dashChart = null;

const dashPeriods = {
    hoy: { k: ['6', '49', '$18,420', '1'], c: ['+5%', 'up', '+2%', 'up', '+1%', 'down', '±0%', 'flat'], labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'], vals: [800, 1200, 900, 1500, 700, 420], sub: 'Horas del día' },
    semana: { k: ['18', '45', '$18,420', '3'], c: ['+12%', 'up', '+5%', 'up', '+3%', 'down', '+2%', 'up'], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], vals: [3200, 4100, 2800, 5200, 4300, 1800], sub: 'Días de la semana' },
    mes: { k: ['38', '40', '$18,420', '5'], c: ['+18%', 'up', '+8%', 'up', '+3%', 'down', '±0%', 'flat'], labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], vals: [12400, 15800, 13200, 11803], sub: 'Semanas del mes' },
    trimestre: { k: ['94', '45', '$18,420', '14'], c: ['+22%', 'up', '+11%', 'up', '+5%', 'down', '+4%', 'up'], labels: ['Enero', 'Febrero', 'Marzo'], vals: [42100, 53203, 47500], sub: 'Meses del trimestre' },
    año: { k: ['284', '60', '$18,420', '42'], c: ['+31%', 'up', '+19%', 'up', '+2%', 'down', '+8%', 'up'], labels: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], vals: [28400, 42100, 53203, 31200, 28400, 25800, 31200, 27400, 24800, 22100, 26400, null], sub: 'Meses del año' }
};

const DOMRefs = {
    init: () => ({
        periodBtns: document.querySelectorAll('.dashPeriodBtn'),
        chartSub: document.getElementById('chartSub'),
        earningsChart: document.getElementById('earningsChart'),
        kpis: {
            orders: document.getElementById('kpiOrders'),
            sales: document.getElementById('kpiSales'),
            clients: document.getElementById('kpiClients')
        },
        chips: {
            orders: document.getElementById('chipOrders'),
            sales: document.getElementById('chipSales'),
            clients: document.getElementById('chipClients')
        }
    })
};

const dashSetPeriod = (refs, btn, key) => {
    refs.periodBtns.forEach(b => b.classList.remove('dashPeriodBtnActive'));
    btn.classList.add('dashPeriodBtnActive');
    const d = dashPeriods[key];

    refs.kpis.orders.textContent = d.k[0];
    refs.kpis.sales.textContent = d.k[1];
    refs.kpis.clients.textContent = d.k[3];

    const chipKeys = ['orders', 'sales', 'clients'];
    chipKeys.forEach((ck, i) => {
        const el = refs.chips[ck];
        el.textContent = d.c[i * 2];
        el.className = 'dashChip ' + { up: 'dashChipUp', down: 'dashChipDown', flat: 'dashChipFlat' }[d.c[i * 2 + 1]];
    });

    refs.chartSub.textContent = d.sub;

    if (dashChart) {
        dashChart.data.labels = d.labels;
        dashChart.data.datasets[0].data = d.vals;
        dashChart.update();
    }
};

const resetState = async () => { };

const initialize = async (refs) => {
    refs.periodBtns.forEach(btn => {
        btn.addEventListener('click', () => dashSetPeriod(refs, btn, btn.dataset.period));
    });

    const dashCtx = refs.earningsChart.getContext('2d');
    dashChart = new Chart(dashCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Ventas',
                data: [],
                borderColor: '#D31813',
                borderWidth: 2,
                backgroundColor: 'rgba(211,24,19,0.06)',
                fill: true,
                pointBackgroundColor: '#D31813',
                pointRadius: 4,
                pointHoverRadius: 6,
                lineTension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            legend: { display: false },
            tooltips: {
                backgroundColor: '#fff',
                borderColor: 'rgba(211,24,19,0.15)',
                borderWidth: 1,
                titleFontColor: '#0D0503',
                bodyFontColor: '#D31813',
                callbacks: { label: t => ' $' + Number(t.yLabel).toLocaleString() }
            },
            scales: {
                xAxes: [{ gridLines: { color: 'rgba(129,133,158,0.1)' }, ticks: { fontColor: '#81859E', fontSize: 11 } }],
                yAxes: [{ gridLines: { color: 'rgba(129,133,158,0.1)' }, ticks: { fontColor: '#81859E', fontSize: 11, callback: v => '$' + (v / 1000).toFixed(0) + 'k' } }]
            }
        }
    });
};

const load = async (refs) => {
    const defaultBtn = Array.from(refs.periodBtns).find(b => b.classList.contains('dashPeriodBtnActive')) || refs.periodBtns[2];
    if (defaultBtn) {
        dashSetPeriod(refs, defaultBtn, defaultBtn.dataset.period || 'mes');
    }
};

createModuleInitializer({
    resetState,
    initialize,
    load,
    DOMRefs
});
