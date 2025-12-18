'use strict';

import {
  login,
  sendPin,
  verifyPin,
  putPasswordLogin
} from "../service/serviceLogin.js";

// ---------- Background image ----------
const lealBg = document.getElementById('RiskorBackground');
const bg = '../media/appMedia/bgLogin.png';

// Handler para actualizar contraseña (nuevo, con validación y llamada al endpoint PUT /password)
let pendingUpdate = false;

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

// ---------- Elements ----------
const frmLogin = document.getElementById('formLogin');
const loginButton = frmLogin.querySelector('.loginButton');

// Login existing logic (kept as-is)
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.togglePassword');
  const passwordInput = document.getElementById('passwordInput');
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

// ---------- Login submit (kept) ----------
frmLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const credentials = document.getElementById("userInput").value;
  const password = document.getElementById("passwordInput").value;

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
    const response = await login(credentials, password);
    console.log(response);

    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `Hola, ${credentials.trim()}`,
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#616FEF',
      background: '#f8fbff',
      color: '#3d3d6b',
      iconColor: '#616FEF',
    }).then(() => {
      localStorage.setItem("navItem", "dashItem")
      window.location.href = 'dashboard.html';
    });
    
  } catch (error) {
      console.error("Login failed:", error);
      
      let titulo = 'Error';
      let texto = error.message;

      if(texto.includes("401") || texto.includes("Credenciales")){
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

// ---------- Modales & UI wiring ----------
document.addEventListener('DOMContentLoaded', function () {
  //Para el boton de la casita
  const btnBackHome = document.getElementById('btnBackHome');
  if (btnBackHome) {
    btnBackHome.addEventListener('click', (e) => {
      e.preventDefault();
      // cerrar modales si hay alguno abierto (seguro)
      document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
      window.location.href = '/index.html';
    });
  }
  // modal references
  const modalRecovery = document.getElementById('modalRecovery');
  const modalAuth = document.getElementById('modalAuth');
  const modalSecurity = document.getElementById('modalSecurity');
  const modalPIN = document.getElementById('modalCode');
  const modalNewPassword = document.getElementById('modalNewPassword');

  // buttons & controls
  const closeRecoveryBtn = document.querySelector('.closeBtn');
  const closeAuthBtn = document.getElementById('closeAuth');
  const closeSecurityBtn = document.querySelector('.closeSecurityBtn');
  const closePINBtn = document.getElementById('closeCode');
  const closeNewPassword = document.getElementById('closeNewPassword');

  const btnQuestions = document.querySelector('.modalBtnSecurity');
  const btnAuthEmail = document.getElementById('openAuth');
  const btnContinueAuth = document.querySelector('#modalAuth .btnPrimary:not(.outline)');

  const formSecurity = document.querySelector('#modalSecurity form');
  const btnCodeContinue = document.getElementById('btnCodeContinue');

  const openModalRecovery = document.getElementById('openModalRecovery');

  // auth modal nodes
  const authEmailInput = document.getElementById('authEmail');
  const authSuccessDiv = document.querySelector('.authSuccess');
  const authPrimaryBtn = document.querySelector('#modalAuth .btnPrimary');

  // PIN modal nodes
  const codeInputs = Array.from(document.querySelectorAll('#modalCode .codeDigit'));
  const btnVerifyCode = document.getElementById('btnCodeContinue');
  const modalCodeBody = document.querySelector('.modalCodeBody');

  // new password nodes
  const btnUpdatePassword = document.getElementById('btnUpdatePassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  let nextStep = '';
  let currentEmail = ''; // email in flow
  let countdownTimer = null;
  let countdownRemainingSeconds = 0;
  let pendingSend = false;
  let pendingVerify = false;

  // Open recovery
  if (openModalRecovery) {
    openModalRecovery.addEventListener('click', (e) => {
      e.preventDefault();
      modalRecovery.style.display = 'flex';
    });
  }

  // Close recovery
  if (closeRecoveryBtn) {
    closeRecoveryBtn.addEventListener('click', () => {
      modalRecovery.style.display = 'none';
    });
  }

  // Email verification button
  if (btnAuthEmail) {
    btnAuthEmail.addEventListener('click', (e) => {
      e.preventDefault();
      nextStep = 'pin';
      modalRecovery.style.display = 'none';
      modalAuth.style.display = 'flex';
    });
  }

  // Close auth
  if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', () => {
      modalAuth.style.display = 'none';
      modalRecovery.style.display = 'flex';
      // reset
      authEmailInput.value = '';
      authSuccessDiv.innerHTML = '';
    });
  }
  /*
  // Continue from auth (opens next modal)
  if (btnContinueAuth) {
    btnContinueAuth.addEventListener('click', (e) => {
      e.preventDefault();
      modalAuth.style.display = 'none';

      if (nextStep === 'security') {
        modalSecurity.style.display = 'flex';
      } else if (nextStep === 'pin') {
        modalPIN.style.display = 'flex';
      }
    });
  }
  */
  /*
  // Continue from PIN (legacy button inside modal — keep flow but actual verify happens via code input)
  if (btnCodeContinue) {
    btnCodeContinue.addEventListener('click', function () {
      modalPIN.style.display = 'none';
      modalNewPassword.style.display = 'flex';
    });
  }
  */
  // Close PIN
  if (closePINBtn) {
    closePINBtn.addEventListener('click', () => {
      modalPIN.style.display = 'none';
      modalRecovery.style.display = 'flex';
      clearCurrentFlow();
    });
  }

  // Close New Password
  if (closeNewPassword) {
    closeNewPassword.addEventListener('click', () => {
      modalNewPassword.style.display = 'none';
    });
  }

  // Update password (kept)
  if (btnUpdatePassword) {
    btnUpdatePassword.addEventListener('click', async () => {
      // evitar doble envío
      if (pendingUpdate) return;

      const newPass = newPasswordInput.value.trim();
      const confirmPass = confirmPasswordInput.value.trim();

      // validar campos no vacíos
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

      // validar que coincidan
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

      // validar política de contraseña
      const v = validatePassword(newPass);
      if (!v.ok) {
        await Swal.fire({
          icon: 'warning',
          title: 'Contraseña inválida',
          text: v.message,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#616FEF',
          background: '#f8fbff',
          color: '#3d3d6b',
          iconColor: '#616FEF',
        });
        return;
      }

      // verificar que tenemos el email del flujo (proveniente del PIN)
      if (!currentEmail) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Correo no definido. Reinicia el proceso de recuperación.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#616FEF',
          background: '#f8fbff',
          color: '#3d3d6b',
          iconColor: '#616FEF',
        });
        return;
      }

      // iniciar petición
      pendingUpdate = true;
      btnUpdatePassword.disabled = true;
      btnUpdatePassword.textContent = 'Actualizando...';

      try {
        const resp = await putPasswordLogin(currentEmail, newPass);

        if (resp.ok) {
          // opcional: leer body si quieres mostrar datos
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

          // limpiar UI y flujo
          newPasswordInput.value = '';
          confirmPasswordInput.value = '';
          modalNewPassword.style.display = 'none';
          clearCurrentFlow();
        } else {
          // leer mensaje de error del backend si existe
          let message = 'No se pudo actualizar la contraseña';
          try {
            const body = await resp.json();
            message = body.message || body.detail || message;
          } catch (_) {}
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#616FEF',
            background: '#f8fbff',
            color: '#3d3d6b',
            iconColor: '#616FEF',
          });
        }
      } catch (err) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo conectar con el servidor',
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
  }

  // ---------------- PIN FLOW: Auth modal "Listo" button handler ----------------
  // ahora esperamos al Swal antes de cambiar de modal, para que el usuario vea el mensaje primero
