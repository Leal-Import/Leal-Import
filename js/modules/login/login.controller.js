'use strict';

import { changePasswordType, changeStyleTogglePassword, cleanAuthCamps, clearPasswordCamps, DOMRefs, focusFirstCodeInput, hideAllModals, initDigitInputs, resetInputType, setReq, updateLabel } from "./login.dom.js";
import { clearCountdown, clearCurrentFlow, maskEmailSimple, renderMaskedEmail, startCountdown } from "./login.logic.js";
import { getPasswordStrengthOptions, getScore, validateMatch, validatePassword } from "../../core/logic/new.password.logic.js";
import { loginState } from "./login.state.js";
import { login, resetPassword, verifyEmail, verifyPIN } from "./login.service.js";
import { disableElement, hideElement, removeDisable, showElement, showMessage, toggleModal } from "../../utils/dom.js";
import { navigateTo, ROUTES } from "../../utils/router.js";
import { isValidEmail } from "../../utils/validators.js";
import { initLoginEvents } from "./login.event.js";
import { handleApiError } from "../../utils/api.utils.js";

const onTogglePassword = (e, txtPassword) => {
    const btn = e.currentTarget;
    const icon = btn.querySelector('svg');
    changeStyleTogglePassword(icon);
    if (txtPassword.type === 'password') {
        resetInputType(txtPassword, icon);
    } else {
        changePasswordType(txtPassword, icon);
    }
};

const onBackHome = (e) => {
    e.preventDefault();
    hideAllModals();
    navigateTo(ROUTES.INDEX);
};

const onOpenModalRecovery = (e) => {
    e.preventDefault();
    toggleModal(DOMRefs.refs.modalRecovery, true);
};

const onOpenAuthEmail = (e) => {
    e.preventDefault();
    toggleModal(DOMRefs.refs.modalRecovery, false);
    toggleModal(DOMRefs.refs.modalAuth, true);
};

const onCloseAuthEmail = () => {
    toggleModal(DOMRefs.refs.modalAuth, false);
    toggleModal(DOMRefs.refs.modalRecovery, true);
    cleanAuthCamps(DOMRefs.refs.authSuccess, DOMRefs.refs.txtAuthEmail);
};

const onClosePin = () => {
    clearCurrentFlow(loginState, DOMRefs.refs.modalCodeBody);
    DOMRefs.refs.codeDigits.forEach(i => { i.value = ''; });

    toggleModal(DOMRefs.refs.modalCode, false);
    toggleModal(DOMRefs.refs.modalAuth, false);
    toggleModal(DOMRefs.refs.modalRecovery, true);
};

const onSubmitLogin = async (e) => {
    e.preventDefault();

    const username = DOMRefs.refs.txtUserOrEmail.value;
    const password = DOMRefs.refs.txtPassword.value;

    if (!username.trim() || !password.trim()) {
        showMessage("Advertencia", "Campos incompletos", "warning");
        return;
    }

    disableElement(DOMRefs.refs.btnLogin);
    disableElement(DOMRefs.refs.txtUserOrEmail);
    disableElement(DOMRefs.refs.txtPassword);
    disableElement(DOMRefs.refs.togglePassword);
    disableElement(DOMRefs.refs.btnOpenModalRecovery);
    showElement(DOMRefs.refs.btnLoginLoader);

    try {
        await login(username.trim(), password.trim());
        await showMessage("Bienvenido", `Hola, ${username.trim()}`, "success", true);
        localStorage.setItem("navItem", "dashItem");
        navigateTo(ROUTES.DASHBOARD);
    } catch (error) {
        let title = 'Error';
        let text = error?.message || 'Ocurrió un error';

        if (text.includes("401") || text.toLowerCase().includes("credenciales")) {
            title = "Usuario no encontrado";
            text = "Credenciales inválidas. Inténtalo de nuevo.";
        }
        await showMessage(title, text, "error");
    } finally {
        removeDisable(DOMRefs.refs.btnLogin);
        removeDisable(DOMRefs.refs.txtUserOrEmail);
        removeDisable(DOMRefs.refs.txtPassword);
        removeDisable(DOMRefs.refs.togglePassword);
        removeDisable(DOMRefs.refs.btnOpenModalRecovery);
        hideElement(DOMRefs.refs.btnLoginLoader);
    }
};

