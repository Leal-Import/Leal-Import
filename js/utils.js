export const toggleModal = (modal, show) => {
    if (!modal) return;
    modal.classList.toggle("show", show);
    modal.classList.toggle("hide", !show);
};

export const setupModal = (openBtnSelector, modalSelector, closeBtnSelector) => {
    const openBtn = document.querySelector(openBtnSelector);
    const closeBtn = document.querySelector(closeBtnSelector);
    const modal = document.querySelector(modalSelector);

    if (!openBtn || !closeBtn || !modal) return;

    openBtn.addEventListener("click", () => toggleModal(modal, true));
    closeBtn.addEventListener("click", () => toggleModal(modal, false));
    modal.addEventListener("click", e => e.target === modal && toggleModal(modal, false));
};