import { $ } from "../../utils/dom.js";


export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            darkModeToggle: $('darkModeToggle'),
        };
        return this.refs;
    }
};

export const toggleDarkMode = (isDark) => {
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
}

export const toggleSwitch = (switchElement, isDark) => {
    if (switchElement) {
        switchElement.checked = isDark;
    }
}