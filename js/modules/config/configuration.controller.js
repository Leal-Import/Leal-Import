import { changePasswordType, changeStyleTogglePassword, cleanCampsNewPassword, cleanCampsToggleUsername, cleanTxtVerifyPassword, DOMRefs, fillProfileForm, filltxtUsername, resetInputType, setReq, toggleDarkMode, toggleSwitch, updateLabel } from "../../core/dom/configuration.dom.js";
import { getPasswordStrengthOptions, getScore, validateMatch, validatePassword, validateProfile, validateUsernameChange } from "../../core/logic/configuration.logic.js";
import { configurationState } from "../../core/state/configuration.state.js";
import { getCurrentEmployee, initSession } from "../../utils/api.utils.js";
import { disableElement, hideElement, removeDisable, showElement, showMessage, toggleModal } from "../../utils/dom.js";
import { initConfigurationEvents } from "./configuration.event.js";
import { changePassword, editProfile, logout, verifyCurrentPassword } from "../../service/configuration.service.js";

const onChangeDarkMode = () => {
    const isDarkMode = localStorage.getItem('app.theme.dark') === 'true' ? false : true;
    toggleDarkMode(isDarkMode);
    localStorage.setItem('app.theme.dark', isDarkMode);
}

const onTogglePassword = (e, txtPassword) => {
    const btn = e.currentTarget;
    const icon = btn.querySelector('svg');
    changeStyleTogglePassword(icon);
    if (txtPassword.type === 'password') {
        resetInputType(txtPassword, icon);
    } else {
        changePasswordType(txtPassword, icon);
    }
}

const onVerifyPassword = async (e) => {
    e.preventDefault();

    const password = DOMRefs.refs.txtVerifyPassword.value.trim();

    if (!password) {
        await showMessage('Advertencia', 'Por favor ingresa tu contraseña actual.', 'warning');
        return;
    }
    showElement(DOMRefs.refs.btnVerifyCurrentPasswordLoader);
    disableElement(DOMRefs.refs.btnVerifyCurrentPassword);
    try {
        const response = await verifyCurrentPassword(password);
        configurationState.ticket = response.ticket;
        await showMessage('Éxito', 'Contraseña verificada correctamente. Ahora puedes ingresar tu nueva contraseña.', 'success', true);
        toggleModal(DOMRefs.refs.modalNewPassword, true);
        toggleModal(DOMRefs.refs.modalVerifyPassword, false);
    } catch (error) {
        console.log(error.message)
        await showMessage('Error', error.message || 'Ocurrió un error al verificar la contraseña. Inténtalo de nuevo.', 'error');
    } finally {
        const btn = DOMRefs.refs.toggleVerifyPassword;
        const icon = btn.querySelector('svg');
        hideElement(DOMRefs.refs.btnVerifyCurrentPasswordLoader);
        removeDisable(DOMRefs.refs.btnVerifyCurrentPassword);
        cleanTxtVerifyPassword(DOMRefs.refs.txtVerifyPassword, icon);
    }
}

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
}

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
    disableElement(DOMRefs.refs.btnUpdatePassword);
    try {
        await changePassword(pw1.value.trim(), configurationState.ticket);
        await showMessage('Éxito', 'Contraseña cambiada correctamente', 'success', true);
        toggleModal(DOMRefs.refs.modalNewPassword, false);
    } catch (error) {
        console.error('Error updating password:', error);
        await showMessage('Error', 'Ocurrió un error al actualizar la contraseña. Inténtalo de nuevo.', 'error');
    } finally {
        hideElement(DOMRefs.refs.btnUpdatePasswordLoader);
        removeDisable(DOMRefs.refs.btnUpdatePassword);
        cleanNewPasswordForm();
    }
}

const cleanNewPasswordForm = () => {
    const toggle1 = DOMRefs.refs.toggleNewPassword;
    const toggle2 = DOMRefs.refs.toggleConfirmPassword;
    const icon1 = toggle1.querySelector('svg');
    const icon2 = toggle2.querySelector('svg');
    cleanCampsNewPassword(DOMRefs.refs, icon1, icon2);
    onVerifyNewPassword(); // Para resetear el estado del botón y validaciones
    checkBtn(0, DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword);
    validateMatch(DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword, DOMRefs.refs.passwordMatchHint);
}

const checkBtn = (score, pw1, pw2) => {
    if ((score === 5) && pw1.value === pw2.value && pw1.value.length > 0) {
        removeDisable(DOMRefs.refs.btnUpdatePassword);
    } else {
        disableElement(DOMRefs.refs.btnUpdatePassword);
    }
}

