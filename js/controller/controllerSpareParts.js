import {
    setupModal
} from '../utils.js';
// Configurar el modal para agregar repuestos
setupModal("#modalParts", "#modalSpareParts", "#closeAddEmployee");

const ctx = document.getElementById('idTotalCost').getContext('2d');

const data = {
    labels: ['Mecánica', 'Eléctrico', 'Fibra'],
    datasets: [{
        label: 'Valor total en inventario ($)',
        data: [12300, 7450, 3800], // 🔹 Puedes cambiar estos valores dinámicamente desde tu base de datos
        backgroundColor: ['#D31813', '#E4B9B8', '#CD908F'],
        hoverOffset: 10,
        borderRadius: 8,
        borderWidth: 0
    }]
};

new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#0D0503',
                bodyColor: '#0D0503',
                borderColor: '#CD908F',
                borderWidth: 1
            }
            
        },
        cutout: '70%',
    }
});