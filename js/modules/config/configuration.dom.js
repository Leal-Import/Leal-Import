import { $ } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            darkModeToggle: $('darkModeToggle'),
            btnOpenVerifyPassword: $('btnOpenVerifyPassword'),
            btnOpenPaymentMethods: $('btnOpenPaymentMethods'),
            modalPaymentMethods: $('modalPaymentMethods'),
            btnClosePaymentMethods: $('btnClosePaymentMethods'),
            pmMethodList: $('pmMethodList'),
            btnEditProfile: $('btnEditProfile'),
            btnCloseEditProfile: $('btnCloseEditProfile'),
            btnCloseNewPassword: $('btnCloseNewPassword'),
            modalProflile: $('modalProflile'),
            frmEditProfile: $('frmEditProfile'),
            modalVerifyPassword: $('modalVerifyPassword'),
            btnCloseVerifyPassword: $('btnCloseVerifyPassword'),
            txtVerifyPassword: $('txtVerifyPassword'),
            toggleVerifyPassword: $('toggleVerifyPassword'),
            togglePasswordForUsername: $('togglePasswordForUsername'),
            btnVerifyCurrentPassword: $('btnVerifyCurrentPassword'),
            btnVerifyCurrentPasswordLoader: $('btnVerifyCurrentPasswordLoader'),
            txtPasswordForUsername: $('txtPasswordForUsername'),
            btnOpenEditProfile: $('btnOpenEditProfile'),
            btnEditProfileLoader: $('btnEditProfileLoader'),
            currentPasswordHint: $('currentPasswordHint'),
            txtFullName: $('txtFullName'),
            txtEmployeeEmail: $('txtEmployeeEmail'),
            txtEmployeePhone: $('txtEmployeePhone'),
            btnOpenToggleUsername: $('btnOpenToggleUsername'),
            modalNewPassword: $('modalNewPassword'),
            modalChangeUsername: $('modalChangeUsername'),
            btnCloseChangeUsername: $('btnCloseChangeUsername'),
            txtCurrentUsername: $('txtCurrentUsername'),
            btnUpdatePasswordLoader: $('btnUpdatePasswordLoader'),
            txtNewUsername: $('txtNewUsername'),
            btnSaveUsername: $('btnSaveUsername'),
            toggleNewPassword: $('toggleNewPassword'),
            toggleConfirmPassword: $('toggleConfirmPassword'),
            btnUpdatePassword: $('btnUpdatePassword'),
            btnSaveUsernameLoader: $('btnSaveUsernameLoader'),
            usernameHint: $('usernameHint'),
            frmVerifyPassword: $('frmVerifyPassword'),
            txtNewPassword: $('txtNewPassword'),
            txtConfirmPassword: $('txtConfirmPassword'),
            strengthWrap: $('strengthWrap'),
            passwordRequirements: $('passwordRequirements'),
            strengthLabel: $('strengthLabel'),
            passwordMatchHint: $('passwordMatchHint'),
            frmNewPassword: $('frmNewPassword'),
            frmToggleUsername: $('frmToggleUsername'),
            btnAddPaymentMethodLoader: $('btnAddPaymentMethodLoader'),
            txtPaymentMethod: $('txtPaymentMethod'),
            btnAddPaymentMethod: $('btnAddPaymentMethod'),
            pmHint: $('pmHint'),
            btnLogout: $('btnLogout'),
            segs: [1, 2, 3, 4, 5].map(i => document.getElementById('strengthSeg' + i))
        };
        return this.refs;
    }
};

export const toggleDarkMode = (isDark) => {
    if (isDark) {
        document.documentElement.classList.add('darkMode');
    } else {
        document.documentElement.classList.remove('darkMode');
    }
};

export const insertPaymentMethods = (methods, listEl, onEdit, onDelete) => {
    listEl.innerHTML = '';

    const fragment = document.createDocumentFragment();

    methods.forEach(method => {
        const item = document.createElement('div');
        item.classList.add('pmMethodItem');
        item.dataset.id = method.idPaymentMethod;

        const nameWrapper = document.createElement('div');
        nameWrapper.classList.add('pmMethodItemName');

        const dot = document.createElement('div');
        dot.classList.add('pmMethodDot');

        const name = document.createElement('span');
        name.textContent = method.methodName;

        nameWrapper.appendChild(dot);
        nameWrapper.appendChild(name);

        const actions = document.createElement('div');
        actions.classList.add('pmMethodActions');

        const btnEdit = document.createElement('button');
        btnEdit.classList.add('pmBtnEdit');
        btnEdit.type = 'button';
        btnEdit.textContent = 'Editar';
        btnEdit.addEventListener('click', () => onEdit(method, listEl));

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('pmBtnDelete');
        btnDelete.type = 'button';
        btnDelete.textContent = 'Eliminar';
        btnDelete.addEventListener('click', () => onDelete(method.idPaymentMethod));

        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        item.appendChild(nameWrapper);
        item.appendChild(actions);

        fragment.appendChild(item);
    });

    listEl.appendChild(fragment);
};

export const toggleSwitch = (switchElement, isDark) => {
    if (switchElement) {
        switchElement.checked = isDark;
    }
};

export const fillProfileForm = (profile, Refs) => {
    if (!profile) return;
    Refs.txtFullName.value = profile.fullName || '';
    Refs.txtEmployeeEmail.value = profile.email || '';
    Refs.txtEmployeePhone.value = profile.phone || '';
};

export const filltxtUsername = (username, txtUsername) => {
    if (!username) return;
    txtUsername.value = username || '';
};

export const  changeStyleTogglePassword = (icon) => {
    const current = parseFloat(icon.dataset.rotate || '0');
    const next = current + 180;
    icon.dataset.rotate = next;
    icon.style.transition = 'transform 0.5s';
    icon.style.transform = `rotate(${next}deg)`;
};

export const resetInputType = (input, icon) => {
    input.type = "text";
    icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>`;
};

export const changePasswordType = (input, icon) => {
    input.type = "password";
    icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
};

export const cleanTxtVerifyPassword = (input, toggle) => {
    input.value = '';
    changePasswordType(input, toggle);
};

export const cleanCampsToggleUsername = (refs, toggle) => {
    refs.txtCurrentUsername.value = '';
    refs.txtPasswordForUsername.value = '';
    refs.txtNewUsername.value = '';
    changePasswordType(refs.txtPasswordForUsername, toggle);
};

export const cleanCampsNewPassword = (refs, toggle1, toggle2) => {
    refs.txtNewPassword.value = '';
    refs.txtConfirmPassword.value = '';
    changePasswordType(refs.txtNewPassword, toggle1);
    changePasswordType(refs.txtConfirmPassword, toggle2);
};

export const updateLabel = (label, data) => {
    label.textContent = data.type;
    label.style.color = data.color;
};

export const setReq = (id, met) => {
    $(id).classList.toggle('met', met);
};
