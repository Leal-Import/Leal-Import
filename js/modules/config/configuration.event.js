export function initConfigurationEvents({ Refs, onChangeDarkMode, onCloseEditProfile, onOpenEditProfile, onOpenVerifyPassword, onCloseVerifyPassword, onOpenToggleUsername, onCloseToggleUsername, onTogglePassword }) {

    Refs.darkModeToggle.addEventListener("change", onChangeDarkMode);
    Refs.btnEditProfile.addEventListener("click", onOpenEditProfile);
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
}
