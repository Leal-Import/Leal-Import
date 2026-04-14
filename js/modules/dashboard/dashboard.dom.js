import { $, qs, qsa } from '../../utils/dom.js';
import { getChipClass } from './dashboard.logic.js';
import { formatWithCommas } from '../../utils/formatters.js';

export const DOMRefs = {
    init: () => ({
        periodBtns: qsa('.dashPeriodBtn'),
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
        recentWorkOrdersTable: qs('.dashTable tbody'),
        urgentCollections: qs('.dashCobroList')
    })
};

export const renderDashboardData = (refs, data, chart) => {
    // Check if data is from API or mock
    if (data.orders && data.sales && data.newCustomers && data.incomeTrend) {
        // API data
        const orders = data.orders;
        const sales = data.sales;
        const clients = data.newCustomers;
        const incomeTrend = data.incomeTrend;

        refs.kpis.orders.textContent = orders.current || 0;
        refs.kpis.sales.textContent = sales.current || 0;
        refs.kpis.clients.textContent = clients.current || 0;

        // Chips
        const getChipType = (change) => change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
        const formatChange = (change) => `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;

        refs.chips.orders.textContent = formatChange(orders.percentageChange);
        refs.chips.orders.className = getChipClass(getChipType(orders.percentageChange));

        refs.chips.sales.textContent = formatChange(sales.percentageChange);
        refs.chips.sales.className = getChipClass(getChipType(sales.percentageChange));

        refs.chips.clients.textContent = formatChange(clients.percentageChange);
        refs.chips.clients.className = getChipClass(getChipType(clients.percentageChange));

        // Chart
        if (chart) {
            chart.data.labels = incomeTrend.map(item => item.label);
            chart.data.datasets[0].data = incomeTrend.map(item => item.amount);
            chart.update();
        }

        // Subtitle based on period
        const periodLabels = {
            TODAY: 'Horas del día',
            WEEK: 'Días de la semana',
            MONTH: 'Semanas del mes',
            QUARTER: 'Meses del trimestre',
            YEAR: 'Meses del año'
        };
        refs.chartSub.textContent = periodLabels[refs.periodBtns.find(btn => btn.classList.contains('dashPeriodBtnActive'))?.dataset.period] || 'Período';

    } else {
        // Mock data fallback
        const d = data || { k: [], c: [], labels: [], vals: [], sub: '' };

        refs.kpis.orders.textContent = d.k[0] || '0';
        refs.kpis.sales.textContent = d.k[1] || '0';
        refs.kpis.clients.textContent = d.k[3] || '0';

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

        if (chart) {
            chart.data.labels = data.labels || [];
            chart.data.datasets[0].data = data.vals || [];
            chart.update();
        }
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

/**
 * Renderiza los cobros urgentes
 */
export const renderUrgentCollections = (refs, collections) => {
    if (!refs.urgentCollections || !Array.isArray(collections)) return;

    refs.urgentCollections.innerHTML = collections.map(collection => `
        <div class="dashCobroItem">
            <div class="dashCobroAvatar">${collection.initials || '??'}</div>
            <div class="dashCobroInfo">
                <p class="dashCobroName">${collection.customerName || 'Cliente'}</p>
                <p class="dashCobroSub">${collection.description || 'Descripción'}</p>
            </div>
            <div class="dashCobroRight">
                <p class="dashCobroAmt">${formatWithCommas(collection.amountDue || 0)}</p>
                <p class="dashCobroDays ${collection.daysWithoutPayment > 30 ? 'dashCobroDaysCritical' : 'dashCobroDaysWarning'}">${collection.delayText || 'Sin abono'}</p>
            </div>
        </div>
    `).join('');
};
