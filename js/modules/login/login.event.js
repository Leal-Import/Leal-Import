'use strict'

export const initLoginEvents = ({ Refs, onTogglePassword, onSubmitLogin, onBackHome, onOpenModalRecovery, onCloseModalRecovery, onOpenAuthEmail, onCloseAuthEmail, onClosePin, onCloseNewPassword, onAuthEmail, onSendCode, onUpdatePassword }) => {

    Refs.togglePassword.addEventListener("click", onTogglePassword);
    Refs.formLogin.addEventListener("submit", onSubmitLogin);
    Refs.btnBackHome.addEventListener("click", onBackHome);
    Refs.openModalRecovery.addEventListener("click", onOpenModalRecovery);
    Refs.closeBtn.addEventListener("click", onCloseModalRecovery);
    Refs.openAuth.addEventListener("click", onOpenAuthEmail);
    Refs.closeAuth.addEventListener("click", onCloseAuthEmail);
    Refs.closeCode.addEventListener("click", onClosePin);
    Refs.closeNewPassword.addEventListener("click", onCloseNewPassword);
    Refs.authPrimaryBtn.addEventListener("click", onAuthEmail);
    Refs.btnCodeContinue.addEventListener("click", onSendCode);
    Refs.btnUpdatePassword.addEventListener("click", onUpdatePassword);
}  