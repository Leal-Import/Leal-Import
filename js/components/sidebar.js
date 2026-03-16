'use strict';

const loadSidebar = () => {
    const nav = document.getElementById('sidebar');
    nav.innerHTML = `
    <div class="navbarContainer">
        <div class="navbar">

            <div class="navHeader">
                <div class="logoContainer">
                    <img src="" alt="Logo" class="logo" id="logo">
                    <span class="logoWordmark" id="logoWordmark">Ris<span>kor</span></span>
                </div>
                <button id="btnNavbar" title="Toggle sidebar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>

            <div class="navBody">
                <nav class="navbarItemsContainer">

                    <div class="navSection">
                        <div class="navSectionLabel">Menu</div>
                    </div>

                    <a href="../pages/dashboard.html" class="navbarItem itemNav" id="dashItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                            </svg>
                        </div>
                        <span class="navbarText">Inicio</span>
                        <span class="navTooltip">Inicio</span>
                    </a>

                    <a href="../pages/employees.html" class="navbarItem itemNav" id="empItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <span class="navbarText">Empleados</span>
                        <span class="navTooltip">Empleados</span>
                    </a>

                    <a href="../pages/customers.html" class="navbarItem itemNav" id="clientItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <span class="navbarText">Clientes</span>
                        <span class="navTooltip">Clientes</span>
                    </a>

                    <a href="../pages/vehicle.html" class="navbarItem itemNav" id="vehicleItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="5.5" cy="17.5" r="2.5"/>
                                <circle cx="18.5" cy="17.5" r="2.5"/>
                                <path d="M15 6H2v11h1.5"/>
                                <path d="M3 6l2-4h10l2 4"/>
                                <path d="M15 6h4l3 4v4h-1.5"/>
                            </svg>
                        </div>
                        <span class="navbarText">Vehiculos</span>
                        <span class="navTooltip">Vehiculos</span>
                    </a>

                    <a href="../pages/spareParts.html" class="navbarItem itemNav" id="spareItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                            </svg>
                        </div>
                        <span class="navbarText">Repuestos</span>
                        <span class="navTooltip">Repuestos</span>
                    </a>

                    <div class="navDivider"></div>

                    <div class="navSection">
                        <div class="navSectionLabel">Comercial</div>
                    </div>

                    <a href="../pages/sales.html" class="navbarItem itemNav" id="salesItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                        <span class="navbarText">Ventas</span>
                        <span class="navTooltip">Ventas</span>
                    </a>

                    <a href="../pages/workOrders.html" class="navbarItem itemNav" id="orderItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                        </div>
                        <span class="navbarText">Ordenes</span>
                        <span class="navTooltip">Ordenes</span>
                    </a>

                    <div class="navDivider"></div>

                    <div class="navSection">
                        <div class="navSectionLabel">Sistema</div>
                    </div>

                    <a href="../pages/configuration.html" class="navbarItem itemNav" id="configItem">
                        <div class="navIconWrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                        </div>
                        <span class="navbarText">Configuracion</span>
                        <span class="navTooltip">Configuracion</span>
                    </a>

                </nav>
            </div>

            <div class="navFooter">
                <div class="userCard">
                    <div class="sidebarUserAvatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="userInfo">
                        <div class="userName" id="userName">Usuario</div>
                        <div class="userRole" id="userRole">Rol</div>
                    </div>
                </div>
            </div>

        </div>
    </div>`;
};

const loadMobileHeader = () => {
    const mobileHeader = document.querySelector(".containerMobileHeader");
    mobileHeader.innerHTML = `                
                <div class="mobileHeader">
                    <button class="menuToggle" id="menuToggle" aria-label="Toggle menu" type="button">☰</button>
                    <div class="mobileHeaderLogo">Ris<span>kor</span></div>
                    <div style="width: 40px;"></div>
                </div>`;
};

const REFS = {
    sidebar: null,
    btnNavbar: null,
    logo: null,
    menuItems: null,
    itemsNav: null,
    menuToggle: null,
    STORAGE_KEY: null
};

const initReferences = () => {
    REFS.sidebar = document.getElementById('sidebar');
    REFS.btnNavbar = document.getElementById('btnNavbar');
    REFS.logo = document.getElementById('logo');
    REFS.menuItems = document.querySelectorAll('.navbarItem');
    REFS.itemsNav = document.querySelectorAll('.itemNav');
    REFS.menuToggle = document.getElementById('menuToggle');
    REFS.STORAGE_KEY = 'riskor.sidebar.collapsed';
};

const isMobile = () => window.innerWidth < 1225;

/*
 * APLICA EL ESTADO COLAPSADO SINCRÓNICAMENTE
 */
