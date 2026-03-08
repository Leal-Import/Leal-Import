export const loginState = {
    auth: {
        email: '',
        resetId: '',
        ticket: ''
    },
    flags: {
        pendingLogin: false,
        pendingSend: false,
        pendingVerify: false,
        pendingUpdate: false
    },
    countdown: {
        timer: null,
        remainingSeconds: 0
    }
};
