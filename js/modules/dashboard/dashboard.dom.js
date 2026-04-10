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
            topSellersList: $('topSellersList')
        },
        topVehicleSale: qs('.dashSaleList'),
        recentWorkOrdersTable: qs('.dashTable tbody')
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
    if (!refs.topSellers?.topSellersList || !refs.topSellers?.hero || !Array.isArray(sellers)) return;

    const [topSeller, ...remainingSellers] = sellers;
    const hero = refs.topSellers;

    if (topSeller) {
        hero.heroAvatar.textContent = topSeller.initials || '??';
        hero.heroName.textContent = topSeller.fullName || 'Vendedor';
        hero.heroRole.textContent = topSeller.roleName || 'Sin rol';
        hero.heroAmount.textContent = `${formatWithCommas(topSeller.totalAmount || 0)}`;
    }

    const maxAmount = Math.max(...remainingSellers.map(s => Number(s.totalAmount || 0)), 0, Number(topSeller?.totalAmount || 0));

    refs.topSellers.topSellersList.innerHTML = remainingSellers.map((seller, index) => {
        const rank = index + 2;
        const amount = Number(seller.totalAmount || 0);
        const width = maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;
        const rankClass = rank === 2 ? 'dashRankSilver' : rank === 3 ? 'dashRankBronze' : 'dashRankNormal';
        const fillClass = rank <= 3 ? 'dashRankFillTop' : 'dashRankFillDim';
        const amountClass = rank <= 3 ? '' : 'dashRankAmtDim';

        return `
            <div class="dashRankRow">
                <span class="dashRankNum ${rankClass}">#${rank}</span>
                <div class="dashRankAvatar ${rank <= 3 ? 'dashRankAvatarTop' : 'dashRankAvatarDim'}">${seller.initials || '??'}</div>
                <div class="dashRankInfo">
                    <p class="dashRankName">${seller.fullName || 'Vendedor'}</p>
                    <div class="dashRankBar">
                        <div class="dashRankFill ${fillClass}" style="width:${width}%"></div>
                    </div>
                </div>
                <span class="dashRankAmt ${amountClass}">${formatWithCommas(amount)}</span>
            </div>
        `;
    }).join('');
};

/**
 * Renderiza las mejores ventas de vehículos
 */
export const renderTopVehicleSale = (refs, data) => {
    if (!refs.topVehicleSale || !Array.isArray(data)) return;

    refs.topVehicleSale.innerHTML = data.map((sale, index) => `
        <div class="dashSaleItem">
            <span class="dashSaleNum">${String(index + 1).padStart(2, '0')}</span>
            <div class="dashSaleIcon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                    <rect x="9" y="11" width="14" height="10" rx="1" />
                    <circle cx="12" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                </svg>
            </div>
            <div class="dashSaleInfo">
                <p class="dashSaleName">${sale.vehicleName || 'Vehículo'}</p>
                <p class="dashSaleClient">${sale.sellerName || 'Vendedor'}</p>
            </div>
            <div class="dashSaleRight">
                <p class="dashSaleAmt">${formatWithCommas(sale.totalAmount || 0)}</p>
                <p class="dashSaleDebt ${sale.amountDue > 0 ? 'dashSaleDebtPending' : 'dashSaleDebtPaid'}">${sale.statusText || 'Saldado'}</p>
            </div>
        </div>
    `).join('');
};

/**
 * Renderiza las órdenes de trabajo recientes
 */
export const renderRecentWorkOrders = (refs, workOrders) => {
    if (!refs.recentWorkOrdersTable || !workOrders) return;

    refs.recentWorkOrdersTable.innerHTML = workOrders.map(order => `
        <tr>
            <td>${order.vehicleName || 'Vehículo'}</td>
            <td class="dashTdMuted">${order.mechanicName || 'Mecánico'}</td>
            <td class="dashTdMono">${order.estimatedDate ? new Date(order.estimatedDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : 'N/A'}</td>
            <td class="dashTdMono">${formatWithCommas(order.totalCost || 0)}</td>
            <td class="dashTdMono ${order.amountDue > 0 ? 'dashTdDanger' : 'dashTdSuccess'}">${order.amountDue > 0 ? formatWithCommas(order.amountDue) : '—'}</td>
            <td><span class="dashBadge ${getStatusBadgeClass(order.statusName)}">${order.statusName || 'Estado'}</span></td>
        </tr>
    `).join('');
};

/**
 * Obtiene la clase CSS para el badge de estado
 */
const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
    case 'completada':
    case 'completado':
        return 'dashBadgeSuccess';
    case 'cancelada':
    case 'cancelado':
        return 'dashBadgeDanger';
    case 'espera de aprobación':
    case 'pendiente':
        return 'dashBadgeWarning';
    default:
        return 'dashBadgeWarning';
    }
};
