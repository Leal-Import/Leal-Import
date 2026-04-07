import { canAccess } from '../utils/privilegesValidator.js';
import { getCurrentEmployee } from '../utils/api.utils.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const createSvgElement = (tag, attrs = {}) => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
    return element;
};

const createSvgIcon = (viewBox, pathData, strokeWidth = '1.8') => {
    const svg = createSvgElement('svg', {
        viewBox,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': strokeWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });

    pathData.forEach(({ tag, attrs }) => {
        const child = createSvgElement(tag, attrs);
        svg.appendChild(child);
    });

    return svg;
};

const createNavItem = (href, id, text, icon) => {
    const link = document.createElement('a');
    link.href = href;
    link.className = 'navbarItem itemNav';
    link.id = id;

    const iconWrap = document.createElement('div');
    iconWrap.className = 'navIconWrap';
    iconWrap.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'navbarText';
    label.textContent = text;

    const tooltip = document.createElement('span');
    tooltip.className = 'navTooltip';
    tooltip.textContent = text;

    link.appendChild(iconWrap);
    link.appendChild(label);
    link.appendChild(tooltip);

    return link;
};

const createSectionLabel = (text) => {
    const section = document.createElement('div');
    section.className = 'navSection';
    const label = document.createElement('div');
    label.className = 'navSectionLabel';
    label.textContent = text;
    section.appendChild(label);
    return section;
};

const createDivider = () => {
    const divider = document.createElement('div');
    divider.className = 'navDivider';
    return divider;
};

const createSidebar = () => {
    const navbarContainer = document.createElement('div');
    navbarContainer.className = 'navbarContainer';

    const navbar = document.createElement('div');
    navbar.className = 'navbar';

    const navHeader = document.createElement('div');
    navHeader.className = 'navHeader';

    const logoContainer = document.createElement('div');
    logoContainer.className = 'logoContainer';

    const logoImg = document.createElement('img');
    logoImg.src = '../media/appMedia/Logo Lealimport.png';
    logoImg.alt = 'Logo';
    logoImg.className = 'logo';
    logoImg.id = 'logo';

    const logoWordmark = document.createElement('span');
    logoWordmark.className = 'logoWordmark';
    logoWordmark.id = 'logoWordmark';
    logoWordmark.textContent = 'Leal ';

    const logoWordmarkSpan = document.createElement('span');
    logoWordmarkSpan.textContent = 'import';
    logoWordmark.appendChild(logoWordmarkSpan);

    logoContainer.appendChild(logoImg);
    logoContainer.appendChild(logoWordmark);

    const btnNavbar = document.createElement('button');
    btnNavbar.id = 'btnNavbar';
    btnNavbar.title = 'Toggle sidebar';
    btnNavbar.type = 'button';
    btnNavbar.appendChild(createSvgIcon('0 0 24 24', [
        { tag: 'polyline', attrs: { points: '15 18 9 12 15 6' } }
    ], '2.5'));

    navHeader.appendChild(logoContainer);
    navHeader.appendChild(btnNavbar);

    const navBody = document.createElement('div');
    navBody.className = 'navBody';

    const navbarItems = document.createElement('nav');
    navbarItems.className = 'navbarItemsContainer';

    const sidebarSections = [
        {
            section: 'Menu',
            items: [
                {
                    href: '../pages/dashboard.html',
                    id: 'dashItem',
                    text: 'Inicio',
                    iconData: [
                        { tag: 'rect', attrs: { x: '3', y: '3', width: '7', height: '7', rx: '1.5' } },
                        { tag: 'rect', attrs: { x: '14', y: '3', width: '7', height: '7', rx: '1.5' } },
                        { tag: 'rect', attrs: { x: '3', y: '14', width: '7', height: '7', rx: '1.5' } },
                        { tag: 'rect', attrs: { x: '14', y: '14', width: '7', height: '7', rx: '1.5' } }
                    ],
                    requiredPrivileges: []
                },
                {
                    href: '../pages/employees.html',
                    id: 'empItem',
                    text: 'Empleados',
                    iconData: [
                        { tag: 'path', attrs: { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' } },
                        { tag: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
                        { tag: 'path', attrs: { d: 'M23 21v-2a4 4 0 0 0-3-3.87' } },
                        { tag: 'path', attrs: { d: 'M16 3.13a4 4 0 0 1 0 7.75' } }
                    ],
                    requiredPrivileges: ['READ_EMPLOYEES', 'WRITE_EMPLOYEES']
                },
                {
                    href: '../pages/customers.html',
                    id: 'clientItem',
                    text: 'Clientes',
                    iconData: [
                        { tag: 'path', attrs: { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' } },
                        { tag: 'circle', attrs: { cx: '12', cy: '7', r: '4' } }
                    ],
                    requiredPrivileges: ['READ_CUSTOMERS', 'WRITE_CUSTOMERS']
                },
                {
                    href: '../pages/vehicle.html',
                    id: 'vehicleItem',
                    text: 'Vehiculos',
                    iconData: [
                        { tag: 'circle', attrs: { cx: '5.5', cy: '17.5', r: '2.5' } },
                        { tag: 'circle', attrs: { cx: '18.5', cy: '17.5', r: '2.5' } },
                        { tag: 'path', attrs: { d: 'M15 6H2v11h1.5' } },
                        { tag: 'path', attrs: { d: 'M3 6l2-4h10l2 4' } },
                        { tag: 'path', attrs: { d: 'M15 6h4l3 4v4h-1.5' } }
                    ],
                    requiredPrivileges: ['READ_VEHICLES', 'WRITE_VEHICLES']
                },
                {
                    href: '../pages/spareParts.html',
                    id: 'spareItem',
                    text: 'Repuestos',
                    iconData: [
                        { tag: 'path', attrs: { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' } }
                    ],
                    requiredPrivileges: ['READ_SPAREPARTS', 'WRITE_SPAREPARTS']
                }
            ]
        },
        {
            divider: true
        },
        {
            section: 'Comercial',
            items: [
                {
                    href: '../pages/sales.html',
                    id: 'salesItem',
                    text: 'Ventas',
                    iconData: [
                        { tag: 'line', attrs: { x1: '12', y1: '1', x2: '12', y2: '23' } },
                        { tag: 'path', attrs: { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' } }
                    ],
                    requiredPrivileges: ['READ_SALES', 'WRITE_SALES']
                },
                {
                    href: '../pages/workOrders.html',
                    id: 'orderItem',
                    text: 'Ordenes',
                    iconData: [
                        { tag: 'path', attrs: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' } },
                        { tag: 'polyline', attrs: { points: '14 2 14 8 20 8' } },
                        { tag: 'line', attrs: { x1: '16', y1: '13', x2: '8', y2: '13' } },
                        { tag: 'line', attrs: { x1: '16', y1: '17', x2: '8', y2: '17' } },
                        { tag: 'polyline', attrs: { points: '10 9 9 9 8 9' } }
                    ],
                    requiredPrivileges: ['READ_WORK_ORDERS', 'WRITE_WORK_ORDERS']
                }
            ]
        },
        {
            divider: true
        },
        {
            section: 'Sistema',
            items: [
                {
                    href: '../pages/configuration.html',
                    id: 'configItem',
                    text: 'Configuracion',
                    iconData: [
                        { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
                        { tag: 'path', attrs: { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' } }
                    ]
                }
            ]
        }
    ];

    sidebarSections.forEach((section) => {
        if (section.items) {
            const visibleItems = section.items.filter((item) => canAccess(item.requiredPrivileges));

            if (visibleItems.length > 0) {
                navbarItems.appendChild(createSectionLabel(section.section));
                visibleItems.forEach((item) => {
                    navbarItems.appendChild(createNavItem(item.href, item.id, item.text, createSvgIcon('0 0 24 24', item.iconData)));
                });
            }

            return;
        }

        if (section.divider) {
            navbarItems.appendChild(createDivider());
        }
    });

    const navFooter = document.createElement('div');
    navFooter.className = 'navFooter';

    const userCard = document.createElement('div');
    userCard.className = 'userCard';

    const userAvatar = document.createElement('div');
    userAvatar.className = 'sidebarUserAvatar';
    userAvatar.appendChild(createSvgIcon('0 0 24 24', [
        { tag: 'path', attrs: { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' } },
        { tag: 'circle', attrs: { cx: '12', cy: '7', r: '4' } }
    ], '2'));

    const userInfo = document.createElement('div');
    userInfo.className = 'userInfo';

    const userName = document.createElement('div');
    userName.className = 'userName';
    userName.id = 'userName';
    userName.textContent = 'Usuario';

    const userRole = document.createElement('div');
    userRole.className = 'userRole';
    userRole.id = 'userRole';
    userRole.textContent = 'Rol';

    userInfo.appendChild(userName);
    userInfo.appendChild(userRole);

    userCard.appendChild(userAvatar);
    userCard.appendChild(userInfo);
    navFooter.appendChild(userCard);

    navbar.appendChild(navHeader);
    navBody.appendChild(navbarItems);
    navbar.appendChild(navBody);
    navbar.appendChild(navFooter);
    navbarContainer.appendChild(navbar);

    return navbarContainer;
};

const createMobileHeader = () => {
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobileHeader';

    const menuToggle = document.createElement('button');
    menuToggle.className = 'menuToggle';
    menuToggle.id = 'menuToggle';
    menuToggle.type = 'button';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    menuToggle.textContent = '☰';

    const mobileHeaderLogo = document.createElement('div');
    mobileHeaderLogo.className = 'mobileHeaderLogo';
    mobileHeaderLogo.textContent = 'Menu';

    const spacer = document.createElement('div');
    spacer.style.width = '40px';

    mobileHeader.appendChild(menuToggle);
    mobileHeader.appendChild(mobileHeaderLogo);
    mobileHeader.appendChild(spacer);

    return mobileHeader;
};

// ═══════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════

const STORAGE_KEY = 'app.sidebar.collapsed';
const STORAGE_NAV = 'navItem';

// ═══════════════════════════════════════
// REFERENCIAS (encapsuladas — no globales)
// ═══════════════════════════════════════

let refs = {};

const initReferences = () => {
    refs = {
        sidebar: document.getElementById('sidebar'),
        btnNavbar: document.getElementById('btnNavbar'),
        logo: document.getElementById('logo'),
        menuItems: document.querySelectorAll('.navbarItem'),
        itemsNav: document.querySelectorAll('.itemNav'),
        menuToggle: document.getElementById('menuToggle'),
        userName: document.getElementById('userName'),
        userRole: document.getElementById('userRole')
    };
};

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

const isMobile = () => window.innerWidth < 1225;

const isCollapsed = () => localStorage.getItem(STORAGE_KEY) === '1';

const saveCollapsed = (value) => localStorage.setItem(STORAGE_KEY, value ? '1' : '0');

// ═══════════════════════════════════════
// ESTADO DEL SIDEBAR
// ═══════════════════════════════════════

const applyState = (collapsed) => {
    if (isMobile()) {
        refs.sidebar.classList.remove('navbarCollapsed');
        refs.sidebar.classList.toggle('navMobileHidden', collapsed);
    } else {
        refs.sidebar.classList.remove('navMobileHidden');
        refs.sidebar.classList.toggle('navbarCollapsed', collapsed);
    }
    refs.btnNavbar.classList.toggle('rotate180', collapsed);
    refs.btnNavbar.classList.toggle('btnNavClose', collapsed);
};

const applyInitialState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (isMobile()) {
        const collapsed = saved === null ? true : saved === '1';
        if (collapsed) refs.sidebar.classList.add('navMobileHidden');
        if (saved === null) saveCollapsed(true);
    } else {
        if (saved === '1') {
            refs.sidebar.classList.add('navbarCollapsed');
            refs.btnNavbar.classList.add('rotate180', 'btnNavClose');
        }
    }
};

// ═══════════════════════════════════════
// ITEM ACTIVO
// ═══════════════════════════════════════

const restoreActiveItem = () => {
    const savedId = localStorage.getItem(STORAGE_NAV);
    refs.menuItems.forEach(el => el.classList.remove('activeNavbarItem'));
    if (!savedId) return;
    const active = document.getElementById(savedId);
    if (active) active.classList.add('activeNavbarItem');
};

// ═══════════════════════════════════════
// USUARIO
// ═══════════════════════════════════════

const loadUserInfo = () => {
    const user = getCurrentEmployee();
    if (refs.userName) refs.userName.textContent = user?.fullName || 'Usuario';
    if (refs.userRole) refs.userRole.textContent = user?.role || 'Rol';
};

// ═══════════════════════════════════════
// EVENTOS
// ═══════════════════════════════════════

let isResizeBound = false;
const onResize = () => applyState(isCollapsed());

const initEvents = () => {

    // Marcar item activo al hacer click
    refs.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            refs.menuItems.forEach(el => el.classList.remove('activeNavbarItem'));
            item.classList.add('activeNavbarItem');
        });
    });

    // Navegación con localStorage
    refs.itemsNav.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem(STORAGE_NAV, item.id);
            window.location.href = item.href;
        });
    });

    // Toggle desktop
    refs.btnNavbar.addEventListener('click', () => {
        if (isMobile()) return;
        const collapsed = refs.sidebar.classList.toggle('navbarCollapsed');
        refs.btnNavbar.classList.toggle('rotate180', collapsed);
        refs.btnNavbar.classList.toggle('btnNavClose', collapsed);
        saveCollapsed(collapsed);
    });

    // Toggle móvil (hamburguesa)
    if (refs.menuToggle) {
        refs.menuToggle.addEventListener('click', () => {
            const hidden = refs.sidebar.classList.toggle('navMobileHidden');
            saveCollapsed(hidden);
        });
    }

    // Cerrar sidebar al click en overlay móvil
    refs.sidebar.addEventListener('click', e => {
        if (!isMobile()) return;
        if (e.target === refs.sidebar) {
            refs.sidebar.classList.add('navMobileHidden');
            saveCollapsed(true);
        }
    });

    // Resize — re-aplica estado al cambiar breakpoint
    if (!isResizeBound) {
        window.addEventListener('resize', onResize);
        isResizeBound = true;
    }

    // Logo — navegar al dashboard
    if (refs.logo) {
        refs.logo.addEventListener('click', () => {
            window.location.href = '../pages/dashboard.html';
        });
    }
};

// ═══════════════════════════════════════
// SCROLLBAR FADE
// ═══════════════════════════════════════

const initScrollbarFade = () => {
    const el = document.querySelector('.navBody');
    if (!el) return;

    el.classList.add('sbIdle');
    el.style.setProperty('--sb-op', '0');

    let timer;
    const HIDE_MS = 800;

    const show = () => {
        el.classList.remove('sbIdle');
        el.style.setProperty('--sb-op', '1');
        clearTimeout(timer);
        timer = setTimeout(() => {
            el.classList.add('sbIdle');
            el.style.setProperty('--sb-op', '0');
        }, HIDE_MS);
    };

    ['scroll', 'wheel', 'mouseenter', 'touchmove', 'pointerdown'].forEach(evt =>
        el.addEventListener(evt, show, { passive: true })
    );
};

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════

export const initSidebar = () => {
    const sidebarContainer = document.getElementById('sidebar');
    if (!sidebarContainer) return;

    sidebarContainer.textContent = '';
    sidebarContainer.appendChild(createSidebar());

    const mobileHeaderContainer = document.querySelector('.containerMobileHeader');
    if (mobileHeaderContainer) {
        mobileHeaderContainer.textContent = '';
        mobileHeaderContainer.appendChild(createMobileHeader());
    }

    // 2. Inicializar referencias
    initReferences();

    // 3. Restaurar estado visual antes de mostrar UI
    restoreActiveItem();
    applyInitialState();
    loadUserInfo();

    // 4. Activar transiciones después de aplicar estado inicial
    requestAnimationFrame(() => {
        document.body.classList.add('sidebarReady');
        requestAnimationFrame(() => {
            document.documentElement.classList.add('uiReady');
        });
    });

    // 5. Inicializar eventos
    initEvents();
    initScrollbarFade();
};
