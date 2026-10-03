import { createModuleInitializer } from '../../utils/dom.js';
import { dashboardState } from './dashboard.state.js';
import { DOMRefs, renderDashboardData, renderCounters, renderTopSellers, renderTopVehicleSale, renderRecentWorkOrders, renderUrgentCollections } from './dashboard.dom.js';
import { initDashboardEvents } from './dashboard.event.js';
import { getDashboard } from './dashboard.service.js';

const resetState = () => {
    dashboardState.currentPeriod = 'MONTH';
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
        onPeriodChange: async (period) => {
            dashboardState.currentPeriod = period;
            try {
                await loadDashboard(refs, period);
            } catch (error) {
                console.error('Error cargando dashboard por período:', error);
            }
        }
    });
};

const load = async (refs) => {
    try {
        await loadDashboard(refs, dashboardState.currentPeriod);
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
    }
};

const loadDashboard = async (refs, period) => {
    const data = await getDashboard(period);
    renderCounters(refs, data.counters);
    renderDashboardData(refs, data.metrics, dashboardState.chart);
    renderTopSellers(refs, data.topSellers);
    renderTopVehicleSale(refs, data.topVehicleSales);
    renderRecentWorkOrders(refs, data.recentWorkOrders);
    renderUrgentCollections(refs, data.urgentCollections);
};

createModuleInitializer({
    resetState,
    initialize,
    load,
    DOMRefs
});
