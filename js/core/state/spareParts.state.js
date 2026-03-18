export const sparePartsState = {
    list: [],
    filters: {
        search: '',
        idState: ''
    },
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    },
    statusList: []
};

export const resetSparePartsState = () => {
    sparePartsState.list = [];
    sparePartsState.filters = {
        search: '',
        idState: ''
    };
    sparePartsState.pagination = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
    };
    sparePartsState.statusList = [];
};
