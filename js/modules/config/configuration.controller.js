import { changePasswordType, changeStyleTogglePassword, cleanCampsNewPassword, cleanCampsToggleUsername, cleanTxtVerifyPassword, DOMRefs, fillProfileForm, filltxtUsername, insertPaymentMethods, resetInputType, setReq, toggleDarkMode, toggleSwitch, updateLabel } from "./configuration.dom.js";
import { validatePaymentMethod, validateProfile, validateUsernameChange } from "./configuration.logic.js";
import { configurationState, resetConfigurationState } from "./configuration.state.js";
import { getCurrentEmployee, handleApiError } from "../../utils/api.utils.js";
import { disableElement, hideElement, removeDisable, showElement, showMessage, toggleModal, createModuleInitializer, qsa } from "../../utils/dom.js";
import { navigateTo, ROUTES } from "../../utils/router.js";
import { initConfigurationEvents } from "./configuration.event.js";
import { changePassword, deletePaymentMethod, editProfile, getPaymentMethods, logout, postPaymentMethod, putPaymentMethod, putUsername, verifyCurrentPassword } from "./configuration.service.js";
import { getPasswordStrengthOptions, getScore, validateMatch, validatePassword } from "../../core/logic/new.password.logic.js";

const onChangeDarkMode = () => {
    const isDarkMode = localStorage.getItem('app.theme.dark') === 'true' ? false : true;
    toggleDarkMode(isDarkMode);
    localStorage.setItem('app.theme.dark', isDarkMode);
};

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

