import { getSpareParts } from '../service/serviceSpareParts.js'
import {
    setupModal
} from '../utils.js';
// Configurar el modal para agregar repuestos
setupModal("#modalParts", "#modalSpareParts", "#closeAddEmployee");

document.addEventListener("DOMContentLoaded", async () => {
    await loadSpareParts();
});

let loadSpareParts = async () => {
    const data = await getSpareParts();
    insertSpareParts(data.content);
}

let insertSpareParts = (spareParts) => {
    const container = document.querySelector(".cardContainer");
    container.innerHTML = "";
    if (!container) return;
    const fragment = document.createDocumentFragment();
    if (spareParts.length == 0) {

    } else {
        spareParts.forEach(sparePart => {
            const card = document.createElement("div");
            const bodyCard = document.createElement("div");
            const containerImgSpare = document.createElement("div");
            const picturePart = document.createElement("img");
            const infoPartContainer = document.createElement("div");
            const partName = document.createElement("span");
            const brandModel = document.createElement("span");
            const moreInfoContainer = document.createElement("div");
            const leftInfo = document.createElement("div");
            const statusPart = document.createElement("span");
            const yearPart = document.createElement("span");
            const partPrice = document.createElement("span");
            const footerCard = document.createElement("div");
            const btnView = document.createElement("a")
            const btnEdit = document.createElement("a");

            card.classList.add("card");
            bodyCard.classList.add("bodyCard");
            containerImgSpare.classList.add("containerImgSpare")
            picturePart.classList.add("picturePart");
            infoPartContainer.classList.add("infoPartContainer");
            partName.classList.add("partName");
            brandModel.classList.add("brandModel");
            moreInfoContainer.classList.add("moreInfoContainer");
            leftInfo.classList.add("leftInfo");
            statusPart.classList.add("statusPart");
            yearPart.classList.add("yearPart")
            partPrice.classList.add("partPrice");
            footerCard.classList.add("footerCard");
            btnView.classList.add("btnPrimary");
        });
    }
}
<div class="card">
    <div class="bodyCard">
        <div class="containerImgSpare">
            <img src="https://res.cloudinary.com/drjmfhpvp/image/upload/v1762542817/Leal%20Import/Vehicles/H38DJ2LS93KDJ387/file_2f93eddf-0239-47ba-a0c3-77620c00e530.png"
                alt="" class="picturePart">
        </div>
        <div class="infoPartContainer">
            <span class="partName">Escribos traseros</span>
            <span class="brandModel">Kawasaki ZX638</span>
        </div>
        <div class="moreInfoContainer">
            <div class="leftInfo">
                <div class="statusPart">Comprado</div>
                <div class="stockPart">2020-2024</div>
            </div>
            <span class="partPrice">$15.00</span>
        </div>
    </div>
    <div class="footerCard">
        <a class="btnPrimary" href="vehicleDetails.html?id=H38DJ2LS93KDJ384">Ver más</a>
        <button class="btnSecondary">Editar</button>
    </div>
</div>