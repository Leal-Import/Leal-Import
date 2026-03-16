export const createPagination = ({
    initialSize = 10,
    onChange
}) => {

    const container = document.querySelector('.paginationContainer');
    const infoEl = container.querySelector('.paginationInfo');
    const sizeSelect = container.querySelector('.pageSize select');
    const pagesContainer = container.querySelector('.paginationRight');

    const state = {
        page: 1,
        size: initialSize,
        totalElements: 0,
        totalPages: 1,
        filters: {}
    };

    /* ==============================
       PUBLIC API
    ============================== */

    const update = ({ page, size, filters } = {}) => {
        if (page !== undefined) state.page = page;
        if (size !== undefined) state.size = size;
        if (filters !== undefined) state.filters = filters;

        onChange({
            page: state.page,
            size: state.size,
            filters: state.filters
        });
    };

    const setTotal = ({ totalElements, totalPages, page, size }) => {
        state.totalElements = totalElements;
        state.totalPages = totalPages;
        state.page = page;
        state.size = size;
        render();
    };

    /* ==============================
       RENDER
    ============================== */

    const render = () => {
        renderInfo();
        renderPages();
        syncSizeSelect();
    };

    const renderInfo = () => {
        if (!state.totalElements) {
            infoEl.innerHTML = 'Mostrando <strong>0</strong> resultados';
            return;
        }

        const start = (state.page - 1) * state.size + 1;
        const end = Math.min(start + state.size - 1, state.totalElements);

        infoEl.innerHTML = `
            Mostrando <strong>${start}–${end}</strong> de 
            <strong>${state.totalElements}</strong> resultados
        `;
    };

    const renderPages = () => {
        pagesContainer.innerHTML = '';

        pagesContainer.appendChild(createNavButton('‹', state.page === 1, () => {
            update({ page: state.page - 1 });
        }));
        const pages = getVisiblePages(state.page, state.totalPages);

        pages.forEach(p => {
            if (p === '...') {
                const dots = document.createElement('span');
                dots.className = 'pageDots';
                dots.textContent = '…';
                pagesContainer.appendChild(dots);
            } else {
                const btn = document.createElement('button');
                btn.className = 'pageBtn';
                if (p === state.page) btn.classList.add('active');
                btn.textContent = p;
                btn.onclick = () => update({ page: p });
                pagesContainer.appendChild(btn);
            }
        });

        pagesContainer.appendChild(createNavButton('›', state.page === state.totalPages, () => {
            update({ page: state.page + 1 });
        }));
    };

    const createNavButton = (label, disabled, onClick) => {
        const btn = document.createElement('button');
        btn.className = 'pageBtn';
        btn.textContent = label;
        btn.disabled = disabled;
        btn.onclick = onClick;
        return btn;
    };

    /* ==============================
       PAGE LOGIC (1 2 3 … 10)
    ============================== */

    const getVisiblePages = (current, total) => {
        if (total <= 6) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, '...', total];
        }

        if (current >= total - 2) {
            return [1, '...', total - 2, total - 1, total];
        }

        return [
            1,
            '...',
            current - 1,
            current,
            current + 1,
            '...',
            total
        ];
    };

    /* ==============================
       PAGE SIZE
    ============================== */

    const syncSizeSelect = () => {
        sizeSelect.value = state.size;
    };
    sizeSelect.addEventListener('change', () => {
        update({
            page: 1,
            size: parseInt(sizeSelect.value, 10)
        });
    });

    /* ==============================
       INIT
    ============================== */

    state.size = initialSize;

    return {
        update,
        setTotal
    };
};

