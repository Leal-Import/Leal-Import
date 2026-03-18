// payments.state.js

export const paymentsState = {
    context: {
        isView: null,
        editingIndex: -1
    },
    payments: [],
    paymentMethods: [],
    onSaveState: null,
    onCalculateTotal: null,
    onCreateButton: null
};
