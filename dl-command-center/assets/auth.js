/**
 * auth.js — DL Command Center Authentication
 * Layer 1: SHA-256 hashed credentials (Web Crypto API)
 * Layer 2: sessionStorage session token (expires on tab close)
 * Layer 3: Rate limiting — lockout after 5 fails (15 min)
 * Layer 4: Honeypot field detection
 * Layer 5: Artificial timing delay (anti-brute-force)
 * Layer 6: DevTools detection
 *
 * ── HOW TO REGENERATE HASHES IN BROWSER CONSOLE ──────────────
 * async function h(s) {
 *   const b = await crypto.subtle.digest('SHA-256',
 *     new TextEncoder().encode(s));
 *   return [...new Uint8Array(b)]
 *     .map(x => x.toString(16).padStart(2,'0')).join('');
 * }
 * console.log(await h('DLett_Admin_2025'));
 * console.log(await h('Xbox@Microsoft#DL2025!'));
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ── CREDENTIAL HASHES (SHA-256, never store plaintext) ────────
  const CREDENTIAL_HASHES = {
    username: '3550752ed218535563e05131e4e296302e8422c54ea4c9ab092f1cdbac93e99e',
    password: 'e4616d1e1b76ebf015f3c04051e697e3d3bac86ae526c2530abe388d0fe49979'
  };

  // ── CONSTANTS ─────────────────────────────────────────────────
  const SESSION_KEY     = 'dl_cc_session';
  const RATE_LIMIT_KEY  = 'dl_cc_ratelimit';
  const MAX_ATTEMPTS    = 5;
  const LOCKOUT_MS      = 15 * 60 * 1000; // 15 minutes
  const SESSION_TTL_MS  = 4 * 60 * 60 * 1000; // 4 hours

  // ── SHA-256 via Web Crypto API ────────────────────────────────
  async function sha256(input) {
    const encoded = new TextEncoder().encode(input);
    const buffer  = await crypto.subtle.digest('SHA-256', encoded);
    return [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ── RATE LIMITING ─────────────────────────────────────────────
  function getRateLimitState() {
    try {
      const raw = localStorage.getItem(RATE_LIMIT_KEY);
      if (!raw) return { attempts: 0, lockedUntil: 0 };
      return JSON.parse(raw);
    } catch {
      return { attempts: 0, lockedUntil: 0 };
    }
  }

  function saveRateLimitState(state) {
    try {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
    } catch { /* storage unavailable */ }
  }

  function isLockedOut() {
    const state = getRateLimitState();
    const now   = Date.now();
    if (state.lockedUntil && now < state.lockedUntil) {
      return { locked: true, remaining: Math.ceil((state.lockedUntil - now) / 1000) };
    }
    return { locked: false, remaining: 0 };
  }

  function recordFailedAttempt() {
    const state = getRateLimitState();
    state.attempts = (state.attempts || 0) + 1;
    if (state.attempts >= MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + LOCKOUT_MS;
    }
    saveRateLimitState(state);
    return MAX_ATTEMPTS - state.attempts;
  }

  function resetRateLimit() {
    try { localStorage.removeItem(RATE_LIMIT_KEY); } catch { /* */ }
  }

  // ── SESSION MANAGEMENT ────────────────────────────────────────
  async function generateSessionToken() {
    const raw = `${Date.now()}-${Math.random()}-${navigator.userAgent}`;
    return await sha256(raw);
  }

  function createSession() {
    const token  = btoa(`${Date.now()}_${Math.random()}_dl_cc`);
    const expiry = Date.now() + SESSION_TTL_MS;
    const session = { token, expiry, created: Date.now() };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch { /* */ }
    return session;
  }

  function validateSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      if (!session.token || !session.expiry) return false;
      if (Date.now() > session.expiry) {
        destroySession();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  function destroySession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* */ }
  }

  function getSessionRemaining() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return 0;
      const session = JSON.parse(raw);
      const ms = Math.max(0, session.expiry - Date.now());
      const h  = Math.floor(ms / 3600000);
      const m  = Math.floor((ms % 3600000) / 60000);
      return { ms, h, m, label: `${h}h ${m}m remaining` };
    } catch {
      return { ms: 0, h: 0, m: 0, label: '—' };
    }
  }

  // ── HONEYPOT ──────────────────────────────────────────────────
  function honeypotTriggered() {
    const trap = document.getElementById('dl_trap');
    return trap && trap.value.length > 0;
  }

  // ── DEVTOOLS DETECTION ────────────────────────────────────────
  function detectDevTools() {
    const threshold = 160;
    return (window.outerWidth - window.innerWidth > threshold) ||
           (window.outerHeight - window.innerHeight > threshold);
  }

  // ── LOCKOUT COUNTDOWN ─────────────────────────────────────────
  let _countdownInterval = null;

  function startLockoutCountdown() {
    const banner   = document.getElementById('lockout-banner');
    const timerEl  = document.getElementById('lockout-timer');
    const submitBtn = document.getElementById('submit-btn');

    if (!banner || !timerEl) return;

    if (_countdownInterval) clearInterval(_countdownInterval);

    function tick() {
      const { locked, remaining } = isLockedOut();
      if (!locked) {
        clearInterval(_countdownInterval);
        banner.style.display = 'none';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Access Command Center';
        }
        const warn = document.getElementById('rate-limit-warning');
        if (warn) warn.style.display = 'none';
        return;
      }
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      banner.style.display = 'flex';
      if (submitBtn) submitBtn.disabled = true;
    }

    tick();
    _countdownInterval = setInterval(tick, 1000);
  }

  // ── CARD SHAKE ────────────────────────────────────────────────
  function shakeCard() {
    const card = document.querySelector('.login-card');
    if (!card) return;
    card.classList.remove('shake');
    void card.offsetWidth; // reflow
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 600);
  }

  // ── MAIN LOGIN HANDLER ────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const errorEl   = document.getElementById('login-error');

    // Layer 4: Honeypot check
    if (honeypotTriggered()) {
      console.warn('[DL Auth] Bot detected via honeypot.');
      return;
    }

    // Layer 6: DevTools check
    if (detectDevTools()) {
      showError('Please close DevTools before logging in.');
      return;
    }

    // Layer 3: Rate limit check
    const lockStatus = isLockedOut();
    if (lockStatus.locked) {
      startLockoutCountdown();
      return;
    }

    // Disable button during processing
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying…';
    }
    if (errorEl) errorEl.style.display = 'none';

    // Layer 5: Artificial timing delay (600ms + random 0-400ms)
    const delay = 600 + Math.floor(Math.random() * 400);
    await new Promise(r => setTimeout(r, delay));

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (!usernameInput || !passwordInput) return;

    const rawUser = usernameInput.value.trim();
    const rawPass = passwordInput.value;

    // Layer 1: Hash and compare
    const [userHash, passHash] = await Promise.all([
      sha256(rawUser),
      sha256(rawPass)
    ]);

    const userMatch = userHash === CREDENTIAL_HASHES.username;
    const passMatch = passHash === CREDENTIAL_HASHES.password;

    if (userMatch && passMatch) {
      // Success
      resetRateLimit();
      createSession();
      if (submitBtn) submitBtn.textContent = 'Access Granted ✓';

      setTimeout(() => {
        window.location.replace('dashboard.html');
      }, 300);
    } else {
      // Failure
      const attemptsLeft = recordFailedAttempt();
      shakeCard();

      const { locked } = isLockedOut();
      if (locked) {
        startLockoutCountdown();
        showError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        const warnEl = document.getElementById('rate-limit-warning');
        if (warnEl) {
          warnEl.textContent = `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`;
          warnEl.style.display = 'block';
        }
        showError('Invalid username or password.');
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Access Command Center';
      }
    }
  }

  function showError(msg) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  // ── PASSWORD VISIBILITY TOGGLE ────────────────────────────────
  function initPasswordToggle() {
    const toggle = document.getElementById('password-toggle');
    const input  = document.getElementById('password');
    if (!toggle || !input) return;
    toggle.addEventListener('click', () => {
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      toggle.innerHTML = isText
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
      toggle.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    });
  }

  // ── PARTICLE CANVAS ───────────────────────────────────────────
  function initParticles() {
    const canvas = document.getElementById('login-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 2 + 1,
        a:  Math.random() * 0.5 + 0.1
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: 30 }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${p.a})`;
        ctx.fill();
      });

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  }

  // ── INIT ──────────────────────────────────────────────────────
  function init() {
    // Only run login-page logic when we are actually on index.html.
    // auth.js is also loaded by dashboard.html (for DLAuth API) so
    // we must NOT redirect or attach form handlers from that context.
    const onDashboard = window.location.pathname.endsWith('dashboard.html');
    if (onDashboard) return; // dashboard.js handles its own session gate

    // If already authenticated, skip straight to dashboard
    if (validateSession()) {
      window.location.replace('dashboard.html');
      return;
    }

    const form = document.getElementById('login-form');
    if (form) form.addEventListener('submit', handleLogin);

    initPasswordToggle();
    initParticles();

    // Show message when redirected back due to session expiry
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'expired') {
      showError('Your session has expired. Please log in again.');
    }

    // Restore lockout countdown if already locked out
    const { locked } = isLockedOut();
    if (locked) startLockoutCountdown();
  }

  document.addEventListener('DOMContentLoaded', init);

  // ── PUBLIC API ────────────────────────────────────────────────
  window.DLAuth = {
    validateSession,
    destroySession,
    getSessionRemaining
  };

})();
