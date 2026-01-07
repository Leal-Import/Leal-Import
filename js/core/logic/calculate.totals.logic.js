export const calculateTotals = ({ items = 0, paid = 0 }) => {
    let total = 0;

    if (Array.isArray(items)) {
        total = items.reduce(
            (sum, item) => sum + (Number(item.priceApplied) || 0),
            0
        );
    } else {
        total = Number(items) || 0;
    }

    const totalPaid = Number(paid) || 0;
    const due = total - totalPaid;

    return {
        total,
        due
    };
};
