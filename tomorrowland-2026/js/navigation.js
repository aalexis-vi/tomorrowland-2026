/* ============================================================
   NAVIGATION.JS
   Responsable de: header fijo con estado "scrolled", menús
   desplegables del nav de escritorio, menú hamburguesa (con
   Anime.js si está disponible) y acordeón del menú móvil.
   ============================================================ */

(function () {
  'use strict';

  const hasAnime = typeof window.anime !== 'undefined';

  /* ---------- Header: cambia de estilo al hacer scroll ---------- */
  const header = document.getElementById('siteHeader');

  function updateHeaderOnScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  updateHeaderOnScroll();
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

  /* ---------- Dropdowns del menú de escritorio ---------- */
  const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

  function closeAllDropdowns(except) {
    dropdownItems.forEach((item) => {
      if (item !== except) {
        item.classList.remove('open');
        const toggle = item.querySelector('.nav-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  dropdownItems.forEach((item) => {
    const toggle = item.querySelector('.nav-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains('open');
      closeAllDropdowns(item);
      item.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', () => closeAllDropdowns(null));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns(null);
  });

  /* ---------- Menú hamburguesa (morfo animado con Anime.js) ---------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function animateHamburger(open) {
    if (!hamburgerBtn) return;
    const bars = hamburgerBtn.querySelectorAll('.bar');
    if (!hasAnime || bars.length < 3) return; // la clase "open" ya cubre el caso sin Anime.js

    if (open) {
      anime.animate(bars[0], { translateY: 7, rotate: 45, duration: 350, ease: 'outBack' });
      anime.animate(bars[1], { opacity: 0, scale: 0, duration: 200, ease: 'outQuad' });
      anime.animate(bars[2], { translateY: -7, rotate: -45, duration: 350, ease: 'outBack' });
    } else {
      anime.animate(bars[0], { translateY: 0, rotate: 0, duration: 350, ease: 'outBack' });
      anime.animate(bars[1], { opacity: 1, scale: 1, duration: 250, ease: 'outQuad' });
      anime.animate(bars[2], { translateY: 0, rotate: 0, duration: 350, ease: 'outBack' });
    }
  }

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      hamburgerBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      animateHamburger(isOpen);
    });

    // Cierra el menú móvil al elegir un enlace directo
    mobileMenu.querySelectorAll('.mobile-link, .mobile-sublink').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        animateHamburger(false);
      });
    });
  }

  /* ---------- Acordeón del menú móvil ----------
     La altura del panel se anima midiendo su scrollHeight real
     (con Anime.js si está disponible), en vez de usar un
     max-height fijo que podía cortar contenido más largo. */
  function setPanelHeight(panel, open) {
    if (!panel) return;

    if (!hasAnime) {
      panel.style.height = open ? `${panel.scrollHeight}px` : '0px';
      return;
    }

    if (open) {
      const target = panel.scrollHeight;
      anime.animate(panel, {
        height: [0, target],
        duration: 380,
        ease: 'outCubic',
        onComplete: () => { panel.style.height = 'auto'; }
      });
    } else {
      const current = panel.scrollHeight;
      anime.animate(panel, {
        height: [current, 0],
        duration: 300,
        ease: 'inCubic'
      });
    }
  }

  document.querySelectorAll('.mobile-accordion-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.mobile-accordion');
      const panel = parent.querySelector('.mobile-accordion-panel');
      const wasOpen = parent.classList.contains('open');

      document.querySelectorAll('.mobile-accordion.open').forEach((el) => {
        if (el !== parent) {
          el.classList.remove('open');
          setPanelHeight(el.querySelector('.mobile-accordion-panel'), false);
        }
      });

      parent.classList.toggle('open', !wasOpen);
      setPanelHeight(panel, !wasOpen);
    });
  });
})();
