import { $, qs } from '../../utils/dom.js';
import { getChipClass } from './dashboard.logic.js';
import { formatWithCommas } from '../../utils/formatters.js';

export const DOMRefs = {
    init: () => ({
        periodBtns: document.querySelectorAll('.dashPeriodBtn'),
        chartSub: $('chartSub'),
        earningsChart: $('earningsChart'),
        kpis: {
            orders: $('kpiOrders'),
            sales: $('kpiSales'),
            clients: $('kpiClients')
        },
        chips: {
            orders: $('chipOrders'),
            sales: $('chipSales'),
            clients: $('chipClients')
        },
        counters: {
            delayed: $('delayedOrdersCount'),
            inactive: $('inactiveCustomersCount'),
            stock: $('stockVehiclesCount')
        },
        topSellers: {
            hero: qs('.dashSellerHero'),
            heroAvatar: qs('.dashSellerHero .dashSellerAvatar'),
            heroName: qs('.dashSellerHero .dashSellerName'),
            heroRole: qs('.dashSellerHero .dashSellerRole'),
            heroAmount: qs('.dashSellerHero .dashSellerAmount'),
            list: $('topSellersList')
        }
    })
};

export const renderDashboardData = (refs, data, chart) => {
    const d = data || { k: [], c: [], labels: [], vals: [], sub: '' };

    // KPIs con acceso simple a propiedades
    refs.kpis.orders.textContent = d.k[0] || '0';
    refs.kpis.sales.textContent = d.k[1] || '0';
    refs.kpis.clients.textContent = d.k[3] || '0';

    // Chips de tendencia
    const chipConfig = [
        { key: 'orders', valIdx: 0, typeIdx: 1 },
        { key: 'sales', valIdx: 2, typeIdx: 3 },
        { key: 'clients', valIdx: 4, typeIdx: 5 }
    ];

    chipConfig.forEach(conf => {
        const el = refs.chips[conf.key];
        if (el) {
            el.textContent = data.c[conf.valIdx] || '0%';
            el.className = getChipClass(data.c[conf.typeIdx] || 'flat');
        }
    });

    refs.chartSub.textContent = data.sub || '';

    // Actualizar gráfico si existe
    if (chart) {
        chart.data.labels = data.labels || [];
        chart.data.datasets[0].data = data.vals || [];
        chart.update();
    }
};

/**
 * Renderiza los contadores de la API
 */
export const renderCounters = (refs, counters) => {
    if (!counters) return;
    refs.counters.delayed.textContent = counters.delayedOrders || 0;
    refs.counters.inactive.textContent = counters.inactiveCustomers || 0;
    refs.counters.stock.textContent = counters.stockVehicles || 0;
};

/**
 * Renderiza la lista de mejores vendedores
 */
export const renderTopSellers = (refs, sellers) => {
    if (!refs.topSellersList) return;

    refs.topSellersList.innerHTML = '';

    sellers.forEach(seller => {
        const item = document.createElement('div');
        item.className = 'topSellerItem';

        item.innerHTML = `
            <div class="sellerInfo">
                <div class="sellerAvatar">${seller.initials || '??'}</div>
                <div class="sellerMeta">
                    <span class="sellerName">${seller.fullName || 'Empleado'}</span>
                    <span class="sellerRole">${seller.roleName || 'Sin rol'}</span>
                </div>
            </div>
            <div class="sellerAmount">
                <span class="amountValue">${formatWithCommas(seller.totalAmount || 0)}</span>
                <span class="amountLabel">Ventas</span>
            </div>
        `;

        refs.topSellersList.appendChild(item);
    });
};
