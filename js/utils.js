export const toggleModal = (modal, show) => {
    if (!modal) return;
    modal.classList.toggle("show", show);
    modal.classList.toggle("hide", !show);
};

export const setupModal = (openBtnSelector, modalSelector, closeBtnSelector, formId) => {
    const openBtn = document.querySelector(openBtnSelector);
    const closeBtn = document.querySelector(closeBtnSelector);
    const modal = document.querySelector(modalSelector);
    const form = document.querySelector(formId);

    if (!openBtn || !closeBtn || !modal) return;

    openBtn.addEventListener("click", () => {
        toggleModal(modal, true);
        form.reset();
    });
    closeBtn.addEventListener("click", () => {
        toggleModal(modal, false);
        form.reset();
    });
    modal.addEventListener("click", e => {
        if (e.target === modal) {
            toggleModal(modal, false);
            form.reset();
        }
    });
};

export const getInputsValues = (form) => {
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        if (input.id) {
            data[input.id] = input.value.trim();
        }
        else if (input.name) {
            data[input.name] = input.value.trim();
        }
    });
    return data;
};

export const showMessage = (title, message, type = 'info', isToast = false) => {
    let config = {
        icon: type,
        title: title,
        text: message,
        confirmButtonColor: '#007bff'
    };

    if (isToast) {
        config = {
            ...config,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        };
    } else {
        if (type === 'error') {
            config.confirmButtonColor = '#F44336';
        } else if (type === 'warning') {
            config.confirmButtonColor = '#ffc107';
        } else if (type === 'success') {
            config.showConfirmButton = false;
            config.timer = 2000;
        }
    }

    Swal.fire(config);
};

/* Validaciones */

/* Esto es para que se haga focus en el elemento q esta mal */
export const highlightAndFocus = (element) => {
    element.classList.add('input-error');
    element.focus();
};

export const isValidEmail = (email) => {
    if (!email) {
        return false;
    }
    const emailRegex = new RegExp(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (!emailRegex.test(email.toLowerCase())) {
        return false;
    }
    if (email.length > 254) {
        return false;
    }
    const atIndex = email.lastIndexOf('@');
    const domain = email.substring(atIndex + 1);
    const domainParts = domain.split('.');
    for (let part of domainParts) {
        if (part.length > 63) {
            return false;
        }
    }
    return true;
};

export const isValidPhone = (phone) => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(cleanPhone);
};

/* Validaciones evento input */

export const formatPhoneNumber = (inputElement) => {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    if (value.length > 4) {
        value = value.substring(0, 4) + '-' + value.substring(4, 8);
    }
    inputElement.value = value;
};