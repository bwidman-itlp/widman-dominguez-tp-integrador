document.addEventListener('DOMContentLoaded', () => {
  const configBtn = document.getElementById('configBtn');
  const configMenu = document.getElementById('configMenu');
  const themeOpts = document.querySelectorAll('.theme-opt');
  const systemLogo = document.getElementById('systemLogo');
  const modeCheckbox = document.getElementById('modeCheckbox');
  const modeToggleText = document.getElementById('modeToggleText');

  // --- HORA Y FECHA EN TIEMPO REAL (FORMATO 24H) ---
  function updateClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    clockEl.innerHTML = `Fecha: <strong>${day}/${month}/${year} - ${hours}:${minutes}</strong>`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- CONFIGURACIÓN DE MODO CLARO / OSCURO ---
  if (modeCheckbox) {
    modeCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.setAttribute('data-mode', 'light');
        if (modeToggleText) modeToggleText.textContent = 'Modo Claro';
      } else {
        document.body.removeAttribute('data-mode');
        if (modeToggleText) modeToggleText.textContent = 'Modo Oscuro';
      }
    });
  }

  // --- DESPLEGABLE DE CONFIGURACIÓN ---
  if (configBtn && configMenu) {
    configBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      configMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!configMenu.contains(e.target) && e.target !== configBtn) {
        configMenu.classList.remove('show');
      }
    });
  }

  // --- CAMBIO DE TEMAS EMPRESARIALES Y LOGO ---
  themeOpts.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedTheme = opt.getAttribute('data-theme');
      const logoUrl = opt.getAttribute('data-logo');

      if (selectedTheme === 'default') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', selectedTheme);
      }

      if (logoUrl && systemLogo) {
        systemLogo.src = logoUrl;
      }
      
      if (configMenu) {
        configMenu.classList.remove('show');
      }
    });
  });
});