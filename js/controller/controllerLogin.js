'use strict';

import {
  login,
  verifyEmail,
  verifyPIN,
  resetPassword
} from "../service/login.service.js";

// ---------- Background image ----------
const lealBg = document.getElementById('RiskorBackground');
const bg = '../media/appMedia/bgLogin.png';

if (lealBg) {
  Object.assign(lealBg.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '-1',
    backgroundImage: `url("${bg}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  });
}

// ---------- Elements ----------
const frmLogin = document.getElementById('formLogin');
const loginButton = frmLogin?.querySelector('.formLogin');

// flags
let pendingUpdate = false;

// ---------- Toggle password ----------
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.togglePassword');
  const passwordInput = document.getElementById('passwordInput');
  if (!toggle || !passwordInput) return;

  const icon = toggle.querySelector('i');
  let rotation = 0;

  toggle.addEventListener('click', function () {
    rotation += 180;
    icon.style.transition = 'transform 0.5s';
    icon.style.transform = `rotate(${rotation}deg)`;

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.replace('bx-hide', 'bx-show');
    } else {
      passwordInput.type = 'password';
      icon.classList.replace('bx-show', 'bx-hide');
    }
  });
});

// ---------- Login submit ----------
frmLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const credentials = document.getElementById("userInput")?.value ?? '';
  const password = document.getElementById("passwordInput")?.value ?? '';

  if (!credentials.trim() || !password.trim()) {
    await Swal.fire({
      icon: 'error',
      title: 'Datos inválidos',
      text: 'Revisa correo y contraseña.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#616FEF',
      background: '#f8fbff',
      color: '#3d3d6b',
      iconColor: '#616FEF',
    });
    return;
  }

  if (loginButton) {
    loginButton.disabled = true;
    loginButton.textContent = 'Cargando...';
  }

  try {
    await login(credentials, password);

    await Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `Hola, ${credentials.trim()}`,
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#616FEF',
      background: '#f8fbff',
      color: '#3d3d6b',
      iconColor: '#616FEF',
    });

    localStorage.setItem("navItem", "dashItem");
    window.location.href = 'dashboard.html';

  } catch (error) {
    let titulo = 'Error';
    let texto = error?.message || 'Ocurrió un error';

    if (texto.includes("401") || texto.toLowerCase().includes("credenciales")) {
      titulo = "Usuario no encontrado";
      texto = "Credenciales inválidas. Inténtalo de nuevo.";
    }

    await Swal.fire({
      icon: 'error',
      title: titulo,
      text: texto,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#616FEF',
      background: '#f8fbff',
      color: '#3d3d6b',
      iconColor: '#616FEF',
    });
  } finally {
    if (loginButton) {
      loginButton.disabled = false;
      loginButton.textContent = 'Iniciar Sesión';
    }
  }
});

// ---------- Modales & Recovery flow ----------
document.addEventListener('DOMContentLoaded', function () {
  // Botón casita
  const btnBackHome = document.getElementById('btnBackHome');
  if (btnBackHome) {
    btnBackHome.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
      window.location.href = '/index.html';
    });
  }

  // Modals
  const modalRecovery = document.getElementById('modalRecovery');
  const modalAuth = document.getElementById('modalAuth');
  const modalPIN = document.getElementById('modalCode');
  const modalNewPassword = document.getElementById('modalNewPassword');

  // Close buttons
  const closeRecoveryBtn = document.querySelector('.closeBtn');
  const closeAuthBtn = document.getElementById('closeAuth');
  const closePINBtn = document.getElementById('closeCode');
  const closeNewPassword = document.getElementById('closeNewPassword');

  // Open buttons
  const btnAuthEmail = document.getElementById('openAuth');
  const openModalRecovery = document.getElementById('openModalRecovery');

  // Auth nodes
  const authEmailInput = document.getElementById('authEmail');
  const authSuccessDiv = document.querySelector('.authSuccess');
  const authPrimaryBtn = document.querySelector('#modalAuth .btnPrimary');

  // PIN nodes
  const codeInputs = Array.from(document.querySelectorAll('#modalCode .codeDigit'));
  const btnVerifyCode = document.getElementById('btnCodeContinue');
  const modalCodeBody = document.querySelector('.modalCodeBody');

  // New password nodes
  const btnUpdatePassword = document.getElementById('btnUpdatePassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  // Flow state (YA alineado con tus JSON)
  let currentEmail = '';
  let currentResetId = ''; // viene de /request
  let currentTicket = '';  // viene de /verify

  // Timers & pending
  let countdownTimer = null;
  let countdownRemainingSeconds = 0;
  let pendingSend = false;
  let pendingVerify = false;

  // ----- Open recovery -----
  openModalRecovery?.addEventListener('click', (e) => {
    e.preventDefault();
    if (modalRecovery) modalRecovery.style.display = 'flex';
  });

  // ----- Close recovery -----
  closeRecoveryBtn?.addEventListener('click', () => {
    if (modalRecovery) modalRecovery.style.display = 'none';
  });

  // ----- Go to auth modal -----
  btnAuthEmail?.addEventListener('click', (e) => {
    e.preventDefault();
    if (modalRecovery) modalRecovery.style.display = 'none';
    if (modalAuth) modalAuth.style.display = 'flex';
  });

  // ----- Close auth (back to recovery) -----
  closeAuthBtn?.addEventListener('click', () => {
    if (modalAuth) modalAuth.style.display = 'none';
    if (modalRecovery) modalRecovery.style.display = 'flex';
    if (authEmailInput) authEmailInput.value = '';
    if (authSuccessDiv) authSuccessDiv.innerHTML = '';
  });

  // ----- Close PIN (reset flow) -----
  closePINBtn?.addEventListener('click', () => {
    if (modalPIN) modalPIN.style.display = 'none';
    if (modalRecovery) modalRecovery.style.display = 'flex';
    clearCurrentFlow();
  });

  // ----- Close New Password -----
  closeNewPassword?.addEventListener('click', () => {
    if (modalNewPassword) modalNewPassword.style.display = 'none';
  });

  // PIN input behavior
  initPinInputs(codeInputs);

  // =========================
  // STEP 1: /request (verifyEmail)
  // =========================
  authPrimaryBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (pendingSend) return;

    const email = authEmailInput?.value?.trim().toLowerCase();
    if (!isValidEmail(email)) {
      await Swal.fire({
        icon: 'error',
        title: 'Email inválido',
        text: 'Por favor, ingresa un correo válido.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      return;
    }

    pendingSend = true;
    authPrimaryBtn.disabled = true;
    authPrimaryBtn.textContent = 'Enviando...';

    try {
      // verifyEmail retorna JSON: esperamos resetId (+minutes opcional)
      const data = await verifyEmail(email);

      // Alineado con tu modelo: data.resetId
      currentResetId = data?.resetId || '';
      if (!currentResetId) {
        throw new Error('El servidor no devolvió resetId. Revisa el endpoint /request.');
      }

      const minutes = (typeof data?.minutes === 'number') ? data.minutes : 15;

      await Swal.fire({
        icon: 'success',
        title: 'Enlace enviado',
        text: `Se ha enviado un mensaje al correo ${maskEmailSimple(email)}.`,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });

      currentEmail = email;

      if (modalAuth) modalAuth.style.display = 'none';
      if (modalPIN) modalPIN.style.display = 'flex';

      renderMaskedEmail(email);
      startCountdown(minutes);
      focusFirstCodeInput(codeInputs);

    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Error enviando enlace',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
    } finally {
      pendingSend = false;
      authPrimaryBtn.disabled = false;
      authPrimaryBtn.textContent = 'Listo';
    }
  });

  // =========================
  // STEP 2: /verify (verifyPIN)
  // JSON esperado (tu ejemplo):
  // { resetId, email, code } -> response { ticket }
  // =========================
  btnVerifyCode?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (pendingVerify) return;

    const code = codeInputs.map(i => i.value).join('');

    if (code.length !== codeInputs.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'Código incompleto',
        text: 'Ingresa el código completo.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      return;
    }

    if (!currentEmail || !currentResetId) {
      await Swal.fire({
        icon: 'error',
        title: 'Sesión inválida',
        text: 'Reinicia el proceso y solicita un nuevo correo.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      clearCurrentFlow();
      return;
    }

    pendingVerify = true;
    btnVerifyCode.disabled = true;
    btnVerifyCode.textContent = 'Verificando...';

    try {
      const data = await verifyPIN(currentResetId, currentEmail, code);

      // Alineado con tu modelo: data.ticket
      currentTicket = data?.ticket || '';
      if (!currentTicket) {
        throw new Error('No se recibió ticket. Revisa el endpoint /verify.');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Verificado',
        text: 'Código correcto. Ahora puedes cambiar tu contraseña.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });

      if (modalPIN) modalPIN.style.display = 'none';
      if (modalNewPassword) modalNewPassword.style.display = 'flex';
      clearCountdown();

    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Código inválido',
        text: err?.message || 'No se pudo verificar el código.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      focusFirstCodeInput(codeInputs);
    } finally {
      pendingVerify = false;
      btnVerifyCode.disabled = false;
      btnVerifyCode.textContent = 'Listo';
    }
  });

  // =========================
  // STEP 3: /confirm (resetPassword)
  // JSON esperado (tu ejemplo):
  // { ticket, newPassword }
  // =========================
  btnUpdatePassword?.addEventListener('click', async () => {
    if (pendingUpdate) return;

    const newPass = newPasswordInput?.value?.trim() ?? '';
    const confirmPass = confirmPasswordInput?.value?.trim() ?? '';

    if (!newPass || !confirmPass) {
      await Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa ambos campos.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      return;
    }

    if (newPass !== confirmPass) {
      await Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Las contraseñas ingresadas no coinciden.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      return;
    }

    const v = validatePassword(newPass);
    if (!v.ok) return;

    if (!currentTicket) {
      await Swal.fire({
        icon: 'error',
        title: 'Sesión inválida',
        text: 'No hay ticket de confirmación. Verifica el código nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      return;
    }

    pendingUpdate = true;
    btnUpdatePassword.disabled = true;
    btnUpdatePassword.textContent = 'Actualizando...';

    try {
      await resetPassword(currentTicket, newPass);

      await Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Tu contraseña ha sido actualizada correctamente. Inicia sesión con tu nueva contraseña.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });

      if (newPasswordInput) newPasswordInput.value = '';
      if (confirmPasswordInput) confirmPasswordInput.value = '';
      if (modalNewPassword) modalNewPassword.style.display = 'none';

      clearCurrentFlow();

    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'No se pudo actualizar la contraseña',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
    } finally {
      pendingUpdate = false;
      btnUpdatePassword.disabled = false;
      btnUpdatePassword.textContent = 'Listo';
    }
  });

  // ---------- Helpers ----------
  function initPinInputs(inputs) {
    if (!inputs || inputs.length === 0) return;

    inputs.forEach((input, idx) => {
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('maxlength', '1');

      input.addEventListener('input', () => {
        input.value = (input.value || '').replace(/\D/g, '').slice(0, 1);
        if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!input.value && idx > 0) inputs[idx - 1].focus();
        }
        if (e.key === 'ArrowLeft' && idx > 0) inputs[idx - 1].focus();
        if (e.key === 'ArrowRight' && idx < inputs.length - 1) inputs[idx + 1].focus();
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
        if (!text) return;

        for (let i = 0; i < inputs.length; i++) inputs[i].value = text[i] || '';
        const lastFilled = Math.min(text.length, inputs.length) - 1;
        if (lastFilled >= 0) inputs[lastFilled].focus();
      });
    });
  }

  function focusFirstCodeInput(inputs) {
    if (!inputs || inputs.length === 0) return;
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
  }

  function          maskEmailSimple(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    const first = name.charAt(0);
    return `${first}...@${domain}`;
  }

  function renderMaskedEmail(email) {
    const span = modalCodeBody?.querySelector('p span b');
    if (span) span.textContent = maskEmailSimple(email);
  }

  function startCountdown(minutes) {
    clearCountdown();
    countdownRemainingSeconds = (minutes || 15) * 60;
    updateCountdownUI();

    countdownTimer = setInterval(async () => {
      countdownRemainingSeconds--;
      if (countdownRemainingSeconds <= 0) {
        clearCountdown();
        await Swal.fire({
          icon: 'warning',
          title: 'Código expirado',
          text: 'El código ha expirado. Solicita uno nuevo.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#616FEF',
          background: '#f8fbff',
          color: '#3d3d6b',
          iconColor: '#616FEF',
        });
      } else {
        updateCountdownUI();
      }
    }, 1000);
  }

  function updateCountdownUI() {
    if (!modalCodeBody) return;

    let el = modalCodeBody.querySelector('#__pin_countdown');
    if (!el) {
      el = document.createElement('div');
      el.id = '__pin_countdown';
      el.style.marginTop = '8px';
      el.style.fontSize = '14px';
      el.style.color = '#555';
      modalCodeBody.appendChild(el);
    }
    const mins = Math.floor(countdownRemainingSeconds / 60);
    const secs = countdownRemainingSeconds % 60;
    el.textContent = `Código válido por ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function clearCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    const el = modalCodeBody?.querySelector('#__pin_countdown');
    if (el) el.remove();
  }

  function clearCurrentFlow() {
    currentEmail = '';
    currentResetId = '';
    currentTicket = '';
    clearCountdown();
    codeInputs.forEach(i => i.value = '');

    if (modalPIN) modalPIN.style.display = 'none';
    if (modalAuth) modalAuth.style.display = 'none';
    if (modalRecovery) modalRecovery.style.display = 'flex';
  }

  function isValidEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Política: >= 10 chars, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
  function validatePassword(pw) {
    if (!pw || pw.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'La contraseña debe tener al menos 10 caracteres.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      return { ok: false };
    }
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    if (!re.test(pw)) {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'La contraseña debe incluir 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#616FEF',
        background: '#f8fbff',
        color: '#3d3d6b',
        iconColor: '#616FEF',
      });
      return { ok: false };
    }
    return { ok: true };
  }
});