const applyInitialState = () => {
    const collapsed = localStorage.getItem(REFS.STORAGE_KEY);

    if (isMobile()) {
        // En móvil: cerrar por defecto si es primera carga
        if (collapsed === null) {
            REFS.sidebar.classList.add('navMobileHidden');
            localStorage.setItem(REFS.STORAGE_KEY, '1');
        } else if (collapsed === '1') {
            REFS.sidebar.classList.add('navMobileHidden');
        }
    } else {
        // En desktop: aplicar estado colapsado si existe
        if (collapsed === '1') {
            REFS.sidebar.classList.add('navbarCollapsed');
            REFS.btnNavbar.classList.add('rotate180');
            REFS.btnNavbar.classList.add('btnNavClose');
        }
    }
};

/* --- Helper general applyState (para toggle y resize) --- */
const applyState = (collapsed) => {
    if (isMobile()) {
        REFS.sidebar.classList.remove('navbarCollapsed');
        REFS.sidebar.classList.toggle('navMobileHidden', collapsed);
    } else {
        REFS.sidebar.classList.remove('navMobileHidden');
        REFS.sidebar.classList.toggle('navbarCollapsed', collapsed);
    }
    REFS.btnNavbar.classList.toggle('rotate180', collapsed);
    REFS.btnNavbar.classList.toggle('btnNavClose', collapsed);
};

/* --- Restaura el item activo --- */
const restoreActiveItem = () => {
    const savedId = localStorage.getItem('navItem');
    REFS.menuItems.forEach(el => el.classList.remove('activeNavbarItem'));
    if (savedId) {
        const active = document.getElementById(savedId);
        if (active) active.classList.add('activeNavbarItem');
    }
};

const initEvents = () => {
    /* --- Click en item: marca activo --- */
    REFS.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            REFS.menuItems.forEach(el => el.classList.remove('activeNavbarItem'));
            item.classList.add('activeNavbarItem');
        });
    });

    /* --- Navegacion --- */
    REFS.itemsNav.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem('navItem', item.id);
            window.location.href = item.href;
        });
    });

    /* --- Boton toggle DESKTOP (dentro del sidebar) --- */
    REFS.btnNavbar.addEventListener('click', () => {
        if (isMobile()) {
            return; // No hacer nada en móvil
        } else {
            const isCollapsed = REFS.sidebar.classList.toggle('navbarCollapsed');
            REFS.btnNavbar.classList.toggle('rotate180', isCollapsed);
            REFS.btnNavbar.classList.toggle('btnNavClose', isCollapsed);
            localStorage.setItem(REFS.STORAGE_KEY, isCollapsed ? '1' : '0');
        }
    });

    /* --- Boton hamburguesa MÓVIL (en el header) --- */
    if (REFS.menuToggle) {
        REFS.menuToggle.addEventListener('click', () => {
            const isHidden = REFS.sidebar.classList.toggle('navMobileHidden');
            localStorage.setItem(REFS.STORAGE_KEY, isHidden ? '1' : '0');
        });
    }

    /* --- Clic en overlay movil: cierra sidebar --- */
    REFS.sidebar.addEventListener('click', e => {
        if (!isMobile()) return;
        if (e.target === REFS.sidebar) {
            REFS.sidebar.classList.add('navMobileHidden');
            localStorage.setItem(REFS.STORAGE_KEY, '1');
        }
    });

    /* --- Resize: re-aplica el estado guardado para el nuevo breakpoint --- */
    window.addEventListener('resize', () => {
        const collapsed = localStorage.getItem(REFS.STORAGE_KEY) === '1';
        applyState(collapsed);
    });

    /* --- Logo click --- */
    REFS.logo.addEventListener('click', () => {
        window.location.href = '../pages/dashboard.html';
    });
};

/* --- DOMContentLoaded --- */
window.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    loadMobileHeader();
    initReferences();
    restoreActiveItem();

    // Aplicar estado inicial ANTES de mostrar la UI
    applyInitialState();

    /*
    * Activar transiciones DESPUES de que el estado ya esta aplicado
    */
    requestAnimationFrame(() => {
        document.body.classList.add('sidebar-ready');
        requestAnimationFrame(() => {
            document.documentElement.classList.add('ui-ready');
        });
    });

    initEvents();
});

/* --- Scrollbar navBody: fade in/out --- */
(function initScrollbarFade() {
    setTimeout(() => {
        const el = document.querySelector('.navBody');
        if (!el) return;

        el.classList.add('sb-idle');
        el.style.setProperty('--sb-op', '0');

        let t;
        const HIDE_MS = 800;

        const show = () => {
            el.classList.remove('sb-idle');
            el.style.setProperty('--sb-op', '1');
            clearTimeout(t);
            t = setTimeout(() => {
                el.classList.add('sb-idle');
                el.style.setProperty('--sb-op', '0');
            }, HIDE_MS);
        };

        ['scroll', 'wheel', 'mouseenter', 'touchmove', 'pointerdown'].forEach(evt =>
            el.addEventListener(evt, show, { passive: true })
        );
    }, 100);
})();
