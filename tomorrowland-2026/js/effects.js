/* ============================================================
   EFFECTS.JS
   Efectos de inmersión "de alto nivel" que se suman a los de
   js/animations.js sin tocar su lógica:
   - Resplandor de neón que sigue al cursor y cambia de tono
     según la sección visible (escucha el evento "tl:sectionchange"
     que dispara js/animations.js).
   - Fondo líquido del hero: manchas de luz fundidas con un filtro
     SVG "goo" que reaccionan al cursor y respiran solas.
   - Botones magnéticos: se dejan atraer por el cursor cuando
     pasa cerca (flechas del hero y de los carruseles).
   - Zoom de cámara cinematográfico en el marco del video al
     entrar en pantalla (GSAP ScrollTrigger).
   Todo se desactiva con `prefers-reduced-motion` o en pantallas
   táctiles (sin puntero fino), igual que el resto del sitio.
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const hasAnime = !prefersReducedMotion && hasFinePointer && typeof window.anime !== 'undefined';
  const hasGSAP = !prefersReducedMotion && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const enableCursorFX = !prefersReducedMotion && hasFinePointer;

  /* ---------- 1. Resplandor de neón que sigue al cursor ---------- */
  function initCursorGlow() {
    if (!enableCursorFX) return;
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let ticking = false;
    let visible = false;

    function render() {
      glow.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;
      ticking = false;
    }

    window.addEventListener('pointermove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!visible) { glow.classList.add('is-active'); visible = true; }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      glow.classList.remove('is-active');
      visible = false;
    });

    // Un tono distinto por sección (rotación de matiz sobre el mismo
    // degradado de marca) — el filtro SÍ es una propiedad animable por
    // CSS, así que la transición queda suave sin más trabajo.
    const hueBySection = { inicio: 0, belgica: 0, video: -25, brasil: 130, radio: 55 };
    window.addEventListener('tl:sectionchange', (e) => {
      const hue = hueBySection[e.detail && e.detail.id] || 0;
      glow.style.filter = `blur(60px) hue-rotate(${hue}deg)`;
    });
  }

  /* ---------- 2. Fondo líquido del hero (manchas fundidas con filtro goo) ---------- */
  function initHeroLiquidBlobs() {
    if (!enableCursorFX) return;
    const hero = document.getElementById('hero');
    const blobs = hero ? Array.from(hero.querySelectorAll('.hero-blob')) : [];
    if (!hero || !blobs.length) return;

    // Cada mancha respira sola con su propia frecuencia/fase (para que no
    // se muevan todas en espejo) y además se deja atraer suavemente por
    // el cursor mientras está sobre el hero.
    const cfg = [
      { speed: 0.05, ampX: 90,  ampY: 55,  freq: 0.00022, phase: 0 },
      { speed: 0.09, ampX: 65,  ampY: 85,  freq: 0.00031, phase: 2.1 },
      { speed: 0.035, ampX: 105, ampY: 50, freq: 0.00019, phase: 4.3 }
    ];
    const pos = cfg.map(() => ({ x: 0, y: 0 }));
    const mouse = { x: 0, y: 0, active: false };
    let rafId = null;

    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - rect.width / 2;
      mouse.y = e.clientY - rect.top - rect.height / 2;
      mouse.active = true;
    });
    hero.addEventListener('pointerleave', () => { mouse.active = false; });

    function tick(t) {
      blobs.forEach((blob, i) => {
        const c = cfg[i];
        const driftX = Math.sin(t * c.freq + c.phase) * c.ampX;
        const driftY = Math.cos(t * c.freq * 1.3 + c.phase) * c.ampY;
        const targetX = driftX + (mouse.active ? mouse.x * c.speed : 0);
        const targetY = driftY + (mouse.active ? mouse.y * c.speed : 0);
        pos[i].x += (targetX - pos[i].x) * 0.05;
        pos[i].y += (targetY - pos[i].y) * 0.05;
        blob.style.transform = `translate3d(${pos[i].x.toFixed(1)}px, ${pos[i].y.toFixed(1)}px, 0)`;
      });
      rafId = requestAnimationFrame(tick);
    }

    // Solo corre el rAF mientras el hero está en pantalla — en cuanto se
    // deja de ver (el resto de la página es larga) se cancela del todo
    // en vez de seguir "latiendo" en vacío para siempre.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (rafId === null) rafId = requestAnimationFrame(tick);
        } else if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }, { threshold: 0 });
      io.observe(hero);
    } else {
      rafId = requestAnimationFrame(tick);
    }
  }

  /* ---------- 3. Botones magnéticos ----------
     Se dejan "atraer" por el cursor cuando pasa cerca (no hace falta
     tocarlos), y vuelven a su sitio con un rebote elástico al alejarse. */
  function initMagneticButtons() {
    if (!enableCursorFX) return;
    const targets = Array.from(document.querySelectorAll('.magnetic'));
    if (!targets.length) return;

    const REACH = 70;   // px extra de "radio de atracción" más allá del propio botón
    const STRENGTH = 0.4;

    window.addEventListener('pointermove', (e) => {
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const radius = REACH + rect.width / 2;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const pull = 1 - dist / radius;
          const tx = dx * STRENGTH * pull;
          const ty = dy * STRENGTH * pull;
          el.classList.add('magnet-engaged');
          if (hasAnime) {
            anime.animate(el, { translateX: tx, translateY: ty, duration: 300, ease: 'outQuad' });
          } else {
            el.style.transform = `translate(${tx}px, ${ty}px)`;
          }
        } else if (el.classList.contains('magnet-engaged')) {
          el.classList.remove('magnet-engaged');
          if (hasAnime) {
            // Al terminar de volver a su sitio, se limpia el "transform" inline:
            // si no, ese estilo (aunque sea 0,0) sigue ganándole para siempre a
            // cualquier "transform" que la propia hoja de estilos quiera aplicar
            // en :hover (ej. el scale() de .hero-arrow:hover), porque un estilo
            // inline tiene más prioridad que una regla de clase aunque valgan lo
            // mismo — el botón se quedaría con el hover roto tras el primer
            // acercamiento del cursor.
            anime.animate(el, {
              translateX: 0, translateY: 0, duration: 550, ease: 'outElastic(1, .55)',
              onComplete: () => { el.style.transform = ''; }
            });
          } else {
            el.style.transform = '';
          }
        }
      });
    }, { passive: true });
  }

  /* ---------- 4. Carrusel 3D "coverflow" (Bélgica / Brasil / Radio) ----------
     La tarjeta que queda al centro del track se ve grande y de frente; las
     de los costados se achican y giran en perspectiva 3D a medida que el
     centro se aleja de ellas — al arrastrar, con las flechas o con el
     scroll táctil. Solo toca la propiedad "transform" (rotateY + scale):
     el fundido de entrada de cada tarjeta lo sigue controlando GSAP sobre
     las propiedades independientes translate/scale/filter/opacity (ver
     js/animations.js), así que ambos sistemas conviven sin pisarse. */
  const coverflowUpdaters = [];

  function initCoverflowCarousels() {
    if (prefersReducedMotion) return;
    const tracks = document.querySelectorAll('.card-track');
    if (!tracks.length) return;

    // Ahora que el carrusel siempre encuadra tarjetas completas (2 en
    // escritorio, 1 en móvil — ver css/styles.css y css/responsive.css),
    // el giro se deja mucho más sutil: con las 32°/16° de antes, la
    // perspectiva "escorzaba" el borde de una tarjeta que sí estaba
    // completa, dando la sensación de que igual quedaba cortada.
    const MAX_ROTATE = 8;
    const MAX_ROTATE_NARROW = 8;
    const MIN_SCALE = 0.94;
    const narrowQuery = window.matchMedia('(max-width: 768px)');

    tracks.forEach((track) => {
      let ticking = false;

      function update() {
        const maxRotate = narrowQuery.matches ? MAX_ROTATE_NARROW : MAX_ROTATE;
        const trackRect = track.getBoundingClientRect();
        const centerX = trackRect.left + trackRect.width / 2;
        const half = trackRect.width / 2 || 1;

        track.querySelectorAll('.news-card, .grid-card').forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const d = Math.max(-1.3, Math.min(1.3, (cardCenter - centerX) / half));

          const rotateY = -d * maxRotate;
          const scale = 1 - Math.min(Math.abs(d), 1) * (1 - MIN_SCALE);

          card.style.transform = `rotateY(${rotateY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          card.style.zIndex = String(100 - Math.round(Math.abs(d) * 50));
        });
        ticking = false;
      }

      track.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });

      coverflowUpdaters.push(update);
      requestAnimationFrame(update);
    });

    window.addEventListener('resize', () => coverflowUpdaters.forEach((fn) => fn()));
  }

  /* ---------- 5. Zoom de cámara cinematográfico en el marco del video ----------
     Un scrub sencillo (sin onUpdate anidado — ver la limpieza que se hizo
     en js/animations.js) que hace que el marco se sienta como si una
     cámara se acercara al llegar a la sección. Solo toca "scale": el
     propio ".video-frame" ya es un ".reveal" y su fundido/opacidad los
     controla initHeadingReveal — animar la misma propiedad desde dos
     tweens distintos es justo el tipo de choque que se acaba de limpiar. */
  function initCinematicZoom() {
    if (!hasGSAP) return;
    const frame = document.querySelector('.video-frame');
    if (!frame) return;

    gsap.fromTo(frame,
      { scale: 0.88 },
      {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top 95%', end: 'top 55%', scrub: 0.5 }
      }
    );
  }

  // API pública: main.js llama a refreshCoverflow() después de insertar las
  // tarjetas dinámicas de Bélgica/Brasil/Radio (a esta altura el DOM aún
  // no las tiene, así que el primer cálculo del coverflow no encuentra
  // ninguna tarjeta hasta que se lo pide explícitamente).
  window.TomorrowlandEffects = {
    refreshCoverflow() {
      coverflowUpdaters.forEach((fn) => fn());
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initHeroLiquidBlobs();
    initMagneticButtons();
    initCoverflowCarousels();
    initCinematicZoom();
  });
})();
