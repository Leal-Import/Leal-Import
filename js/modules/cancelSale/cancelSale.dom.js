import { $ } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            btnOpenCancelSale: $("btnOpenCancelSale"),
            modalCancelSale: $("modalCancelSale"),
            btnCloseCancelSale: $("btnCloseCancelSale"),
            txtCancelReason: $("txtCancelReason"),
            btnConfirmCancelSale: $("btnConfirmCancelSale"),
            cancelReasonCount: $("cancelReasonCount"),
            frmCancelSale: $("frmCancelSale"),
            btnConfirmCancelSaleLoader: $("btnConfirmCancelSaleLoader"),
            cancelledBreadcrumb: $("cancelledBreadcrumb")
        };

        return this.refs;
    }
};
