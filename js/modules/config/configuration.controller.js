import { DOMRefs, toggleDarkMode, toggleSwitch } from "../../core/dom/configuraton.dom.js";
import { initSession } from "../../utils/api.utils.js";
import { showMessage } from "../../utils/dom.js";
import { initConfigurationEvents } from "./configuration.event.js";

const onChangeDarkMode = () => {
    const isDarkMode = localStorage.getItem('app.theme.dark') === 'true' ? false : true;
    toggleDarkMode(isDarkMode);
    localStorage.setItem('app.theme.dark', isDarkMode);
}

const initializeUi = (Refs) => {
    initConfigurationEvents({ Refs, onChangeDarkMode });
}

const loadDataFlow = (Refs) => {
    const isDarkMode = localStorage.getItem('app.theme.dark') === 'true' ? true : false;
    toggleSwitch(Refs.darkModeToggle, isDarkMode);
}

const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};


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