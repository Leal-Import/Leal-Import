import { $ } from "../../../utils/dom.js";

export function initImageEvents({ onChangeUpload, onDropModal, onAddImage, onDeleteImage, onDragOver, onDragLeave }) {
    const dropArea = $("dropZone");
    const inputFile = $("fileInput");
    const btnSelect = $("btnAddImg");
    const btnDeleteImg = $("btnDeleteImg");

    if (!dropArea || !inputFile || !btnSelect) return;

    dropArea.addEventListener("click", onAddImage);
    btnSelect.addEventListener("click", onAddImage);

    inputFile.addEventListener("change", onChangeUpload);

    dropArea.addEventListener("dragover", onDragOver);

    dropArea.addEventListener("dragleave", onDragLeave);

    dropArea.addEventListener("drop", onDropModal);

    btnDeleteImg.addEventListener("click", onDeleteImage);
}
