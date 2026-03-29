export const initImageEvents = ({ Refs, onChangeUpload, onDropModal, onAddImage, onDeleteImage, onDragOver, onDragLeave }) => {
    const { dropArea, fileInput, btnAddImg, btnDeleteImg } = Refs;

    if (!dropArea || !fileInput || !btnAddImg) return;

    dropArea.addEventListener("click", onAddImage);
    btnAddImg.addEventListener("click", onAddImage);

    fileInput.addEventListener("change", onChangeUpload);

    dropArea.addEventListener("dragover", onDragOver);

    dropArea.addEventListener("dragleave", onDragLeave);

    dropArea.addEventListener("drop", onDropModal);

    btnDeleteImg.addEventListener("click", onDeleteImage);
};
