/* ============================================================
   ANIMATIONS.JS
   Motor de animación del sitio. Usa:
   - GSAP + ScrollTrigger → línea de tiempo de entrada del hero,
     profundidad/blur del hero al hacer scroll, aparición de
     secciones y tarjetas, y parallax de imágenes.
   - Anime.js               → inclinación 3D ("tilt") de las
     tarjetas al pasar el mouse.
   - Lottie                 → indicador animado de "scroll" en
     el hero.
   Si alguna librería no llega a cargar (por ejemplo, sin
   conexión y sirviendo el sitio desde una ruta rota), el código
   cae a un respaldo simple que deja todo visible y funcional.
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const hasGSAP = !prefersReducedMotion && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const hasAnime = !prefersReducedMotion && hasFinePointer && typeof window.anime !== 'undefined';

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Respaldo: si GSAP no está disponible, todo queda visible ---------- */
  function revealEverythingInstantly() {
    document.querySelectorAll('.reveal, .news-card, .grid-card, .hero-logo, .hero-eyebrow, .hero-title, .hero-subtitle, .section-title')
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.filter = 'none';
        el.style.translate = '0 0';
        el.style.scale = '1';
        el.style.clipPath = 'inset(0 0% 0 0)';
      });
  }

  /* ---------- 0. Separar el título del hero en palabras animables ----------
     No hay plugin de pago (SplitText) en este proyecto, así que se arma a
     mano: cada nodo de texto se corta en palabras envueltas en un <span
     class="title-word">, y cualquier elemento que ya exista adentro (el
     <span class="title-accent">2026</span> con el degradado) se conserva
     tal cual y se trata como "una palabra más" — así no se pierde su
     estilo propio al reordenar los nodos. */
  function splitTitleWords(el) {
    if (!el || el.dataset.splitDone) return el ? Array.from(el.querySelectorAll('.title-word')) : [];

    const nodes = Array.from(el.childNodes);
    const words = [];
    el.textContent = '';

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((token) => {
          if (!token.trim()) {
            el.appendChild(document.createTextNode(token));
          } else {
            const span = document.createElement('span');
            span.className = 'title-word';
            span.textContent = token;
            el.appendChild(span);
            words.push(span);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add('title-word');
        el.appendChild(node);
        words.push(node);
      }
    });

    el.dataset.splitDone = 'true';
    return words;
  }

  /* ---------- 1. Línea de tiempo de entrada del hero (GSAP) ---------- */
  function initHeroIntro() {
    if (!hasGSAP) return;

    const heroTitleEl = document.querySelector('.hero-title');
    const titleWords = splitTitleWords(heroTitleEl);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to('.hero-logo',    { opacity: 1, duration: .7 })
      .to('.hero-eyebrow', { opacity: 1, duration: .6 }, '-=.4');

    if (heroTitleEl) tl.set(heroTitleEl, { opacity: 1 }, '-=.35');

    // Cada palabra entra desenfocada y se va enfocando con un pequeño
    // desfase entre una y la siguiente (stagger) — el efecto de "texto
    // que se va enfocando" pedido, en vez de un simple fundido.
    if (titleWords.length) {
      tl.fromTo(titleWords,
        { opacity: 0, filter: 'blur(22px)', y: 26 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: 'power3.out', stagger: .08 },
        '<'
      );
    }

    tl.to('.hero-subtitle', { opacity: 1, duration: .6 }, '-=.75')
      .call(() => {
        if (heroTitleEl) heroTitleEl.classList.add('active');
      });
  }

  /* ---------- 2. Profundidad del hero al hacer scroll (GSAP ScrollTrigger, scrub) ---------- */
  function initHeroScrollEffect() {
    if (!hasGSAP) return;
    const hero = document.getElementById('hero');
    const heroTrack = document.getElementById('heroTrack');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroTrack || !heroContent) return;

    const trigger = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 };

    gsap.to(heroContent, { y: 70, opacity: 0, ease: 'none', scrollTrigger: trigger });
    gsap.to(heroTrack, {
      y: 110,
      filter: 'blur(7px) brightness(0.85)',
      ease: 'none',
      scrollTrigger: trigger
    });
  }

  /* ---------- 2.1 Respiro continuo y fluido de la imagen activa del hero ----------
     Un zoom muy sutil de ida y vuelta (independiente del paneo CSS, que vive en el
     contenedor .hero-slide) para que el hero nunca se sienta "congelado", incluso
     después de que termina el paneo de 12s. */
  function initHeroBreathing() {
    if (!hasGSAP) return;
    const heroTrack = document.getElementById('heroTrack');
    if (!heroTrack) return;

    gsap.to(heroTrack.querySelectorAll('.hero-slide img'), {
      scale: 1.025,
      duration: 6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  }

  /* ---------- 3. Aparición de secciones y tarjetas al hacer scroll (GSAP ScrollTrigger) ---------- */
  function initHeadingReveal() {
    if (!hasGSAP) return;
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.to(el, {
        // "scale: 1" no mueve nada en un ".reveal" normal (ya nace en 1),
        // pero si además es una ".news-card"/".grid-card" suelta —fuera de
        // un ".card-track", como la galería de musica/sets-videos.html—
        // deshace el ".96" inicial de esas clases que si no quedaría fijo,
        // porque esas tarjetas no pasan por el ScrollTrigger.batch de
        // initCardReveal (pensado solo para las que sí viven en un track).
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        onStart: () => el.classList.add('gsap-revealed')
      });
    });
  }

  /* ---------- 3.0 "Efecto cine" en los títulos de sección (IntersectionObserver) ----------
     No usa GSAP a propósito (funciona igual si esa librería no llegara a
     cargar): al entrar en pantalla, el título pasa de desenfocado +
     corrido hacia abajo + transparente a nítido/en su lugar/visible
     (ver el estado inicial y ".is-in-view" en css/styles.css). Al salir
     de pantalla se le quita la clase y vuelve a desenfocarse, así que la
     animación se repite cada vez que se cruza la sección, no solo una
     vez al cargar la página. */
  function initSectionTitleCineEffect() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const titles = document.querySelectorAll('.section-title');
    if (!titles.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting);
      });
    }, { threshold: 0.1 });

    titles.forEach((title) => observer.observe(title));
  }

  /* ---------- 3.1 Efecto adicional de brillo en encabezados (ScrollTrigger) ---------- */
  function initEnhancedHeaderEffects() {
    if (!hasGSAP) return;
    gsap.utils.toArray('.section-heading').forEach((heading) => {
      gsap.to(heading, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 80%',
          onEnter: () => heading.classList.add('glowing-header'),
          once: true
        }
      });
    });
  }

  /* ---------- 3.2 Profundidad cinematográfica al salir del viewport (ScrollTrigger scrub) ----------
     Un único tween limpio por sección (nada de onUpdate re-disparando otro
     tween encima: eso es lo que causaba los tirones del efecto anterior).
     La sección se desenfoca y se atenúa suavemente solo mientras se retira
     por arriba, y vuelve a estar perfectamente nítida en cuanto está en
     pantalla — así el blur se siente como profundidad, no como ruido. */
  function initSectionDepthEffect() {
    if (!hasGSAP) return;
    gsap.utils.toArray('.js-blur-on-scroll').forEach((section) => {
      gsap.fromTo(section,
        { filter: 'blur(0px)', opacity: 1 },
        {
          filter: 'blur(6px)',
          opacity: 0.85,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 8%',
            end: 'top -35%',
            scrub: 0.6
          }
        }
      );
    });
  }
  // para poder volver a llamarse desde refresh() sin duplicar animaciones.
  const cardContainersDone = new WeakSet();

  function initCardReveal() {
    if (!hasGSAP) return;
    // Genérico: cualquier ".card-track" de cualquier página (no solo los
    // tres de index.html) — así las páginas independientes de Festival,
    // Eventos y Música reutilizan la misma revelación de tarjetas.
    document.querySelectorAll('.card-track').forEach((container) => {
      if (cardContainersDone.has(container)) return;

      const cards = container.querySelectorAll('.news-card, .grid-card');
      if (!cards.length) return;

      cardContainersDone.add(container);

      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
            duration: .8, ease: 'power3.out', stagger: .12, overwrite: true
          });
        }
      });
    });
  }

  /* ---------- 4. Parallax suave en imágenes y elementos decorativos (GSAP scrub) ---------- */
  const parallaxDone = new WeakSet();

  function initParallax() {
    if (!hasGSAP) return;
    document.querySelectorAll('.js-parallax').forEach((el) => {
      if (parallaxDone.has(el)) return;
      parallaxDone.add(el);

      const speed = parseFloat(el.dataset.speed || '0.08');
      const range = Math.min(80, 500 * speed);

      gsap.fromTo(el,
        { y: -range },
        {
          y: range, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.5 }
        }
      );
    });
  }

  /* ---------- 5. Inclinación 3D ("tilt") de las tarjetas al pasar el mouse (Anime.js) ----------
     Se salta las tarjetas que viven dentro de un carrusel .card-track: esas
     ya tienen su propia rotación 3D continua (el "coverflow" de
     js/effects.js) y dejarlas competir por la misma propiedad "transform"
     es justo el tipo de tirón que se limpió en el resto del sitio. Queda
     lista por si en el futuro hay tarjetas sueltas fuera de un carrusel. */
  function initCardTilt() {
    if (prefersReducedMotion || !hasFinePointer) return;

    const STRENGTH = 9; // grados máximos de inclinación

    function attach(card) {
      if (card.dataset.tiltBound || card.closest('.card-track')) return;
      card.dataset.tiltBound = 'true';

      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-py * STRENGTH).toFixed(2);
        const rotateY = (px * STRENGTH).toFixed(2);

        if (hasAnime) {
          anime.animate(card, {
            rotateX: `${rotateX}deg`,
            rotateY: `${rotateY}deg`,
            translateY: -10,
            scale: 1.02,
            duration: 400,
            ease: 'outQuad'
          });
        } else {
          card.style.transform =
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
        }
      });

      card.addEventListener('pointerleave', () => {
        if (hasAnime) {
          anime.animate(card, {
            rotateX: '0deg', rotateY: '0deg', translateY: 0, scale: 1,
            duration: 600, ease: 'outElastic(1, .6)'
          });
        } else {
          card.style.transform = '';
        }
      });
    }

    document.querySelectorAll('.news-card, .grid-card').forEach(attach);
  }

  /* ---------- 5.1 Barra de progreso de lectura (fina, bajo el header) ---------- */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${ratio})`;
    }

    if (hasGSAP) {
      gsap.to(bar, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: () => document.documentElement.scrollHeight - window.innerHeight, scrub: 0.3 }
      });
    } else {
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    }
  }

  /* ---------- 5.2 Resalta en el menú la sección visible (scroll-spy) ----------
     Recorre en un único IntersectionObserver todas las secciones ancladas
     por el nav y enciende el link (o el botón del desplegable que la
     contiene) correspondiente — sutil, pero es el tipo de detalle que
     distingue un sitio pulido de uno genérico. */
  function initNavScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    // Solo los anclajes reales del nav — se observa "hero" (una sección
    // acotada de 100vh, ideal para IntersectionObserver) en vez de <main>,
    // que envuelve todo el documento y nunca cruzaría el umbral otra vez.
    const anchorMap = { hero: 'inicio', belgica: 'belgica', video: 'video', brasil: 'brasil', radio: 'radio' };
    const sections = Object.keys(anchorMap)
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    function setActive(id) {
      // Otros efectos (el resplandor de neón que sigue al cursor, en
      // js/effects.js) escuchan este evento para adaptar su tono a la
      // sección visible, sin acoplarse directamente al scroll-spy.
      window.dispatchEvent(new CustomEvent('tl:sectionchange', { detail: { id } }));

      document.querySelectorAll('.nav-link.active, .nav-toggle.active').forEach((el) => el.classList.remove('active'));
      const link = document.querySelector(`.nav-list > .nav-item > a.nav-link[href="#${id}"]`);
      if (link) { link.classList.add('active'); return; }

      // Si la sección activa vive dentro de un desplegable, resalta ese botón padre
      const dropdownLink = document.querySelector(`.dropdown-link[href="#${id}"]`);
      if (dropdownLink) {
        const toggle = dropdownLink.closest('.nav-item')?.querySelector('.nav-toggle');
        if (toggle) toggle.classList.add('active');
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(anchorMap[entry.target.id]);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- 6. Indicador de scroll animado con Lottie ---------- */
  function initScrollCueLottie() {
    const container = document.getElementById('scrollCueLottie');
    const wrapper = document.querySelector('.scroll-cue');
    if (!container || !wrapper) return;

    const player = window.lottie || window.bodymovin;
    if (!player || prefersReducedMotion) {
      wrapper.classList.add('lottie-unavailable');
      return;
    }

    try {
      player.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/lottie/scroll-cue.json'
      });
    } catch (err) {
      wrapper.classList.add('lottie-unavailable');
    }
  }

  // API pública: main.js llama a esto después de inyectar tarjetas dinámicas.
  window.TomorrowlandAnimations = {
    refresh() {
      initCardReveal();
      initParallax();
      initCardTilt();
      if (hasGSAP) ScrollTrigger.refresh();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!hasGSAP) {
      revealEverythingInstantly();
    } else {
      initHeroIntro();
      initHeroScrollEffect();
      initHeroBreathing();
      initHeadingReveal();
      initEnhancedHeaderEffects();
      initSectionDepthEffect();
    }
    // No depende de GSAP (usa IntersectionObserver puro), así que corre
    // siempre, esté o no disponible esa librería.
    initSectionTitleCineEffect();
    initScrollProgress();
    initNavScrollSpy();
    initCardReveal();
    initParallax();
    initCardTilt();
    initScrollCueLottie();
  });
})();
