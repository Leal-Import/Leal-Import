const dashPeriods = {
    hoy: { k: ['6', '$4,820', '$18,420', '1'], c: ['+5%', 'up', '+2%', 'up', '+1%', 'down', '±0%', 'flat'], labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'], vals: [800, 1200, 900, 1500, 700, 420], sub: 'Horas del día' },
    semana: { k: ['18', '$21,400', '$18,420', '3'], c: ['+12%', 'up', '+5%', 'up', '+3%', 'down', '+2%', 'up'], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], vals: [3200, 4100, 2800, 5200, 4300, 1800], sub: 'Días de la semana' },
    mes: { k: ['38', '$53,203', '$18,420', '5'], c: ['+18%', 'up', '+8%', 'up', '+3%', 'down', '±0%', 'flat'], labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], vals: [12400, 15800, 13200, 11803], sub: 'Semanas del mes' },
    trimestre: { k: ['94', '$142,800', '$18,420', '14'], c: ['+22%', 'up', '+11%', 'up', '+5%', 'down', '+4%', 'up'], labels: ['Enero', 'Febrero', 'Marzo'], vals: [42100, 53203, 47500], sub: 'Meses del trimestre' },
    año: { k: ['284', '$383,210', '$18,420', '42'], c: ['+31%', 'up', '+19%', 'up', '+2%', 'down', '+8%', 'up'], labels: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], vals: [28400, 42100, 53203, 31200, 28400, 25800, 31200, 27400, 24800, 22100, 26400, null], sub: 'Meses del año' },
};

function dashSetPeriod(btn, key) {
    document.querySelectorAll('.dashPeriodBtn').forEach(b => b.classList.remove('dashPeriodBtnActive'));
    btn.classList.add('dashPeriodBtnActive');
    const d = dashPeriods[key];
    ['kpiOrders', 'kpiSales', 'kpiDebt', 'kpiClients'].forEach((id, i) => document.getElementById(id).textContent = d.k[i]);
    ['chipOrders', 'chipSales', 'chipDebt', 'chipClients'].forEach((id, i) => {
        const el = document.getElementById(id);
        el.textContent = d.c[i * 2];
        el.className = 'dashChip ' + { up: 'dashChipUp', down: 'dashChipDown', flat: 'dashChipFlat' }[d.c[i * 2 + 1]];
    });
    document.getElementById('chartSub').textContent = d.sub;
    dashChart.data.labels = d.labels;
    dashChart.data.datasets[0].data = d.vals;
    dashChart.update();
}

const dashCtx = document.getElementById('earningsChart').getContext('2d');
const dashChart = new Chart(dashCtx, {
    type: 'line',
    data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [{
            label: 'Ventas',
            data: [12400, 15800, 13200, 11803],
            borderColor: '#D31813',
            borderWidth: 2,
            backgroundColor: 'rgba(211,24,19,0.06)',
            fill: true,
            pointBackgroundColor: '#D31813',
            pointRadius: 4,
            pointHoverRadius: 6,
            lineTension: 0.4,
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