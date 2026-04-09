export const initDashboardEvents = (refs, { onPeriodChange }) => {
    refs.periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Feedback inmediato
            refs.periodBtns.forEach(b => b.classList.remove('dashPeriodBtnActive'));
            btn.classList.add('dashPeriodBtnActive');
            onPeriodChange(btn.dataset.period || 'mes');
        });
    });
};