const onOpenEditProfile = () => {
    toggleModal(DOMRefs.refs.modalProflile, true);
    fillProfileForm(configurationState.profile, DOMRefs.refs);
}

const onOpenToggleUsername = () => {
    toggleModal(DOMRefs.refs.modalChangeUsername, true);
    filltxtUsername(configurationState.profile.username, DOMRefs.refs.txtCurrentUsername);
}

const onCloseNewPassword = () => {
    toggleModal(DOMRefs.refs.modalNewPassword, false);
    cleanNewPasswordForm();
}

const onCloseVerifyPassword = () => {
    const btn = DOMRefs.refs.toggleVerifyPassword;
    const icon = btn.querySelector('svg');
    toggleModal(DOMRefs.refs.modalVerifyPassword, false);
    cleanTxtVerifyPassword(DOMRefs.refs.txtVerifyPassword, icon);
}

const onCloseToggleUsername = () => {
    const btn = DOMRefs.refs.togglePasswordForUsername;
    const icon = btn.querySelector('svg');
    toggleModal(DOMRefs.refs.modalChangeUsername, false);
    cleanCampsToggleUsername(DOMRefs.refs, icon);
}

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
}

const onLogout = async () => {
    const response = await showMessage('Confirmar', '¿Estás seguro que deseas cerrar sesión?', 'question', false, true);
    if (response.isConfirmed) {
        try {
            await logout();
        } catch (error) {
            console.error('Error during logout:', error);
            await showMessage('Error', 'Ocurrió un error al cerrar sesión. Inténtalo de nuevo.', 'error');
        } finally {
            window.location.href = 'login.html';
        }
    }
}

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
    disableElement(DOMRefs.refs.btnEditProfile);
    try {
        await editProfile(payload)
        await showMessage('Éxito', 'Perfil actualizado correctamente', 'success', true);
        configurationState.profile.fullName = txtFullName.value.trim();
        configurationState.profile.email = txtEmail.value.trim();
        configurationState.profile.phone = txtPhone.value.trim();
        toggleModal(DOMRefs.refs.modalProflile, false);
    } catch (error) {
        console.error('Error updating profile:', error);
        await showMessage('Error', 'Ocurrió un error al actualizar el perfil. Inténtalo de nuevo.', 'error');
    } finally {
        hideElement(DOMRefs.refs.btnEditProfileLoader);
        removeDisable(DOMRefs.refs.btnEditProfile);
    }
}


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
    disableElement(DOMRefs.refs.btnSaveUsername);

    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula llamada al backend
        await showMessage('Éxito', 'Nombre de usuario actualizado correctamente', 'success', true);
        configurationState.profile.username = txtNewUsername.value.trim();
    } catch (error) {
        console.error('Error updating username:', error);
        await showMessage('Error', 'No se pudo actualizar el nombre de usuario', 'error');
    } finally {
        hideElement(DOMRefs.refs.btnSaveUsernameLoader);
        removeDisable(DOMRefs.refs.btnSaveUsername);
        toggleModal(DOMRefs.refs.modalChangeUsername, false);
        cleanCampsToggleUsername(DOMRefs.refs, DOMRefs.refs.togglePasswordForUsername.querySelector('svg'));
    }
}

const initializeUi = (Refs) => {
    initConfigurationEvents({
        Refs,
        onChangeDarkMode,
        onOpenEditProfile,
        onCloseEditProfile: () => toggleModal(Refs.modalProflile, false),
        onOpenVerifyPassword: () => toggleModal(Refs.modalVerifyPassword, true),
        onCloseVerifyPassword,
        onOpenToggleUsername,
        onCloseToggleUsername,
        onTogglePassword: (e, txtPassword) => onTogglePassword(e, txtPassword),
        onVerifyPassword,
        onCloseNewPassword,
        onVerifyNewPassword,
        onChangePassword,
        onVerifyButtonUsername,
        onChangeUsername,
        onLogout,
        onEditProfile,
        onVerifyConfirmPassword: () => {
            validateMatch(DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword, DOMRefs.refs.passwordMatchHint);
            checkBtn(getScore(DOMRefs.refs.txtNewPassword.value), DOMRefs.refs.txtNewPassword, DOMRefs.refs.txtConfirmPassword);
        }
    });
}

const loadDataFlow = (Refs) => {
    toggleSwitch(Refs.darkModeToggle, configurationState.isDarkMode);
}

const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    const stateLoaded = await loadState();
    if (!stateLoaded) return false;
    return true;
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
        console.error('Error loading configuration state: ', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();

        initializeUi(refs);

        loadDataFlow(refs);
    } catch (error) {
        console.error('Error initializing application:', error);
        await showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});