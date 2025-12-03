document.addEventListener('DOMContentLoaded', () => {
  // Helper: toggle type for given inputs
  function toggleInputsType(inputs, show) {
    inputs.forEach(i => {
      if (i) i.type = show ? 'text' : 'password';
    });
  }

  // Bind show-password checkboxes
  const loginShow = document.querySelector('.show-pw-login-checkbox');
  const registerShow = document.querySelector('.show-pw-register-checkbox');

  if (loginShow) {
    const loginPw = document.querySelector('input[name="password"]');
    loginShow.addEventListener('change', (e) => toggleInputsType([loginPw], e.target.checked));
  }

  if (registerShow) {
    const rPw = document.querySelector('input[name="password1"]');
    const rPw2 = document.querySelector('input[name="password2"]');
    registerShow.addEventListener('change', (e) => toggleInputsType([rPw, rPw2], e.target.checked));
  }

  // Password strength & rule indicator for registration
  const regIndicator = document.getElementById('reg-pw-indicator');
  const regPw = document.querySelector('input[name="password1"]');
  const regForm = regPw ? regPw.closest('form') : null;

  function renderIndicator(container, value) {
    if (!container) return;
    const raw = value || '';
    const v = raw.trim(); // ignore leading/trailing whitespace for strength
    const hasUpper = /[A-Z]/.test(v);
    const hasLower = /[a-z]/.test(v);
    const hasDigit = /[0-9]/.test(v);
    const longEnough = v.length >= 8;
    const score = [hasUpper, hasLower, hasDigit, longEnough].filter(Boolean).length;
    // Determine visual width and color per score.
    const labels = ['Very weak', 'Weak', 'Medium', 'Strong', 'Very strong'];
    let pct = 0;
    let color = '#ef4444'; // default red
    let label = labels[0];

    if (!value) {
      // empty -> very weak, no bar
      pct = 0;
      color = '#ef4444';
      label = labels[0];
    } else {
      label = labels[Math.min(score, labels.length - 1)];
      // map score to width and color
      // Use discrete positions that align to labels for clearer movement
      const mapping = {
        0: { pct: 0, color: '#ef4444' },   // very weak (red)
        1: { pct: 25, color: '#fb923c' },  // weak (orange)
        2: { pct: 50, color: '#f59e0b' },  // medium (amber)
        3: { pct: 75, color: '#10b981' },  // strong (green)
        4: { pct: 100, color: '#059669' }  // very strong (dark green)
      };
      const entry = mapping[Math.min(score, 4)];
      pct = entry.pct;
      color = entry.color;
    }

      // Render a track with a small indicator that slides left->right
      container.innerHTML = `
        <div class="pw-strength-wrap">
          <div class="pw-track">
            <div class="pw-indicator-line" style="left:${pct}%; background:${color}"></div>
          </div>
          <div class="pw-strength-text">${label}</div>
        </div>
      <ul class="pw-rules">
        <li class="${longEnough ? 'ok' : ''}">At least 8 characters</li>
        <li class="${hasUpper ? 'ok' : ''}">Uppercase letter</li>
        <li class="${hasLower ? 'ok' : ''}">Lowercase letter</li>
        <li class="${hasDigit ? 'ok' : ''}">A number</li>
      </ul>
    `;
  }

  if (regIndicator && regPw) {
    // Initialize
    renderIndicator(regIndicator, '');

    regPw.addEventListener('input', (e) => {
      renderIndicator(regIndicator, e.target.value);
    });

    // Prevent submit when password doesn't meet criteria
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        const rawV = regPw.value || '';
        const v = rawV.trim();
        const pw2El = regForm.querySelector('input[name="password2"]');
        const rawV2 = pw2El ? (pw2El.value || '') : '';
        const v2 = rawV2.trim();

        const meetsPolicy = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v);
        const matches = v === v2;

        if (!meetsPolicy || !matches) {
          e.preventDefault();
          // simple inline message
          let msg = regForm.querySelector('.form-message');
          if (!msg) {
            msg = document.createElement('div');
            msg.className = 'form-message messages';
            regForm.insertBefore(msg, regForm.firstChild);
          }

          if (!meetsPolicy) {
            msg.innerHTML = '<div class="message error">Password must be at least 8 characters and include uppercase, lowercase, and a number.</div>';
            regPw.focus();
          } else if (!matches) {
            msg.innerHTML = '<div class="message error">Passwords do not match.</div>';
            if (pw2El) pw2El.focus();
          }

          setTimeout(() => { if (msg) msg.remove(); }, 5000);
        }
      });
    }
  }
});
