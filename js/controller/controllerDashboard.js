let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
let dataInfo = [200, 300, 1000.23, 500, 700, 600];
const data = {
    labels: months,
    datasets: [{
        data: dataInfo,
        fill: false,
        borderColor: '#D31813',
        tension: 0.1,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBackgroundColor: '#D31813',
        pointBorderColor: '#D31813'
    }]
};

chartInstance = new Chart("earningsChart", {
    type: "line",
    data: data,
    options: {
        responsive: true,
        legend: { display: false }
    }
});


new Chart("sparePartsGraphic", {
  type: 'doughnut',
  data: {
  labels: ['Mecanica', 'Fibra', 'Electrica', 'Otro'],
  datasets: [{
    data: [50, 20, 23, 9], // 🔹 Puedes cambiar estos valores dinámicamente desde tu base de datos
    backgroundColor: ['#D31813', '#E4B9B8', '#FFB235', '#81859E'],
    hoverOffset: 10,
    borderWidth: 0
  }]
},
  options: {
    responsive: true,
    legend: { display: false },
    plugins: {
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

new Chart("ordersGraphic", {
  type: 'doughnut',
  data: {
  labels: ['Pendientes', 'Completadas', 'Atrasadas'],
  datasets: [{
    data: [50, 20, 23], // 🔹 Puedes cambiar estos valores dinámicamente desde tu base de datos
    backgroundColor: ['#FFB235', '#6DBE45', '#D31813'],
    hoverOffset: 10,
    borderWidth: 0
  }]
},
  options: {
    responsive: true,
    legend: { display: false },
    plugins: {
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