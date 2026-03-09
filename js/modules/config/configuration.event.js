import { formatPhoneNumber } from "../../utils/formatters.js";

export function initConfigurationEvents({ Refs, onChangeDarkMode, onCloseEditProfile, onOpenEditProfile, onOpenVerifyPassword, onCloseVerifyPassword, onOpenToggleUsername, onCloseToggleUsername, onTogglePassword, onVerifyPassword, onCloseNewPassword, onVerifyNewPassword, onVerifyConfirmPassword, onChangePassword, onVerifyButtonUsername, onChangeUsername, onLogout, onEditProfile }) {

    Refs.frmEditProfile.addEventListener("submit", onEditProfile);
    Refs.darkModeToggle.addEventListener("change", onChangeDarkMode);
    Refs.btnOpenEditProfile.addEventListener("click", onOpenEditProfile);
    Refs.btnCloseEditProfile.addEventListener("click", onCloseEditProfile);
    Refs.modalProflile.addEventListener("click", (e) => {
        if (e.target === Refs.modalProflile) {
            onCloseEditProfile();
        }
    });
    Refs.btnCloseVerifyPassword.addEventListener("click", onCloseVerifyPassword);
    Refs.modalVerifyPassword.addEventListener("click", (e) => {
        if (e.target === Refs.modalVerifyPassword) {
            onCloseVerifyPassword();
        }
    });
    Refs.btnOpenVerifyPassword.addEventListener("click", onOpenVerifyPassword);
    Refs.btnCloseChangeUsername.addEventListener("click", onCloseToggleUsername);
    Refs.modalChangeUsername.addEventListener("click", (e) => {
        if (e.target === Refs.modalChangeUsername) {
            onCloseToggleUsername();
        }
    });
    Refs.btnOpenToggleUsername.addEventListener("click", onOpenToggleUsername);
    Refs.toggleVerifyPassword.addEventListener("click", (e) => onTogglePassword(e, Refs.txtVerifyPassword));
    Refs.togglePasswordForUsername.addEventListener("click", (e) => onTogglePassword(e, Refs.txtPasswordForUsername));
    Refs.frmVerifyPassword.addEventListener("submit", onVerifyPassword);
    Refs.btnCloseNewPassword.addEventListener("click", onCloseNewPassword);
    Refs.modalNewPassword.addEventListener("click", (e) => {
        if (e.target === Refs.modalNewPassword) {
            onCloseNewPassword();
        }
    });
    Refs.txtNewPassword.addEventListener("input", onVerifyNewPassword);
    Refs.txtConfirmPassword.addEventListener("input", onVerifyConfirmPassword);
    Refs.toggleNewPassword.addEventListener("click", (e) => onTogglePassword(e, Refs.txtNewPassword));
    Refs.toggleConfirmPassword.addEventListener("click", (e) => onTogglePassword(e, Refs.txtConfirmPassword));
    Refs.frmNewPassword.addEventListener("submit", onChangePassword);
    Refs.txtNewUsername.addEventListener("input", onVerifyButtonUsername);
    Refs.txtPasswordForUsername.addEventListener("input", onVerifyButtonUsername);
    Refs.frmToggleUsername.addEventListener("submit", onChangeUsername);
    Refs.btnLogout.addEventListener("click", onLogout);
    Refs.txtEmployeePhone.addEventListener("input", () => {
        formatPhoneNumber(Refs.txtEmployeePhone);
    });
}
