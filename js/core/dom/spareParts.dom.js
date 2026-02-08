import { qs, $ } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            cardContainer: qs('.cardContainer'),
            loaderSpareParts: $('loaderSpareParts'),
        };
        return this.refs;
    }
};

export let insertSpareParts = (container, spareParts) => {
    if (!container) return;
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (spareParts.length == 0) {
        const noDataDiv = document.createElement("div");
        noDataDiv.textContent = "No hay repuestos disponibles.";
        noDataDiv.style.gridColumn = "1 / -1";
        noDataDiv.classList.add("noDataMessage");
        fragment.appendChild(noDataDiv);
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

            picturePart.setAttribute("src", sparePart.photoUrl)
            partName.textContent = sparePart.nameSpareParts;
            brandModel.textContent = `${sparePart.brand} ${sparePart.model}`;
            statusPart.textContent = sparePart.state;
            yearPart.textContent = sparePart.yearPart;
            partPrice.textContent = `$${formatWithCommas(sparePart.totalCost)}`;
            btnEdit.textContent = "Editar";
            btnView.textContent = "Ver mas";

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
            btnEdit.classList.add("btnSecondary");
            btnEdit.href = `sparePartsDetails.html?id=${sparePart.idSparePart}`;
            btnView.href = `sparePartsView.html?id=${sparePart.idSparePart}`;

            containerImgSpare.appendChild(picturePart);
            infoPartContainer.append(partName, brandModel);
            leftInfo.append(statusPart, yearPart);
            moreInfoContainer.append(leftInfo, partPrice);
            footerCard.append(btnView, btnEdit);
            bodyCard.append(containerImgSpare, infoPartContainer, moreInfoContainer);
            card.append(bodyCard, footerCard);

            fragment.appendChild(card);
        });
    }

    container.appendChild(fragment);
}