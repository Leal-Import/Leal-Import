import { getWorkOrderById } from "../service/serviceAddWorkOrder.js";
import { appendToDom } from "../controller/salesHelpers/loadTablesWO.js";

const params = new URLSearchParams(window.location.search);

const idWorkOrder = params.get("idWorkOrder");

document.addEventListener("DOMContentLoaded", async () => {
    await loadWorkOrder();
})

let loadWorkOrder = async () => {
    const workOrder = await getWorkOrderById(idWorkOrder);
    console.log(workOrder)
    
}