const onVerifyPassword = async (e) => {
    e.preventDefault();

    const password = DOMRefs.refs.txtVerifyPassword.value.trim();

    if (!password) {
        await showMessage('Advertencia', 'Por favor ingresa tu contraseña actual.', 'warning');
        return;
    }
    showElement(DOMRefs.refs.btnVerifyCurrentPasswordLoader);
    disableElement(DOMRefs.refs.txtVerifyPassword);
    disableElement(DOMRefs.refs.toggleVerifyPassword);
    disableElement(DOMRefs.refs.btnVerifyCurrentPassword);
    try {
        const response = await verifyCurrentPassword(password);
        configurationState.ticket = response.ticket;
        await showMessage('Éxito', 'Contraseña verificada correctamente. Ahora puedes ingresar tu nueva contraseña.', 'success', true);
        toggleModal(DOMRefs.refs.modalNewPassword, true);
        toggleModal(DOMRefs.refs.modalVerifyPassword, false);
    } catch (error) {
        await handleApiError(error, 'Contraseña incorrecta. Por favor, inténtalo de nuevo.');
    } finally {
        const btn = DOMRefs.refs.toggleVerifyPassword;
        const icon = btn.querySelector('svg');
        hideElement(DOMRefs.refs.btnVerifyCurrentPasswordLoader);
        removeDisable(DOMRefs.refs.btnVerifyCurrentPassword);
        removeDisable(DOMRefs.refs.toggleVerifyPassword);
        removeDisable(DOMRefs.refs.txtVerifyPassword);
        cleanTxtVerifyPassword(DOMRefs.refs.txtVerifyPassword, icon);
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

const onChangePassword = async (e) => {
    e.preventDefault();
    const pw1 = DOMRefs.refs.txtNewPassword;
    const pw2 = DOMRefs.refs.txtConfirmPassword;

    const invalidate = validatePassword(pw1.value.trim(), pw2.value.trim());
    if (invalidate) {
        await showMessage('Contraseña no válida', invalidate, 'warning');
        return;
    }

    showElement(DOMRefs.refs.btnUpdatePasswordLoader);
    disableElement(pw1);
    disableElement(pw2);
    disableElement(DOMRefs.refs.toggleNewPassword);
    disableElement(DOMRefs.refs.toggleConfirmPassword);
    disableElement(DOMRefs.refs.btnUpdatePassword);
    try {
        await changePassword(pw1.value.trim(), configurationState.ticket);
        await showMessage('Éxito', 'Contraseña cambiada correctamente', 'success', true);
        toggleModal(DOMRefs.refs.modalNewPassword, false);
    } catch (error) {
        await handleApiError(error, 'No se pudo cambiar la contraseña. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.btnUpdatePasswordLoader);
        removeDisable(pw1);
        removeDisable(pw2);
        removeDisable(DOMRefs.refs.toggleNewPassword);
        removeDisable(DOMRefs.refs.toggleConfirmPassword);
        removeDisable(DOMRefs.refs.btnUpdatePassword);
        cleanNewPasswordForm();
    }
};

const cleanNewPasswordForm = () => {
    const toggle1 = DOMRefs.refs.toggleNewPassword;
    const toggle2 = DOMRefs.refs.toggleConfirmPassword;
    const icon1 = toggle1.querySelector('svg');
    const icon2 = toggle2.querySelector('svg');
    cleanCampsNewPassword(DOMRefs.refs, icon1, icon2);
    onVerifyNewPassword(); // Para resetear el estado del botón y validaciones
    checkBtn(0, DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword);
    validateMatch(DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword, DOMRefs.refs.passwordMatchHint);
};

const checkBtn = (score, pw1, pw2) => {
    if ((score === 5) && pw1.value === pw2.value && pw1.value.length > 0) {
        removeDisable(DOMRefs.refs.btnUpdatePassword);
    } else {
        disableElement(DOMRefs.refs.btnUpdatePassword);
    }
};

const onOpenEditProfile = () => {
    toggleModal(DOMRefs.refs.modalProflile, true);
    fillProfileForm(configurationState.profile, DOMRefs.refs);
};

const onOpenToggleUsername = () => {
    toggleModal(DOMRefs.refs.modalChangeUsername, true);
    filltxtUsername(configurationState.profile.username, DOMRefs.refs.txtCurrentUsername);
};

const onCloseNewPassword = () => {
    toggleModal(DOMRefs.refs.modalNewPassword, false);
    cleanNewPasswordForm();
};

const onCloseVerifyPassword = () => {
    const btn = DOMRefs.refs.toggleVerifyPassword;
    const icon = btn.querySelector('svg');
    toggleModal(DOMRefs.refs.modalVerifyPassword, false);
    cleanTxtVerifyPassword(DOMRefs.refs.txtVerifyPassword, icon);
};

const onCloseToggleUsername = () => {
    const btn = DOMRefs.refs.togglePasswordForUsername;
    const icon = btn.querySelector('svg');
    toggleModal(DOMRefs.refs.modalChangeUsername, false);
    cleanCampsToggleUsername(DOMRefs.refs, icon);
};

const onVerifyButtonUsername = () => {
    const btn = DOMRefs.refs.btnSaveUsername;
    const currentUsername = DOMRefs.refs.txtCurrentUsername.value.trim();
    const newUsername = DOMRefs.refs.txtNewUsername.value.trim();
    const password = DOMRefs.refs.txtPasswordForUsername.value.trim();

    if (currentUsername && newUsername && password && newUsername !== currentUsername) {
        removeDisable(btn);
    } else {
        disableElement(btn);
    }
};

const onLogout = async () => {
    const response = await showMessage('Confirmar', '¿Estás seguro que deseas cerrar sesión?', 'question', false, true);
    if (response.isConfirmed) {
        try {
            await logout();
        } catch (error) {
            await handleApiError(error, 'No se pudo cerrar sesión correctamente. Redirigiendo al login de todas formas.');
        } finally {
            navigateTo(ROUTES.LOGIN);
        }
    }
};

const onEditProfile = async (e) => {
    e.preventDefault();
    const txtFullName = DOMRefs.refs.txtFullName;
    const txtEmail = DOMRefs.refs.txtEmployeeEmail;
    const txtPhone = DOMRefs.refs.txtEmployeePhone;

    const invalidate = validateProfile(txtFullName.value.trim(), txtEmail.value.trim(), txtPhone.value.trim());
    if (invalidate) {
        await showMessage('Advertencia', invalidate, 'warning');
        return;
    }
    const payload = {
        fullName: txtFullName.value.trim(),
        email: txtEmail.value.trim(),
        phone: txtPhone.value.trim()
    };

    showElement(DOMRefs.refs.btnEditProfileLoader);
    disableElement(txtFullName);
    disableElement(txtEmail);
    disableElement(txtPhone);
    disableElement(DOMRefs.refs.btnEditProfile);
    try {
        await editProfile(payload);
        await showMessage('Éxito', 'Perfil actualizado correctamente', 'success', true);
        configurationState.profile.fullName = txtFullName.value.trim();
        configurationState.profile.email = txtEmail.value.trim();
        configurationState.profile.phone = txtPhone.value.trim();
        toggleModal(DOMRefs.refs.modalProflile, false);
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el perfil. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.btnEditProfileLoader);
        removeDisable(txtFullName);
        removeDisable(txtEmail);
        removeDisable(txtPhone);
        removeDisable(DOMRefs.refs.btnEditProfile);
    }
};

const onOpenPaymentMethods = async () => {
    hideElement(DOMRefs.refs.pmHint);
    DOMRefs.refs.txtPaymentMethod.value = '';
    DOMRefs.refs.txtPaymentMethod.classList.remove('inputValid');
    DOMRefs.refs.txtPaymentMethod.classList.remove('inputInvalid');
    toggleModal(DOMRefs.refs.modalPaymentMethods, true);
    if (configurationState.paymentMethods.length === 0) {
        try {
            const paymentMethods = await getPaymentMethods();
            configurationState.paymentMethods = paymentMethods;
        } catch (error) {
            await handleApiError(error, 'No se pudieron cargar los métodos de pago. Por favor, inténtalo de nuevo más tarde.');
        }
    }
    insertPaymentMethods(configurationState.paymentMethods, DOMRefs.refs.pmMethodList, onEditPaymentMethod, onDeletePaymentMethod);
};

const onSavePaymentMethod = async (updatedMethod) => {
    if (!updatedMethod) {
        insertPaymentMethods(configurationState.paymentMethods, DOMRefs.refs.pmMethodList, onEditPaymentMethod, onDeletePaymentMethod);
        return;
    }
    const camps = qsa("#modalPaymentMethods .pmBtnEdit, #modalPaymentMethods .pmEditInput, #modalPaymentMethods .pmBtnDelete, #txtPaymentMethod, #btnAddPaymentMethod");
    camps.forEach(disableElement);
    try {
        await putPaymentMethod(updatedMethod, updatedMethod.idPaymentMethod);
        configurationState.paymentMethods = configurationState.paymentMethods.map(m =>
            m.idPaymentMethod === updatedMethod.idPaymentMethod ? updatedMethod : m
        );
        await showMessage('Éxito', 'Método de pago actualizado correctamente', 'success', true);
        insertPaymentMethods(configurationState.paymentMethods, DOMRefs.refs.pmMethodList, onEditPaymentMethod, onDeletePaymentMethod);
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el método de pago.');
    } finally {
        camps.forEach(removeDisable);
    }
};

export const onEditPaymentMethod = (method, listEl) => {
    const item = listEl.querySelector(`[data-id="${method.idPaymentMethod}"]`);
    if (!item) return;
    item.innerHTML = '';

    const nameWrapper = document.createElement('div');
    nameWrapper.classList.add('pmMethodItemName');

    const dot = document.createElement('div');
    dot.classList.add('pmMethodDot');

    const input = document.createElement('input');
    input.classList.add('pmEditInput');
    input.type = 'text';
    input.value = method.methodName;
    input.maxLength = 50;

    nameWrapper.appendChild(dot);
    nameWrapper.appendChild(input);

    const actions = document.createElement('div');
    actions.classList.add('pmMethodActions');

    const btnSave = document.createElement('button');
    btnSave.classList.add('pmBtnEdit');
    btnSave.type = 'button';
    btnSave.textContent = 'Guardar';
    btnSave.addEventListener('click', () => {
        const newName = input.value.trim();
        if (!newName) return;
        onSavePaymentMethod({ ...method, methodName: newName });
    });

    const btnCancel = document.createElement('button');
    btnCancel.classList.add('pmBtnDelete');
    btnCancel.type = 'button';
    btnCancel.textContent = 'Cancelar';
    btnCancel.addEventListener('click', () => onSavePaymentMethod(null));

    actions.appendChild(btnSave);
    actions.appendChild(btnCancel);

    item.appendChild(nameWrapper);
    item.appendChild(actions);

    input.focus();
};

const onDeletePaymentMethod = async (methodId) => {
    const response = await showMessage('Confirmar', '¿Estás seguro que deseas eliminar este método de pago?', 'question', false, true);
    if (response.isConfirmed) {
        const camps = qsa("#modalPaymentMethods .pmBtnEdit, #modalPaymentMethods .pmEditInput, #modalPaymentMethods .pmBtnDelete, #txtPaymentMethod, #btnAddPaymentMethod");
        camps.forEach(disableElement);
        try {
            await deletePaymentMethod(methodId);
            configurationState.paymentMethods = configurationState.paymentMethods.filter(m => m.idPaymentMethod !== methodId);
            await showMessage('Éxito', 'Método de pago eliminado correctamente', 'success', true);
            insertPaymentMethods(configurationState.paymentMethods, DOMRefs.refs.pmMethodList, onEditPaymentMethod, onDeletePaymentMethod);
        } catch (error) {
            await handleApiError(error, 'No se pudo eliminar el método de pago.');
        } finally {
            camps.forEach(removeDisable);
        }
    }
};

const onSubmitPaymentMethod = async () => {
    const methodName = DOMRefs.refs.txtPaymentMethod.value.trim();
    const invalidate = validatePaymentMethod(methodName);
    if (invalidate) {
        await showMessage('Advertencia', invalidate, 'warning');
        return;
    }
    const camps = qsa("#modalPaymentMethods .pmBtnEdit, #modalPaymentMethods .pmEditInput, #modalPaymentMethods .pmBtnDelete, #txtPaymentMethod, #btnAddPaymentMethod");
    showElement(DOMRefs.refs.btnAddPaymentMethodLoader);
    camps.forEach(disableElement);
    try {
        const newMethod = await postPaymentMethod({ methodName });
        configurationState.paymentMethods.push(newMethod.data);
        await showMessage('Éxito', 'Método de pago agregado correctamente', 'success', true);
        DOMRefs.refs.txtPaymentMethod.value = '';
        insertPaymentMethods(configurationState.paymentMethods, DOMRefs.refs.pmMethodList, onEditPaymentMethod, onDeletePaymentMethod);
    } catch (error) {
        await handleApiError(error, 'No se pudo agregar el método de pago. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.btnAddPaymentMethodLoader);
        DOMRefs.refs.txtPaymentMethod.classList.remove('inputValid');
        camps.forEach(removeDisable);
    }
};

const onChangeUsername = async (e) => {
    e.preventDefault();
    const txtCurrentUsername = DOMRefs.refs.txtCurrentUsername;
    const txtNewUsername = DOMRefs.refs.txtNewUsername;
    const txtPassword = DOMRefs.refs.txtPasswordForUsername;

    const invalidate = validateUsernameChange(txtCurrentUsername.value.trim(), txtNewUsername.value.trim(), txtPassword.value.trim());
    if (invalidate) {
        await showMessage('Advertencia', invalidate, 'warning');
        return;
    }

    showElement(DOMRefs.refs.btnSaveUsernameLoader);
    disableElement(DOMRefs.refs.togglePasswordForUsername);
    disableElement(txtNewUsername);
    disableElement(txtPassword);
    disableElement(DOMRefs.refs.btnSaveUsername);
    const payload = {
        currentUsername: txtCurrentUsername.value.trim(),
        newUsername: txtNewUsername.value.trim(),
        password: txtPassword.value.trim()
    };

    try {
        await putUsername(payload);
        await showMessage('Éxito', 'Nombre de usuario actualizado correctamente', 'success', true);
        configurationState.profile.username = txtNewUsername.value.trim();
        toggleModal(DOMRefs.refs.modalChangeUsername, false);
        cleanCampsToggleUsername(DOMRefs.refs, DOMRefs.refs.togglePasswordForUsername.querySelector('svg'));
    } catch (error) {
        await handleApiError(error, 'No se pudo cambiar el nombre de usuario. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.btnSaveUsernameLoader);
        removeDisable(DOMRefs.refs.btnSaveUsername);
        removeDisable(DOMRefs.refs.togglePasswordForUsername);
        removeDisable(txtNewUsername);
        removeDisable(txtPassword);
    }
};

const onVerifyPaymentMethod = (e) => {
    const value = e.currentTarget.value.trim();
    const methodValidate = validatePaymentMethod(value);
    if (methodValidate) {
        DOMRefs.refs.txtPaymentMethod.classList.add('inputInvalid');
        DOMRefs.refs.txtPaymentMethod.classList.remove('inputValid');
        disableElement(DOMRefs.refs.btnAddPaymentMethod);
        showElement(DOMRefs.refs.pmHint);
        DOMRefs.refs.pmHint.textContent = methodValidate;
    } else {
        DOMRefs.refs.txtPaymentMethod.classList.remove('inputInvalid');
        DOMRefs.refs.txtPaymentMethod.classList.add('inputValid');
        removeDisable(DOMRefs.refs.btnAddPaymentMethod);
        hideElement(DOMRefs.refs.pmHint);
    }
};

const initializeUi = (Refs) => {
    initConfigurationEvents({
        Refs,
        onChangeDarkMode,
        onOpenEditProfile,
        onCloseEditProfile: () => toggleModal(Refs.modalProflile, false),
        onOpenVerifyPassword: () => toggleModal(Refs.modalVerifyPassword, true),
        onOpenPaymentMethods,
        onClosePaymentMethods: () => toggleModal(Refs.modalPaymentMethods, false),
        onCloseVerifyPassword,
        onOpenToggleUsername,
        onCloseToggleUsername,
        onTogglePassword: (e, txtPassword) => onTogglePassword(e, txtPassword),
        onVerifyPassword,
        onCloseNewPassword,
        onVerifyNewPassword,
        onChangePassword,
        onVerifyButtonUsername,
        onVerifyPaymentMethod,
        onSubmitPaymentMethod,
        onChangeUsername,
        onLogout,
        onEditProfile,
        onVerifyConfirmPassword: () => {
            validateMatch(DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword, DOMRefs.refs.passwordMatchHint);
            checkBtn(getScore(DOMRefs.refs.txtNewPassword.value), DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword);
        }
    });
};

const loadDataFlow = (Refs) => {
    toggleSwitch(Refs.darkModeToggle, configurationState.isDarkMode);
};

const loadState = async () => {
    try {
        configurationState.isDarkMode = localStorage.getItem('app.theme.dark') === 'true' ? true : false;
        const employee = await getCurrentEmployee();
        configurationState.employee = employee;
        configurationState.profile.fullName = employee.fullName;
        configurationState.profile.email = employee.email;
        configurationState.profile.phone = employee.phone;
        configurationState.profile.username = employee.username;
        configurationState.isAdmin = employee.role === 'Administrador';

        return true;
    } catch (error) {
        await handleApiError(error, 'No se pudo cargar la configuración del usuario. Algunas funciones podrían no estar disponibles.');
        return false;
    }
};

const initializeUIWithLoad = async (refs) => {
    initializeUi(refs);
    const stateReady = await loadState();
    if (!stateReady) throw new Error('Failed to load state');
    loadDataFlow(refs);
};

const init = createModuleInitializer({
    resetState: resetConfigurationState,
    initialize: initializeUIWithLoad,
    load: async () => { },
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
