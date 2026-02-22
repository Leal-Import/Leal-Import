'use strict'

import { $, hideElement, qs, qsa, showElement, toggleModal } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            togglePassword: qs('.togglePassword'),
            txtPassword: $('txtPassword'),
            btnLogin: $('btnLogin'),
            btnLoginLoader: $('btnLoginLoader'),
            formLogin: $('formLogin'),
            loaderEmployees: $("loaderEmployees"),
            btnAddEmployeeLoader: $("btnAddEmployeeLoader"),
            btnAddEmployee: $("btnAddEmployee"),
            modals: qsa(".modal"),
            modalRecovery: $("modalRecovery"),
            modalAuth: $("modalAuth"),
            modalCode: $("modalCode"),
            modalNewPassword: $("modalNewPassword"),
            closeBtn: qs(".closeBtn"),
            closeAuth: $("closeAuth"),
            closeCode: $("closeCode"),
            closeNewPassword: $("closeNewPassword"),
            openAuth: $("openAuth"),
            openModalRecovery: $("openModalRecovery"),
            authEmail: $("authEmail"),
            authSuccess: qs(".authSuccess"),
            authPrimaryBtn: $("btnAuthSend"),
            btnCodeContinue: $("btnCodeContinue"),
            btnCodeContinueLoader: $("btnCodeContinueLoader"),
            modalCodeBody: $("modalCodeBody"),
            btnUpdatePassword: $("btnUpdatePassword"),
            newPassword: $("newPassword"),
            confirmPassword: $("confirmPassword"),
            btnUpdatePasswordLoader: $("btnUpdatePasswordLoader"),
            btnBackHome: $("btnBackHome"),
            codeDigits: Array.from(qsa('#modalCode .codeDigit')),
            txtUserOrEmail: $("txtUserOrEmail"),
            btnAuthSendLoader: $('btnAuthSendLoader')
        };
        return this.refs;
    }
};

export const resetInputType = (input, icon) => {
    input.type = "text";
    showElement(icon);
}

export const clearPasswodPamps = (txtNewPassword, txtConfirmPassword) => {
    txtNewPassword.value = "";
    txtConfirmPassword.value = "";
}

export const changePasswordType = (input, icon) => {
    input.type = "password";
    hideElement(icon);
}

export const hideAllModals = () => {
    qsa(".modal").forEach(modal => toggleModal(modal, false));
}

export const cleanAuthCamps = (divSuccess, txtAuthEmail) => {
    txtAuthEmail.value = "";
    divSuccess.innerHTML = "";
}

export const initDigitInputs = (inputs) => {
    if (!inputs || inputs.length === 0) return;

    inputs.forEach((input, idx) => {
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('maxlength', '1');

        input.addEventListener('input', () => {
            input.value = (input.value || '').replace(/\D/g, '').slice(0, 1);
            if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (!input.value && idx > 0) inputs[idx - 1].focus();
            }
            if (e.key === 'ArrowLeft' && idx > 0) inputs[idx - 1].focus();
            if (e.key === 'ArrowRight' && idx < inputs.length - 1) inputs[idx + 1].focus();
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
            if (!text) return;

            for (let i = 0; i < inputs.length; i++) inputs[i].value = text[i] || '';
            const lastFilled = Math.min(text.length, inputs.length) - 1;
            if (lastFilled >= 0) inputs[lastFilled].focus();
        });
    });
}

export function focusFirstCodeInput(inputs) {
    if (!inputs || inputs.length === 0) return;
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
}

export function updateCountdownUI(modalCodeBody, state) {
    if (!modalCodeBody) return;

    let el = modalCodeBody.querySelector('#__pin_countdown');
    if (!el) {
        el = document.createElement('div');
        el.id = '__pin_countdown';
        el.style.marginTop = '8px';
        el.style.fontSize = '14px';
        el.style.color = '#555';
        modalCodeBody.appendChild(el);
    }
    const mins = Math.floor(state.countdown.remainingSeconds / 60);
    const secs = state.countdown.remainingSeconds % 60;
    el.textContent = `Código válido por ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const removeCountdown = (modalCodeBody) => {
    const el = modalCodeBody?.querySelector('#__pin_countdown');
    if (el) el.remove();
}