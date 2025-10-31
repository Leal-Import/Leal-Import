'use strict';

let nav = document.getElementById('sidebar');

nav.innerHTML = ` <div class="btnNavbarContainer">
                <button id="btnNavbar" class="btnNavbarOpen">
                    <img src="../media/appMedia/arrow.svg" alt="" class="btnNavbarIcon">
                </button>
            </div>
            <div class="navbarContainer">
                <div class="navbar">
                    <div class="navHeader">
                        <div class="logoContainer widthOpenItems">
                            <img src="" alt="" class="logo" id="logo">
                        </div>
                    </div>
                    <div class="navBody">
                        <nav class="navbarItemsContainer widthOpenItems">
                            <a href="../pages/dashboard.html" style="margin-top: 0;" class="navbarItem itemNav" id="dashItem">
                                <img src="../media/sidebarMedia/dashboard.svg" alt="" class="navbarIcon">
                                <span class="navbarText navTextVisible">Inicio</span>
                            </a>
                            <a href="../pages/employees.html" class="navbarItem itemNav" id="trnItem">
                                <img src="../media/sidebarMedia/Empleados.svg" alt="" class="navbarIcon">
                                <span class="navbarText navTextVisible">Empleados</span>
                            </a>
                            <a href="../pages/customers.html" class="navbarItem itemNav" id="eppItem">
                                <img src="../media/sidebarMedia/Clientes.svg" alt="" class="navbarIcon">
                                <span class="navbarText navTextVisible">Clientes</span>
                            </a>
                            <a href="../pages/vehicle.html" class="navbarItem itemNav" id="empItem">
                                <img src="../media/sidebarMedia/Vehiculos.svg" alt="" class="navbarIcon">
                                <span class="navbarText navTextVisible">Vehículos</span>
                            </a>
                            <a href="../pages/spareParts.html" class="navbarItem itemNav" id="empItem">
                                <img src="../media/sidebarMedia/Repuestos.svg" alt="" class="navbarIcon">
                                <span class="navbarText navTextVisible">Repuestos</span>
                            </a>
                            <a href="../pages/workOrders.html" class="navbarItem itemNav" id="accItem">
                                <img src="../media/sidebarMedia/Ordenes.svg" alt="" class="navbarIcon">
                                <span class="navbarText navTextVisible">Ordenes</span>
                            </a>
                            <a href="../pages/configuration.html" class="navbarItem itemNav" id="accItem">
                                <img src="../media/sidebarMedia/Configuracion.svg" alt="" class="navbarIcon">
                                <span class="navbarText navTextVisible">Configuración</span>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>`;
const menuItems = document.querySelectorAll(".navbarItem");
const itemsNav = document.querySelectorAll(".itemNav");
let logo = document.getElementById('logo');
let navbarContainer = document.getElementById('sidebar');
let bodyContainer = document.querySelector('.navbarContainer')
let userContainer = document.querySelector('.userContainer');
let btnNavbarContainer = document.querySelector('.btnNavbarContainer');
let navbarItemsContainer = document.querySelector('.navbarItemsContainer');
let navTextVisible = document.querySelectorAll('.navTextVisible');

itemsNav.forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        if (item.classList.contains("sumbenuItem")) {
            localStorage.setItem("navItem", "empItem")
        }
        else {
            localStorage.setItem("navItem", item.id);
        }
        window.location.href = item.href;
    })
})

itemsNav.forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("navItem", item.id);
        window.location.href = item.href;
    })
})

// <<< NEW: referencias que usas más abajo y faltaban
const btnNavbar = document.getElementById('btnNavbar');
// btnSubMenu and submenu removed as groupItems/submenu are gone

// <<< NEW: claves para persistir estado
const STORAGE_KEY = 'riskor.sidebar.collapsed';     // '1' = cerrado, '0' = abierto
// SUBMENU_KEY removed

// <<< NEW: aplica estado colapsado según el ancho actual
function applyCollapsed(collapsed) {
    const isMobile = window.innerWidth < 1225;

    if (isMobile) {
        // móvil
        navbarContainer.classList.add('navbarClose');
        navbarContainer.classList.add('navbarResponsive');

        if (!collapsed) {
            btnNavbarContainer.classList.remove('btnNavbarContainerClose');
            btnNavbarContainer.classList.add('btnNavbarContainerOpen');
            navbarContainer.classList.remove('navCloseResponsive');
            navbarContainer.classList.add('navbarOpen');
            btnNavbar.classList.remove('rotate180');
        } else {
            btnNavbarContainer.classList.add('btnNavbarContainerClose');
            btnNavbarContainer.classList.remove('btnNavbarContainerOpen');
            navbarContainer.classList.add('navCloseResponsive');
            navbarContainer.classList.remove('navbarOpen');
            btnNavbar.classList.add('rotate180');
        }

        // restablecer estilos “abreviados”
        logo.classList.remove('logoShort');
        logo.setAttribute('src', '../media/sidebar/newRiskorLogo.svg');
        menuItems.forEach(i => i.classList.remove('navbarItemClose'));
        navTextVisible.forEach(i => i.classList.remove('hideText'));
    } else {
        // desktop
        navbarContainer.classList.remove('navbarResponsive');
        navbarContainer.classList.remove('navCloseResponsive');
        btnNavbarContainer.classList.remove('btnNavbarContainerClose')
        btnNavbarContainer.classList.remove('btnNavbarContainerOpen');

        if (collapsed) {
            logo.classList.add('logoShort');
            logo.setAttribute('src', '../media/sidebar/shortLogo.svg');
            menuItems.forEach(i => i.classList.add('navbarItemClose'));
            navTextVisible.forEach(i => i.classList.add('hideText'));
            // submenu/button references removed
            navbarContainer.classList.remove('navbarOpen');
            navbarContainer.classList.add('navbarClose');
            btnNavbar.classList.add('rotate180');
        } else {
            logo.classList.remove('logoShort');
            logo.setAttribute('src', '../media/sidebar/newRiskorLogo.svg');
            menuItems.forEach(i => i.classList.remove('navbarItemClose'));
            navTextVisible.forEach(i => i.classList.remove('hideText'));
            // submenu/button references removed
            navbarContainer.classList.remove('navbarClose');
            navbarContainer.classList.add('navbarOpen');
            btnNavbar.classList.remove('rotate180');
        }
    }
}

