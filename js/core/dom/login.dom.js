'use strict';

import { $, qs, qsa, toggleModal } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            togglePassword: $('togglePassword'),
            txtPassword: $('txtPassword'),
            btnLogin: $('btnLogin'),
            btnLoginLoader: $('btnLoginLoader'),
            formLogin: $('formLogin'),
            modals: qsa(".modal"),
            modalRecovery: $("modalRecovery"),
            modalAuth: $("modalAuth"),
            modalCode: $("modalCode"),
            modalNewPassword: $("modalNewPassword"),
            btnClose: qs(".btnClose"),
            closeAuth: $("closeAuth"),
            closeCode: $("closeCode"),
            closeNewPassword: $("closeNewPassword"),
            btnOpenAuth: $("btnOpenAuth"),
            openModalRecovery: $("openModalRecovery"),
            txtAuthEmail: $("txtAuthEmail"),
            authSuccess: qs(".authSuccess"),
            authPrimaryBtn: $("btnAuthSend"),
            btnCodeContinue: $("btnCodeContinue"),
            btnCodeContinueLoader: $("btnCodeContinueLoader"),
            modalCodeBody: qs(".modalCodeBody"),
            btnUpdatePassword: $("btnUpdatePassword"),
            txtNewPassword: $("txtNewPassword"),
            txtConfirmPassword: $("txtConfirmPassword"),
            btnUpdatePasswordLoader: $("btnUpdatePasswordLoader"),
            btnBackHome: $("btnBackHome"),
            codeDigits: Array.from(qsa('#modalCode .codeDigit')),
            txtUserOrEmail: $("txtUserOrEmail"),
            btnAuthSendLoader: $('btnAuthSendLoader'),
            strengthWrap: $("strengthWrap"),
            passwordRequirements: $("passwordRequirements"),
            strengthLabel: $("strengthLabel"),
            passwordMatchHint: $("passwordMatchHint"),
            toggleNewPassword: $("toggleNewPassword"),
            toggleConfirmPassword: $("toggleConfirmPassword"),
            segs: [1, 2, 3, 4, 5].map(i => document.getElementById('strengthSeg' + i))
        };
        return this.refs;
    }
};

export const resetInputType = (input, icon) => {
    input.type = "text";
    icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>`;
};

export const clearPasswordCamps = (txtNewPassword, txtConfirmPassword) => {
    txtNewPassword.value = "";
    txtConfirmPassword.value = "";
};

export const changePasswordType = (input, icon) => {
    input.type = "password";
    icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
};

export const hideAllModals = () => {
    qsa(".modal").forEach(modal => toggleModal(modal, false));
};

export const cleanAuthCamps = (divSuccess, txtAuthEmail) => {
    txtAuthEmail.value = "";
    divSuccess.innerHTML = "";
};

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
};

export const  focusFirstCodeInput = (inputs) => {
    if (!inputs || inputs.length === 0) return;
    inputs.forEach((i) => {i.value = '';});
    inputs[0].focus();
};

export const updateCountdownUI = (modalCodeBody, state) => {
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
};

export const removeCountdown = (modalCodeBody) => {
    const el = modalCodeBody?.querySelector('#__pin_countdown');
    if (el) el.remove();
};

export const changeStyleTogglePassword = (icon) => {
    const current = parseFloat(icon.dataset.rotate || '0');
    const next = current + 180;
    icon.dataset.rotate = next;
    icon.style.transition = 'transform 0.5s';
    icon.style.transform = `rotate(${next}deg)`;
};

export const setReq = (id, met) => {
    $(id).classList.toggle('met', met);
};

export const updateLabel = (label, data) => {
    label.textContent = data.type;
    label.style.color = data.color;
};
