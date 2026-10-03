export const getChipClass = (type) => {
    const classes = { up: 'dashChipUp', down: 'dashChipDown', flat: 'dashChipFlat' };
    return 'dashChip ' + (classes[type] || 'dashChipFlat');
};