// REEMPLAZAR BLOQUE: authPrimaryBtn.addEventListener
  if (authPrimaryBtn) {
    authPrimaryBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (pendingSend) return; // evitar doble envío

        const email = authEmailInput.value?.trim().toLowerCase();
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
            return; // <<-- CORRECCIÓN: Detiene el flujo aquí
        }

        // indicar estado búsqueda / envío
        pendingSend = true;
        authPrimaryBtn.disabled = true;
        authPrimaryBtn.textContent = 'Enviando...';

        try {
            const resp = await sendPin(email);

            if (resp.ok) {
                let minutes = 10;
                try {
                    const json = await resp.json();
                    if (json && typeof json.minutes === 'number') minutes = json.minutes;
                } catch (_) {}

                // mostramos primero el Swal y esperamos a que el usuario lo cierre
                await Swal.fire({
                    icon: 'success',
                    title: 'Código enviado',
                    text: `Se ha enviado un código al correo ${maskEmailSimple(email)}.`,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#616FEF',
                    background: '#f8fbff',
                    color: '#3d3d6b',
                    iconColor: '#616FEF',
                });

                // sólo después de cerrar el Swal hacemos la transición de modales
                currentEmail = email;
                modalAuth.style.display = 'none';
                modalPIN.style.display = 'flex';
                renderMaskedEmail(email);
                startCountdown(minutes);
                focusFirstCodeInput();

            } else {
                // manejar errores (NO cambiamos de modal)
                let message = 'Error enviando código';
                if (resp.status === 404) message = 'Email no encontrado. Verifica tu correo.';
                
                try {
                    const body = await resp.json();
                    message = body.message || body.detail || message;
                } catch (_) {}
                
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#616FEF',
                    background: '#f8fbff',
                    color: '#3d3d6b',
                    iconColor: '#616FEF',
                });
            }
        } catch (err) {
        } finally {
            pendingSend = false;
            authPrimaryBtn.disabled = false;
            authPrimaryBtn.textContent = 'Listo';
        }
    });
  }

  // ---------------- Verify PIN flow ----------------
  if (btnVerifyCode) {
    btnVerifyCode.addEventListener('click', async (e) => {
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
            return; // <<-- CORRECCIÓN: Detiene el flujo aquí
        }

        if (!currentEmail) {
            await Swal.fire({
                icon: 'error',
                title: 'Email no definido',
                text: 'Reinicia el proceso e intenta de nuevo.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#616FEF',
                background: '#f8fbff',
                color: '#3d3d6b',
                iconColor: '#616FEF',
            });
            return; // <<-- CORRECCIÓN: Detiene el flujo aquí
        }

        pendingVerify = true;
        btnVerifyCode.disabled = true;
        btnVerifyCode.textContent = 'Verificando...';

        try {
            const resp = await verifyPin(currentEmail, code);
            if (resp.ok) {
                // primero mostramos la confirmación al usuario
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

                // luego hacemos la transición a nuevo modal (después del Swal)
                modalPIN.style.display = 'none';
                modalNewPassword.style.display = 'flex';
                clearCountdown();
            } else {
                // leer body con attemptsLeft / message si viene
                let message = 'Código inválido';
                try {
                    const body = await resp.json();
                    message = body.message || body.detail || message;
                    if (body.attemptsLeft !== undefined) {
                        message += `. Intentos restantes: ${body.attemptsLeft}`;
                    }
                } catch (_) {}

                // mostrar el error y NO cambiar modal (se queda en modalPIN)
                if (resp.status === 423 || message.toLowerCase().includes('bloqueado')) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Bloqueado',
                        text: message,
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#616FEF',
                        background: '#f8fbff',
                        color: '#3d3d6b',
                        iconColor: '#616FEF',
                    });
                    clearCurrentFlow();
                } else { // 401, 400 u otro error
                    await Swal.fire({
                        icon: 'error',
                        title: 'Código inválido',
                        text: message,
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#616FEF',
                        background: '#f8fbff',
                        color: '#3d3d6b',
                        iconColor: '#616FEF',
                    });
                    focusFirstCodeInput();
                }
            }
        } catch (err) {
        } finally {
            pendingVerify = false;
            btnVerifyCode.disabled = false;
            btnVerifyCode.textContent = 'Listo';
        }
    });
  }
  // ---------------- Helpers: Mask email, countdown ----------------

  // simple mask: a...@domain.com
  function maskEmailSimple(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    const first = name.charAt(0);
    return `${first}...@${domain}`;
  }

  // render masked email inside modalCode
  function renderMaskedEmail(email) {
    const span = modalCodeBody.querySelector('p span b');
    if (span) span.textContent = maskEmailSimple(email);
  }

  // countdown UI (minutes -> seconds)
  function startCountdown(minutes) {
    clearCountdown();
    countdownRemainingSeconds = (minutes || 10) * 60;
    updateCountdownUI();
    countdownTimer = setInterval(() => {
      countdownRemainingSeconds--;
      if (countdownRemainingSeconds <= 0) {
        clearCountdown();
        // mostrar expiración
        Swal.fire({ icon: 'warning', title: 'Código expirado', text: 'El código ha expirado. Solicita uno nuevo.' });
      } else {
        updateCountdownUI();
      }
    }, 1000);
  }

  // update countdown UI (in modal; puedes añadir un <span id="countdown">)
  function updateCountdownUI() {
    // si quieres mostrar en el modal, crea o usa un nodo; aquí lo añadimos dinámicamente
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
    el.textContent = `Código válido por ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }

  function clearCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    const el = modalCodeBody.querySelector('#__pin_countdown');
    if (el) el.remove();
  }

  // reset flow variables
  function clearCurrentFlow() {
    currentEmail = '';
    clearCountdown();
    codeInputs.forEach(i => i.value = '');
    if (modalPIN) modalPIN.style.display = 'none';
    if (modalAuth) modalAuth.style.display = 'none';
    if (modalRecovery) modalRecovery.style.display = 'flex';
  }

  // ---------------- Small helper: email regex ----------------
  function isValidEmail(email) {
    if (!email) return false;
    // simple regex, readable
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  //Valida que la contraseña tenga al menos 10 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo
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
    // regex: at least one lowercase, one uppercase, one digit, one special char
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
      return {
        ok: false,
      };
    }
    return { ok: true };
  }
});