import { changePasswordType, changeStyleTogglePassword, DOMRefs, fillProfileForm, filltxtUsername, resetInputType, toggleDarkMode, toggleSwitch } from "../../core/dom/configuraton.dom.js";
import { configurationState } from "../../core/state/configuration.state.js";
import { getCurrentEmployee, initSession } from "../../utils/api.utils.js";
import { showMessage, toggleModal } from "../../utils/dom.js";
import { initConfigurationEvents } from "./configuration.event.js";

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

const onOpenEditProfile = () => {
    toggleModal(DOMRefs.refs.modalProflile, true);
    fillProfileForm(configurationState.profile, DOMRefs.refs);
}

const onOpenToggleUsername = () => {
    toggleModal(DOMRefs.refs.modalChangeUsername, true);
    filltxtUsername(configurationState.profile.username, DOMRefs.refs.txtCurrentUsername);
}

const initializeUi = (Refs) => {
    initConfigurationEvents({ Refs, onChangeDarkMode, onOpenEditProfile, onCloseEditProfile: () => toggleModal(Refs.modalProflile, false), onOpenVerifyPassword: () => toggleModal(Refs.modalVerifyPassword, true), onCloseVerifyPassword: () => toggleModal(Refs.modalVerifyPassword, false), onOpenToggleUsername, onCloseToggleUsername: () => toggleModal(Refs.modalChangeUsername, false), onTogglePassword: (e, txtPassword) => onTogglePassword(e, txtPassword) });
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
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});