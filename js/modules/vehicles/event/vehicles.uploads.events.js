import { $, qsa } from "../../../utils/dom.js";

export function initUploadModalEvents({ onChangeUpload, onDropModal, closeModalUpload, openUploadModal }) {
    const dropArea = $("uploadDropArea");
    const inputFile = $("uploadFileInput");
    const btnSelect = $("btnSelectFile");

    if (!dropArea || !inputFile || !btnSelect) return;

    const selectFile = () => inputFile.click();

    dropArea.addEventListener("click", selectFile);
    btnSelect.addEventListener("click", selectFile);

    inputFile.addEventListener("change", onChangeUpload);

    dropArea.addEventListener("dragover", e => {
        e.preventDefault();
        dropArea.classList.add("dragover");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("dragover");
    });

    dropArea.addEventListener("drop", onDropModal);

    $("btnCloseUpload").addEventListener('click', closeModalUpload);
    $("modalUpload").addEventListener('click', e => {
        if (e.target === $("modalUpload")) closeModalUpload();
    });

    $('btnBill').addEventListener('click', () => openUploadModal('bill'));
    $('btnTaxes').addEventListener('click', () => openUploadModal('taxes'));
    qsa('.btnsTransport').forEach(btn => {
        btn.addEventListener('click', () => openUploadModal('ship'));
    });
}