// <<< NEW: lee y aplica estado guardado (llámalo tras tu verificación de responsive)
async function restoreState() {
    const collapsed = localStorage.getItem(STORAGE_KEY) === '1';
    applyCollapsed(collapsed);

    // submenu handling removed
}

/*Este codigo sirve para mostrar la barrita a la izquierda del item o apartado seleccionado*/
menuItems.forEach(item => {
    item.addEventListener("click", (e) => {
        menuItems.forEach(el => el.classList.remove("activeNavbarItem"));
        item.classList.add("activeNavbarItem");
    });
});

/*Submenu related code removed*/

/*Este codigo sirve para mostrar y ocultar el navbar*/
btnNavbar.addEventListener('click', () => {
    if (window.innerWidth < 1225) {
        if (btnNavbarContainer.classList.contains('btnNavbarContainerOpen')) {
            btnNavbarContainer.classList.remove('btnNavbarContainerOpen');
            btnNavbarContainer.classList.add('btnNavbarContainerClose');
        } else {
            btnNavbarContainer.classList.add('btnNavbarContainerOpen');
            btnNavbarContainer.classList.remove('btnNavbarContainerClose');
        }
        if (navbarContainer.classList.contains('navCloseResponsive')) {
            navbarContainer.classList.replace('navCloseResponsive', 'navbarOpen');
        } else {
            navbarContainer.classList.replace('navbarOpen', 'navCloseResponsive');
        }
        navbarContainer.classList.add('navbarClose');
    } else if (window.innerWidth >= 1225) {
        navbarItemsContainer.classList.toggle('navPadding');
        if (navbarContainer.classList.contains('navbarOpen')) {
            logo.classList.add('logoShort');
            logo.setAttribute('src', '../media/sidebar/shortLogo.svg');
            menuItems.forEach(item => item.classList.add('navbarItemClose'));
            navTextVisible.forEach(item => item.classList.add('hideText'));
            // submenu/button references removed
            menuItems.forEach(item => item.classList.remove("activeNavbarItem"));
            navbarContainer.classList.replace('navbarOpen', 'navbarClose');
        } else {
            logo.classList.remove('logoShort');
            logo.setAttribute('src', '../media/sidebar/newRiskorLogo.svg');
            menuItems.forEach(item => item.classList.remove('navbarItemClose'));
            navTextVisible.forEach(item => item.classList.remove('hideText'));
            // submenu/button references removed
            bodyContainer.classList.replace('navbarClose', 'navbarOpen');
            navbarContainer.classList.replace('navbarClose', 'navbarOpen');
        }
    }
    btnNavbar.classList.toggle('rotate180');

    // <<< NEW: guarda el estado actual (después de aplicar cambios)
    const collapsedNow =
        !navbarContainer.classList.contains('navbarOpen') ||
        navbarContainer.classList.contains('navCloseResponsive');
    localStorage.setItem(STORAGE_KEY, collapsedNow ? '1' : '0');
});


window.addEventListener('DOMContentLoaded', async () => {
    await restoreState();                 // <<< NEW: aplica lo guardado
    requestAnimationFrame(() => {
        document.documentElement.classList.add('ui-ready');
    });
    document.body.classList.add('sidebar-ready');
});

addEventListener('resize', () => {
    // <<< NEW: re-aplica el estado guardado cuando cambie de breakpoint
    const collapsed = localStorage.getItem(STORAGE_KEY) === '1';
    applyCollapsed(collapsed);
});

logo.addEventListener('click', () => {
    window.location.href = '../pages/dashboard.html';
});

// Scrollbar de .navBody: fade in/out al usarlo (sin mover el layout)
(() => {
    const el = document.querySelector('.navBody');
    if (!el) return;

    // inicio oculto
    el.classList.add('sb-idle');           // Firefox: color transparente
    el.style.setProperty('--sb-op', '0');   // WebKit: opacidad 0

    let t;
    const HIDE_MS = 600;

    const show = () => {
        el.classList.remove('sb-idle');        // Firefox: visible
        el.style.setProperty('--sb-op', '1');   // WebKit: fade-in
        clearTimeout(t);
        t = setTimeout(() => {
            el.classList.add('sb-idle');         // Firefox: oculto
            el.style.setProperty('--sb-op', '0'); // WebKit: fade-out
        }, HIDE_MS);
    };

    ['scroll', 'wheel', 'mouseenter', 'touchmove', 'pointerdown'].forEach(evt =>
        el.addEventListener(evt, show, { passive: true })
    );
})();