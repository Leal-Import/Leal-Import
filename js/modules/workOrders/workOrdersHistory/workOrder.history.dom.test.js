import { describe, expect, test, vi } from 'vitest';
import { insertWorkOrderHistory } from './workOrder.history.dom.js';

describe('work-order history rendering', () => {
    test('renders short responsive labels for each history field', () => {
        document.body.innerHTML = '<table id="tableHistory"><tbody id="woDetailsTBody"></tbody></table>';
        const body = document.getElementById('woDetailsTBody');
        const table = document.getElementById('tableHistory');

        insertWorkOrderHistory(body, [{
            employeeName: 'Ana López',
            customerName: 'Carlos Mejía',
            estimatedDate: '10 nov 2026',
            statusName: 'Pendiente',
            repairCost: 1500,
            amountDue: 500
        }], vi.fn(), table);

        const labels = [...body.querySelectorAll('td')].map(cell => cell.dataset.label);
        expect(labels).toEqual(['Empleado', 'Cliente', 'Fecha', 'Estado', 'Costo', 'Debe', 'Acción']);
        expect(body.querySelector('.tableResponsiveAction button')?.getAttribute('aria-label')).toBe('Acciones de la orden');
    });
});
