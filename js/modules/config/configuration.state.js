export const configurationState = {
    currentEmployeeId: null,
    isAdmin: false,
    isDarkMode: false,
    ticket: '',
    profile: {
        fullName: '',
        email: '',
        phone: '',
        username: ''
    }
};

export const resetConfigurationState = () => {
    configurationState.currentEmployeeId = null;
    configurationState.isAdmin = false;
    configurationState.isDarkMode = false;
    configurationState.ticket = '';
    configurationState.profile = {
        fullName: '',
        email: '',
        phone: '',
        username: ''
    };
};