const onAuthEmail = async (e) => {
    e.preventDefault();

    if (loginState.flags.pendingSend) return;
    const email = DOMRefs.refs.txtAuthEmail.value.trim().toLowerCase();
    if (!isValidEmail(email)) {
        showMessage("Advertencia", "Email invalido", "warning");
        return;
    }

    loginState.flags.pendingSend = true;
    disableElement(DOMRefs.refs.authPrimaryBtn);
    disableElement(DOMRefs.refs.txtAuthEmail);
    showElement(DOMRefs.refs.btnAuthSendLoader);
    try {
        const data = await verifyEmail(email);
        loginState.auth.resetId = data?.resetId || '';

        if (!loginState.auth.resetId) showMessage("Error", "El servidor no respondio correctamente,", "error");
        const minutes = (typeof data?.minutes === 'number') ? data.minutes : 15;

        await showMessage("Enlace enviado", `Se ha enviado un mensaje al correo ${maskEmailSimple(email)}.`, 'info', true);

        loginState.auth.email = email;

        toggleModal(DOMRefs.refs.modalAuth, false);
        toggleModal(DOMRefs.refs.modalCode, true);
        renderMaskedEmail(DOMRefs.refs.modalCodeBody, email);
        startCountdown(minutes, loginState, DOMRefs.refs.modalCodeBody);
        focusFirstCodeInput(DOMRefs.refs.codeDigits);
    } catch (error) {
        await handleApiError(error, 'No se pudo enviar el correo de recuperación. Por favor, inténtalo de nuevo.');
    } finally {
        loginState.flags.pendingSend = false;
        removeDisable(DOMRefs.refs.authPrimaryBtn);
        removeDisable(DOMRefs.refs.txtAuthEmail);
        hideElement(DOMRefs.refs.btnAuthSendLoader);
        cleanAuthCamps(DOMRefs.refs.authSuccess, DOMRefs.refs.txtAuthEmail);
    }
};

const onSendCode = async (e) => {
    e.preventDefault();

    if (loginState.flags.pendingVerify) return;
    const code = DOMRefs.refs.codeDigits.map(i => i.value).join('');

    if (code.length !== DOMRefs.refs.codeDigits.length) {
        await showMessage("Código incompleto", "Ingresa el código completo.", "warning");
        return;
    }

    if (!loginState.auth.email || !loginState.auth.resetId) {
        await showMessage("Sesión inválida", "Reinicia el proceso y solicita un nuevo correo.", "error");
        clearCurrentFlow(loginState, DOMRefs.refs.modalCodeBody);
        return;
    }

    loginState.flags.pendingVerify = true;
    DOMRefs.refs.codeDigits.forEach(disableElement);
    disableElement(DOMRefs.refs.btnCodeContinue);
    showElement(DOMRefs.refs.btnCodeContinueLoader);

    try {
        const data = await verifyPIN(loginState.auth.resetId, loginState.auth.email, code);
        loginState.auth.ticket = data?.ticket || '';
        if (!loginState.auth.ticket) {
            throw new Error('No se recibió ticket. Revisa el endpoint /verify.');
        }
        toggleModal(DOMRefs.refs.modalCode, false);
        toggleModal(DOMRefs.refs.modalNewPassword, true);
        clearCountdown(loginState, DOMRefs.refs.modalCodeBody);
    } catch (error) {
        await handleApiError(error, 'Código inválido. Por favor, verifica el código enviado a tu correo e inténtalo de nuevo.');
        focusFirstCodeInput(DOMRefs.refs.codeDigits);
    } finally {
        loginState.flags.pendingVerify = false;
        DOMRefs.refs.codeDigits.forEach(removeDisable);
        removeDisable(DOMRefs.refs.btnCodeContinue);
        hideElement(DOMRefs.refs.btnCodeContinueLoader);
    }
};

