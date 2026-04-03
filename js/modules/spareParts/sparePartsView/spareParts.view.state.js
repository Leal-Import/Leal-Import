export const sparePartViewState = {
    context: {
        idSparePart: null
    },
    sparePart: null
};

export const resetSparePartViewState = () => {
    sparePartViewState.context = {
        idSparePart: null
    };
    sparePartViewState.sparePart = null;
};
