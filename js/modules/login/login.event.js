export const initLoginEvents = ({ Refs, onTogglePassword, onSubmitLogin, onBackHome, onOpenModalRecovery, onCloseModalRecovery, onOpenAuthEmail, onCloseAuthEmail, onClosePin, onCloseNewPassword, onAuthEmail, onSendCode, onUpdatePassword, onVerifyNewPassword, onVerifyConfirmPassword }) => {
    const { togglePassword, txtPassword, toggleNewPassword, txtNewPassword, toggleConfirmPassword, txtConfirmPassword, formLogin, btnBackHome, btnOpenModalRecovery, btnClose, btnOpenAuth, closeAuth, closeCode, closeNewPassword, authPrimaryBtn, btnCodeContinue, btnUpdatePassword } = Refs;
    togglePassword.addEventListener("click", (e) => onTogglePassword(e,txtPassword));
    toggleNewPassword.addEventListener("click", (e) => onTogglePassword(e,txtNewPassword));
    toggleConfirmPassword.addEventListener("click", (e) => onTogglePassword(e,txtConfirmPassword));
    formLogin.addEventListener("submit", onSubmitLogin);
    btnBackHome.addEventListener("click", onBackHome);
    btnOpenModalRecovery.addEventListener("click", onOpenModalRecovery);
    btnClose.addEventListener("click", onCloseModalRecovery);
    btnOpenAuth.addEventListener("click", onOpenAuthEmail);
    closeAuth.addEventListener("click", onCloseAuthEmail);
    closeCode.addEventListener("click", onClosePin);
    closeNewPassword.addEventListener("click", onCloseNewPassword);
    authPrimaryBtn.addEventListener("click", onAuthEmail);
    btnCodeContinue.addEventListener("click", onSendCode);
    btnUpdatePassword.addEventListener("click", onUpdatePassword);
    txtNewPassword.addEventListener("input", onVerifyNewPassword);
    txtConfirmPassword.addEventListener("input", onVerifyConfirmPassword);
};
