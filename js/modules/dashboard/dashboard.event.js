import { periodApiToInternal } from './dashboard.logic.js';

export const initDashboardEvents = (refs, { onPeriodChange }) => {
    refs.periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Feedback inmediato
            refs.periodBtns.forEach(b => b.classList.remove('dashPeriodBtnActive'));
            btn.classList.add('dashPeriodBtnActive');
            const selectedPeriod = btn.dataset.period || 'MONTH';
            const internalPeriod = periodApiToInternal[selectedPeriod] || 'mes';
            onPeriodChange(internalPeriod);
        });
    });
};
