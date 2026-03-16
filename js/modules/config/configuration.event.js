import { formatPhoneNumber } from "../../utils/formatters.js";

export const initConfigurationEvents = ({ Refs, onChangeDarkMode, onCloseEditProfile, onOpenEditProfile, onOpenVerifyPassword, onCloseVerifyPassword, onOpenToggleUsername, onCloseToggleUsername, onTogglePassword, onVerifyPassword, onCloseNewPassword, onVerifyNewPassword, onVerifyConfirmPassword, onChangePassword, onVerifyButtonUsername, onChangeUsername, onLogout, onEditProfile }) => {
    const { frmEditProfile, darkModeToggle, btnOpenEditProfile, btnCloseEditProfile, modalProflile, btnCloseVerifyPassword, modalVerifyPassword, btnOpenVerifyPassword, modalChangeUsername, btnOpenToggleUsername, toggleVerifyPassword, togglePasswordForUsername, frmVerifyPassword, btnCloseNewPassword, modalNewPassword, txtNewPassword, txtConfirmPassword, toggleNewPassword, toggleConfirmPassword, frmNewPassword, txtNewUsername, txtPasswordForUsername, frmToggleUsername, btnLogout, txtEmployeePhone, btnCloseChangeUsername, txtVerifyPassword } = Refs;

    let pointerDownOnOverlay = false;

    frmEditProfile.addEventListener("submit", onEditProfile);
    darkModeToggle.addEventListener("change", onChangeDarkMode);
    btnOpenEditProfile.addEventListener("click", onOpenEditProfile);
    btnCloseEditProfile.addEventListener("click", onCloseEditProfile);

    modalProflile.addEventListener('pointerdown', (e) => {
        pointerDownOnOverlay = e.target === modalProflile;
    });
    modalProflile.addEventListener('pointerup', (e) => {
        if (pointerDownOnOverlay && e.target === modalProflile) onCloseEditProfile();
        pointerDownOnOverlay = false;
    });

    btnCloseVerifyPassword.addEventListener("click", onCloseVerifyPassword);

    modalVerifyPassword.addEventListener('pointerdown', (e) => {
        pointerDownOnOverlay = e.target === modalVerifyPassword;
    });
    modalVerifyPassword.addEventListener('pointerup', (e) => {
        if (pointerDownOnOverlay && e.target === modalVerifyPassword) onCloseVerifyPassword();
        pointerDownOnOverlay = false;
    });

    btnOpenVerifyPassword.addEventListener("click", onOpenVerifyPassword);
    btnCloseChangeUsername.addEventListener("click", onCloseToggleUsername);

    modalChangeUsername.addEventListener('pointerdown', (e) => {
        pointerDownOnOverlay = e.target === modalChangeUsername;
    });
    modalChangeUsername.addEventListener('pointerup', (e) => {
        if (pointerDownOnOverlay && e.target === modalChangeUsername) onCloseToggleUsername();
        pointerDownOnOverlay = false;
    });

    btnOpenToggleUsername.addEventListener("click", onOpenToggleUsername);
    toggleVerifyPassword.addEventListener("click", (e) => onTogglePassword(e, txtVerifyPassword));
    togglePasswordForUsername.addEventListener("click", (e) => onTogglePassword(e, txtPasswordForUsername));
    frmVerifyPassword.addEventListener("submit", onVerifyPassword);
    btnCloseNewPassword.addEventListener("click", onCloseNewPassword);

    modalNewPassword.addEventListener('pointerdown', (e) => {
        pointerDownOnOverlay = e.target === modalNewPassword;
    });
    modalNewPassword.addEventListener('pointerup', (e) => {
        if (pointerDownOnOverlay && e.target === modalNewPassword) onCloseNewPassword();
        pointerDownOnOverlay = false;
    });

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