const onUpdatePassword = async () => {
    if (loginState.flags.pendingUpdate) return;

    const newPass = DOMRefs.refs.txtNewPassword?.value?.trim() ?? '';
    const confirmPass = DOMRefs.refs.txtConfirmPassword?.value?.trim() ?? '';

    if (!newPass || !confirmPass) {
        await showMessage("Campos incompletos", "Por favor, completa ambos campos.", "warning");
        return;
    }

    if (newPass !== confirmPass) {
        await showMessage("Contraseñas no coinciden", "Las contraseñas ingresadas no coinciden.", "warning");
        return;
    }

    const invalidate = validatePassword(newPass, confirmPass);
    if (invalidate) {
        await showMessage("Advertencia", invalidate, "warning");
        return;
    }

    if (!loginState.auth.ticket) {
        await showMessage("Sesión inválida", "No hay ticket de confirmación. Verifica el código nuevamente.", "error");
        return;
    }

    loginState.flags.pendingUpdate = true;
    disableElement(DOMRefs.refs.btnUpdatePassword);
    showElement(DOMRefs.refs.btnUpdatePasswordLoader);

    try {
        await resetPassword(loginState.auth.ticket, newPass);
        await showMessage("Contraseña actualizada", "Tu contraseña ha sido actualizada correctamente. Inicia sesión con tu nueva contraseña.", "success");
        clearPasswordCamps(DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword);
        toggleModal(DOMRefs.refs.modalNewPassword, false);
        clearCurrentFlow(loginState, DOMRefs.refs.modalCodeBody);

    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar la contraseña. Por favor, inténtalo de nuevo.');
    } finally {
        loginState.flags.pendingUpdate = false;
        removeDisable(DOMRefs.refs.btnUpdatePassword);
        hideElement(DOMRefs.refs.btnUpdatePasswordLoader);
    }
};

const onVerifyNewPassword = () => {
    const pw1 = DOMRefs.refs.txtNewPassword;
    const pw2 = DOMRefs.refs.txtConfirmPassword;
    const score = getScore(pw1.value);
    const options = getPasswordStrengthOptions(score);

    if (pw1.value.length > 0) {
        DOMRefs.refs.strengthWrap.classList.add('visible');
        DOMRefs.refs.passwordRequirements.classList.add('visible');
    } else {
        DOMRefs.refs.strengthWrap.classList.remove('visible');
        DOMRefs.refs.passwordRequirements.classList.remove('visible');
    }

    DOMRefs.refs.segs.forEach((seg, i) => {
        seg.style.background = i < score ? options.color : '';
    });

    updateLabel(DOMRefs.refs.strengthLabel, options);

    setReq('reqLength', pw1.value.length >= 8);
    setReq('reqUppercase', /[A-Z]/.test(pw1.value));
    setReq('reqLowercase', /[a-z]/.test(pw1.value));
    setReq('reqNumber', /[0-9]/.test(pw1.value));
    setReq('reqSpecial', /[^A-Za-z0-9]/.test(pw1.value));

    pw1.classList.toggle('inputValid', score === 5);
    pw1.classList.toggle('inputInvalid', pw1.value.length > 0 && score < 5);

    if (pw2.value) validateMatch(pw1, pw2, DOMRefs.refs.passwordMatchHint);
    checkBtn(score, pw1, pw2);
};

const checkBtn = (score, pw1, pw2) => {
    if ((score === 5) && pw1.value === pw2.value && pw1.value.length > 0) {
        removeDisable(DOMRefs.refs.btnUpdatePassword);
    } else {
        disableElement(DOMRefs.refs.btnUpdatePassword);
    }
};

const initializeUI = (Refs) => {
    initLoginEvents({
        Refs,
        onTogglePassword: (e, txtPassword) => onTogglePassword(e, txtPassword),
        onBackHome,
        onOpenModalRecovery,
        onCloseModalRecovery: () => toggleModal(Refs.modalRecovery, false),
        onOpenAuthEmail,
        onCloseAuthEmail,
        onClosePin,
        onCloseNewPassword: () => toggleModal(Refs.modalNewPassword, false),
        onSubmitLogin,
        onAuthEmail,
        onSendCode,
        onUpdatePassword,
        onVerifyNewPassword,
        onVerifyConfirmPassword: () => {
            validateMatch(DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword, DOMRefs.refs.passwordMatchHint);
            checkBtn(getScore(DOMRefs.refs.txtNewPassword.value), DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword);
        }
    });
    initDigitInputs(Refs.codeDigits);
};

const init = () => {
    try {
        const refs = DOMRefs.init();
        initializeUI(refs);
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
};

document.addEventListener('DOMContentLoaded', init);
