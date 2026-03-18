import { qs, $ } from "../../utils/dom.js";
import { formatWithCommas } from "../../utils/formatters.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            cardContainer: qs('.cardContainer'),
            loaderSpareParts: $('loaderSpareParts'),
            txtSearchData: $('txtSearchData'),
            cmbSearchByStatus: $('cmbSearchByStatus')
        };
        return this.refs;
    }
};

export const insertSpareParts = (container, spareParts) => {
    if (!container) return;
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    if (spareParts.length === 0) {
        fragment.appendChild(createNoDataMessage());
    } else {
        spareParts.forEach(sparePart => {
            fragment.appendChild(createSparePartCard(sparePart));
        });
    }

    container.appendChild(fragment);
};

const  createNoDataMessage = () => {
    const div = document.createElement("div");
    div.textContent = "No hay repuestos disponibles.";
    div.classList.add("noDataMessage");
    return div;
};

const createSparePartCard = (sparePart) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.append(createCardBody(sparePart), createCardFooter(sparePart));
    return card;
};

const createCardBody = (sparePart) => {
    const body = document.createElement("div");
    body.classList.add("bodyCard");

    const img = document.createElement("img");
    img.src = sparePart.photoUrl || '';
    img.classList.add("picturePart");

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("containerImgSpare");
    imgContainer.appendChild(img);

    const info = document.createElement("div");
    info.classList.add("infoPartContainer");

    const name = document.createElement("span");
    name.classList.add("partName");
    name.textContent = sparePart.nameSpareParts;

    const brandModel = document.createElement("span");
    brandModel.classList.add("brandModel");
    brandModel.textContent = `${sparePart.brand} ${sparePart.model}`;

    info.append(name, brandModel);
    body.append(imgContainer, info, createMoreInfo(sparePart));
    return body;
};

const createMoreInfo = (sparePart) => {
    const container = document.createElement("div");
    container.classList.add("moreInfoContainer");

    const left = document.createElement("div");
    left.classList.add("leftInfo");

    const status = document.createElement("span");
    status.classList.add("statusPart");
    status.textContent = sparePart.state;

    const year = document.createElement("span");
    year.classList.add("yearPart");
    year.textContent = sparePart.yearPart;

    const price = document.createElement("span");
    price.classList.add("partPrice");
    price.textContent = formatWithCommas(sparePart.totalCost);

    left.append(status, year);
    container.append(left, price);
    return container;
};

const createCardFooter = (sparePart) => {
    const footer = document.createElement("div");
    footer.classList.add("footerCard");

    const btnView = document.createElement("a");
    btnView.classList.add("btnPrimary");
    btnView.textContent = "Ver más";
    btnView.href = `sparePartsView.html?id=${sparePart.idSparePart}`;

    const btnEdit = document.createElement("a");
    btnEdit.classList.add("btnSecondary");
    btnEdit.textContent = "Editar";
    btnEdit.href = `sparePartsDetails.html?id=${sparePart.idSparePart}`;

    footer.append(btnView, btnEdit);
    return footer;
};
