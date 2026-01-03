import { $ } from "../../../utils/dom.js";

export function initImageEvents({ onChangeUpload, onDropModal, onAddImage, onDeleteImage, onDragOver, onDragLeave }) {
    const dropArea = $("dropZone");
    const inputFile = $("fileInput");
    const btnSelect = $("btnAddImg");
    const btnDeleteImg = $("btnDeleteImg");

    if (!dropArea || !inputFile || !btnSelect) return;

    const selectFile = () => inputFile.click();

    dropArea.addEventListener("click", selectFile);
    btnSelect.addEventListener("click", selectFile);

    inputFile.addEventListener("change", onChangeUpload);

    dropArea.addEventListener("dragover", onDragOver);

    dropArea.addEventListener("dragleave", onDragLeave);

    dropArea.addEventListener("drop", onDropModal);

    inputFile.addEventListener("change", onAddImage);

    btnDeleteImg.addEventListener("click", onDeleteImage);
}
