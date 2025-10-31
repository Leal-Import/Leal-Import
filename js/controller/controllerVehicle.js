import {
    setupModal
} from '../utils.js';
// Configurar el modal para agregar Vehículos
setupModal("#OpenModalVehicles", "#modalVehicle", "#closeAddVehicle");

const ctx = document.getElementById('vehicleChart').getContext('2d');

const data = {
  labels: ['Vendido', 'En stock'],
  datasets: [{
    data: [50, 6], // 🔹 Puedes cambiar estos valores dinámicamente desde tu base de datos
    backgroundColor: ['#D31813', '#E4B9B8'],
    hoverOffset: 10,
    borderWidth: 0
  }]
};

new Chart(ctx, {
  type: 'doughnut',
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