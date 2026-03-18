
export const initPaymentsEvents = ({ btnCancelEdit, onCancelEdit, btnAddPayment, onAddPayment }) => {
    btnCancelEdit.addEventListener('click', onCancelEdit);
    btnAddPayment.addEventListener('click', onAddPayment);
};
