
export function initConfigurationEvents({ Refs, onChangeDarkMode }) {

    Refs.darkModeToggle.addEventListener("change", onChangeDarkMode);

}
