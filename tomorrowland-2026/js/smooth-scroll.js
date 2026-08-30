/* ============================================================
   SMOOTH-SCROLL.JS
   Responsable de: el scroll suave con inercia de todo el sitio,
   con Lenis (vendorizado en assets/vendor/lenis/, igual que
   GSAP/Anime.js/Lottie — no requiere conexión a internet).

   Se sincroniza con GSAP ScrollTrigger (lenis.on('scroll', ...)
   + gsap.ticker) para que el parallax, el desenfoque de
   profundidad y las revelaciones de tarjetas — todos manejados
   por ScrollTrigger en js/animations.js y js/effects.js — sigan
   funcionando exactamente igual, ahora sobre el scroll de Lenis
   en vez del scroll nativo del navegador.

   Este cambio reemplaza al scroll-snap por sección que tenía el
   sitio antes (ver notas en css/styles.css): un scroll con
   inercia y un scroll que "engancha" al final de cada sección
   compiten por la posición final del scroll y se sienten
   tironeados si conviven, así que se optó por el scroll continuo
   con inercia (lo pedido) en vez del enganche por sección.

   Se desactiva por completo con prefers-reduced-motion, dejando
   el scroll nativo e instantáneo del navegador — igual que el
   resto de las animaciones del sitio (ver js/animations.js).
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true
  });

  // Por si algún otro script necesita desplazar la página a mano más
  // adelante (ej. un futuro botón "volver arriba") sin reinventar Lenis.
  window.TomorrowlandLenis = lenis;

  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  if (hasGSAP) {
    // Integración oficial de Lenis con GSAP ScrollTrigger: cada scroll de
    // Lenis dispara un recálculo de ScrollTrigger, y el propio "ticker" de
    // GSAP (ya corriendo para el resto de las animaciones) es quien hace
    // avanzar a Lenis cuadro a cuadro, en vez de un rAF aparte.
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    // Respaldo sin GSAP: Lenis igual necesita que alguien la haga avanzar.
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ---------- Enlaces ancla (#belgica, #radio, #inicio, etc.) ----------
     Con "scroll-behavior: smooth" apagado en CSS a propósito (se pelea
     con el scroll de Lenis, ver css/styles.css), los enlaces internos
     saltarían de golpe si no se enganchan al scrollTo() de Lenis aquí. */
  const headerHeight =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 84;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    if (!id) return; // href="#" solo (enlaces placeholder de Tienda, etc.)

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    lenis.scrollTo(target, { offset: -headerHeight });
  });
})();
