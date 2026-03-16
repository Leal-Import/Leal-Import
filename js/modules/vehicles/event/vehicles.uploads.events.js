export const initUploadModalEvents = ({ Refs, onChangeUpload, onDropModal, onCloseModalUpload, onOpenUploadModal }) => {
    const { uploadDropArea, uploadFileInput, btnSelectFile, btnCloseUpload, modalUpload, btnBill, btnTaxes, btnsTransport } = Refs;

    if (!uploadDropArea || !uploadFileInput || !btnSelectFile) return;

    const selectFile = () => uploadFileInput.click();

    uploadDropArea.addEventListener("click", selectFile);
    btnSelectFile.addEventListener("click", selectFile);

    uploadFileInput.addEventListener("change", onChangeUpload);

    uploadDropArea.addEventListener("dragover", e => {
        e.preventDefault();
        uploadDropArea.classList.add("dragover");
    });

    uploadDropArea.addEventListener("dragleave", () => {
        uploadDropArea.classList.remove("dragover");
    });

    uploadDropArea.addEventListener("drop", onDropModal);

    btnCloseUpload.addEventListener('click', onCloseModalUpload);
    modalUpload.addEventListener('click', e => {
        if (e.target === modalUpload) onCloseModalUpload();
    });

    btnBill.addEventListener('click', () => onOpenUploadModal('bill'));
    btnTaxes.addEventListener('click', () => onOpenUploadModal('taxes'));
    btnsTransport.forEach(btn => {
        btn.addEventListener('click', () => onOpenUploadModal('ship'));
    });
};
