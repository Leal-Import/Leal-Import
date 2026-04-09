import { createModuleInitializer } from '../../utils/dom.js';
import { dashboardState } from './dashboard.state.js';
import { dashPeriods } from './dashboard.logic.js';
import { DOMRefs, renderDashboardData, renderCounters, renderTopSellers } from './dashboard.dom.js';
import { initDashboardEvents } from './dashboard.event.js';
import { getCounters, getTopSellers } from './dashboard.service.js';

const resetState = () => {
    dashboardState.currentPeriod = 'mes';
    if (dashboardState.chart) {
        dashboardState.chart.destroy();
        dashboardState.chart = null;
    }
};

const initialize = (refs) => {
    // Inicializar Gráfico
    const dashCtx = refs.earningsChart.getContext('2d');
    dashboardState.chart = new Chart(dashCtx, {
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
                pointRadius: 0,
                pointHoverRadius: 5,
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

    // Eventos
    initDashboardEvents(refs, {
        onPeriodChange: (period) => {
            dashboardState.currentPeriod = period;
            const data = dashPeriods[period] || dashPeriods.mes;
            renderDashboardData(refs, data, dashboardState.chart);
        }
    });
};

const load = async (refs) => {
    // 1. Carga inicial de datos mockeados para el gráfico
    const data = dashPeriods[dashboardState.currentPeriod] || dashPeriods.mes;
    renderDashboardData(refs, data, dashboardState.chart);

    // 2. Carga de datos reales desde API
    try {
        const [counters, sellers] = await Promise.all([
            getCounters(),
            getTopSellers()
        ]);

        renderCounters(refs, counters);
        renderTopSellers(refs, sellers);
    } catch (error) {
        console.error('Error cargando datos del API:', error);
    }
};

createModuleInitializer({
    resetState,
    initialize,
    load,
    DOMRefs
});
