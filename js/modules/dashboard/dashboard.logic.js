export const dashPeriods = {
    hoy: {
        k: ['6', '49', '$18,420', '1'],
        c: ['+5%', 'up', '+2%', 'up', '+1%', 'down', '±0%', 'flat'],
        labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'],
        vals: [800, 1200, 900, 1500, 700, 420],
        sub: 'Horas del día'
    },
    semana: {
        k: ['18', '45', '$18,420', '3'],
        c: ['+12%', 'up', '+5%', 'up', '+3%', 'down', '+2%', 'up'],
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        vals: [3200, 4100, 2800, 5200, 4300, 1800],
        sub: 'Días de la semana'
    },
    mes: {
        k: ['38', '40', '$18,420', '5'],
        c: ['+18%', 'up', '+8%', 'up', '+3%', 'down', '±0%', 'flat'],
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        vals: [12400, 15800, 13200, 11803],
        sub: 'Semanas del mes'
    },
    año: {
        k: ['284', '60', '$18,420', '42'],
        c: ['+31%', 'up', '+19%', 'up', '+2%', 'down', '+8%', 'up'],
        labels: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        vals: [28400, 42100, 53203, 31200, 28400, 25800, 31200, 27400, 24800, 22100, 26400, null],
        sub: 'Meses del año'
    }
};

export const getChipClass = (type) => {
    const classes = { up: 'dashChipUp', down: 'dashChipDown', flat: 'dashChipFlat' };
    return 'dashChip ' + (classes[type] || 'dashChipFlat');
};