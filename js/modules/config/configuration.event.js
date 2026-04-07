import { addModalCloseEvents } from "../../utils/dom.js";
import { formatPhoneNumber } from "../../utils/formatters.js";

export const initConfigurationEvents = ({ Refs, onChangeDarkMode, onCloseEditProfile, onOpenEditProfile, onOpenVerifyPassword, onCloseVerifyPassword, onOpenToggleUsername, onCloseToggleUsername, onTogglePassword, onVerifyPassword, onCloseNewPassword, onVerifyNewPassword, onVerifyConfirmPassword, onChangePassword, onVerifyButtonUsername, onChangeUsername, onLogout, onEditProfile, onOpenPaymentMethods, onClosePaymentMethods, onVerifyPaymentMethod, onSubmitPaymentMethod, onOpenModalManageRoles, onCloseModalManageRoles }) => {
    const { frmEditProfile, darkModeToggle, btnOpenEditProfile, btnCloseEditProfile, modalProflile, btnCloseVerifyPassword, modalVerifyPassword, btnOpenVerifyPassword, modalChangeUsername, btnOpenToggleUsername, toggleVerifyPassword, togglePasswordForUsername, frmVerifyPassword, btnCloseNewPassword, modalNewPassword, txtNewPassword, txtConfirmPassword, toggleNewPassword, toggleConfirmPassword, frmNewPassword, txtNewUsername, txtPasswordForUsername, frmToggleUsername, btnLogout, txtEmployeePhone, btnCloseChangeUsername, txtVerifyPassword, btnOpenPaymentMethods, modalPaymentMethods, btnClosePaymentMethods, txtPaymentMethod, btnAddPaymentMethod, btnOpenManageRoles, btnCloseRoleManagement, modalRoleManagement } = Refs;

    frmEditProfile.addEventListener("submit", onEditProfile);
    darkModeToggle.addEventListener("change", onChangeDarkMode);
    btnOpenEditProfile.addEventListener("click", onOpenEditProfile);
    btnCloseEditProfile.addEventListener("click", onCloseEditProfile);
    btnClosePaymentMethods.addEventListener("click", onClosePaymentMethods);

    btnCloseVerifyPassword.addEventListener("click", onCloseVerifyPassword);

    addModalCloseEvents(modalVerifyPassword, onCloseVerifyPassword);
    addModalCloseEvents(modalChangeUsername, onCloseToggleUsername);
    addModalCloseEvents(modalProflile, onCloseEditProfile);
    addModalCloseEvents(modalNewPassword, onCloseNewPassword);
    addModalCloseEvents(modalPaymentMethods, onClosePaymentMethods);
    addModalCloseEvents(modalRoleManagement, onCloseModalManageRoles);

    btnOpenVerifyPassword.addEventListener("click", onOpenVerifyPassword);
    btnCloseChangeUsername.addEventListener("click", onCloseToggleUsername);
    btnOpenManageRoles.addEventListener("click", onOpenModalManageRoles);
    btnCloseRoleManagement.addEventListener("click", onCloseModalManageRoles);

    btnAddPaymentMethod.addEventListener("click", onSubmitPaymentMethod);
    txtPaymentMethod.addEventListener("input", onVerifyPaymentMethod);

    btnOpenToggleUsername.addEventListener("click", onOpenToggleUsername);
    toggleVerifyPassword.addEventListener("click", (e) => onTogglePassword(e, txtVerifyPassword));
    togglePasswordForUsername.addEventListener("click", (e) => onTogglePassword(e, txtPasswordForUsername));
    frmVerifyPassword.addEventListener("submit", onVerifyPassword);
    btnCloseNewPassword.addEventListener("click", onCloseNewPassword);
    btnOpenPaymentMethods.addEventListener("click", onOpenPaymentMethods);

    txtNewPassword.addEventListener("input", onVerifyNewPassword);
    txtConfirmPassword.addEventListener("input", onVerifyConfirmPassword);
    toggleNewPassword.addEventListener("click", (e) => onTogglePassword(e, txtNewPassword));
    toggleConfirmPassword.addEventListener("click", (e) => onTogglePassword(e, txtConfirmPassword));
    frmNewPassword.addEventListener("submit", onChangePassword);
    txtNewUsername.addEventListener("input", onVerifyButtonUsername);
    txtPasswordForUsername.addEventListener("input", onVerifyButtonUsername);
    frmToggleUsername.addEventListener("submit", onChangeUsername);
    btnLogout.addEventListener("click", onLogout);
    txtEmployeePhone.addEventListener("input", () => {
        formatPhoneNumber(txtEmployeePhone);
    });
};
