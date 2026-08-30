/* ============================================================
   CAROUSEL.JS
   Responsable de: carrusel del hero (autoplay, flechas,
   indicadores), arrastre y flechas de los carruseles de
   tarjetas con scroll horizontal (ej. Bélgica).
   ============================================================ */

(function () {
  'use strict';

  const hasAnime = typeof window.anime !== 'undefined';

  /* ============================================================
     Efecto ripple compartido, usado tanto por las flechas del
     hero como por las de los carruseles de tarjetas. Se declara
     a nivel superior del módulo (no dentro de un bloque `if`)
     para que ambos puedan usarlo sin errores en modo estricto.
     ============================================================ */
  function rippleEffect(btn) {
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    btn.appendChild(ripple);

    if (hasAnime) {
      anime.animate(ripple, {
        scale: [0, 1.6],
        opacity: [1, 0],
        duration: 700,
        ease: 'outQuad',
        onComplete: () => ripple.remove()
      });
    } else {
      ripple.style.animation = 'rippleExpandFallback .7s ease-out forwards';
      setTimeout(() => ripple.remove(), 700);
    }
  }

  function pressFeedback(btn, scale) {
    if (!btn) return;
    if (hasAnime) {
      anime.animate(btn, {
        scale: [1, scale, 1],
        duration: 260,
        ease: 'outQuad'
      });
    } else {
      const original = btn.style.transform;
      btn.style.transform = `${original} scale(${scale})`;
      setTimeout(() => { btn.style.transform = original; }, 150);
    }
  }

  /* ============================================================
     ===== EDITAR IMÁGENES DEL HERO =====
     Agrega, elimina o reemplaza diapositivas aquí. "image" debe
     apuntar a un archivo dentro de assets/images/hero/.
     Si el archivo no existe todavía, se muestra un placeholder
     automáticamente (no rompe el diseño).
     ============================================================ */
  const heroSlides = [
    {
      image: 'assets/images/hero/hero-1.jpg',
      alt: 'Escenario principal de Tomorrowland de día, con fuegos artificiales y grandes rostros esculpidos'
    },
    {
      image: 'assets/images/hero/hero-2.jpg',
      alt: 'Escenario principal de Tomorrowland de noche, con haces de luz y humo sobre la multitud'
    },
    {
      image: 'assets/images/hero/hero-3.jpg',
      alt: 'Castillo de Tomorrowland al atardecer con fuegos artificiales'
    },
    {
      image: 'assets/images/hero/hero-4.jpg',
      alt: 'Castillo de Tomorrowland de noche con fuegos artificiales dorados'
    }
  ];

  const AUTOPLAY_INTERVAL = 7500; // más lento y pausado, a juego con la transición fluida

  const heroTrack = document.getElementById('heroTrack');
  const heroDots = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  let currentIndex = 0;
  let autoplayTimer = null;

  function buildHeroSlides() {
    if (!heroTrack) return;

    heroSlides.forEach((slide, i) => {
      const slideEl = document.createElement('div');
      slideEl.className = 'hero-slide';
      slideEl.classList.add(i % 2 === 0 ? 'pan-left' : 'pan-right');
      slideEl.setAttribute('role', 'group');
      slideEl.setAttribute('aria-roledescription', 'diapositiva');
      slideEl.setAttribute('aria-label', `${i + 1} de ${heroSlides.length}`);
      if (i === 0) slideEl.classList.add('active');

      const img = document.createElement('img');
      img.src = slide.image;
      img.alt = slide.alt || 'Tomorrowland 2026';
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.addEventListener('error', () => {
        slideEl.classList.add('img-fallback');
        slideEl.setAttribute('data-placeholder', 'Imagen del hero — reemplazar en assets/images/hero/');
      });

      slideEl.appendChild(img);
      heroTrack.appendChild(slideEl);

      if (heroDots) {
        const dot = document.createElement('button');
        dot.className = 'hero-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir a la imagen ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i, true));
        heroDots.appendChild(dot);
      }
    });
  }

  function goToSlide(index, userTriggered) {
    const slides = heroTrack.querySelectorAll('.hero-slide');
    const dots = heroDots ? heroDots.querySelectorAll('.hero-dot') : [];
    if (!slides.length) return;

    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
    // Cada dot que gana la clase "active" es una reasignación fresca,
    // así que las animaciones CSS ligadas a .active (dotPulse, dotFill)
    // se reinician solas sin necesidad de trucos de reflow.
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));

    if (userTriggered) restartAutoplay();
  }

  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide() { goToSlide(currentIndex - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    if (heroDots) heroDots.classList.remove('is-paused');
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    if (heroDots) heroDots.classList.add('is-paused');
  }
  function restartAutoplay() { startAutoplay(); }

  if (heroTrack) {
    buildHeroSlides();
    startAutoplay();

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        rippleEffect(nextBtn);
        pressFeedback(nextBtn, 0.9);
        nextSlide();
        restartAutoplay();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        rippleEffect(prevBtn);
        pressFeedback(prevBtn, 0.9);
        prevSlide();
        restartAutoplay();
      });
    }

    // Pausa el autoplay cuando el usuario interactúa con el hero
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopAutoplay);
      heroSection.addEventListener('mouseleave', startAutoplay);
    }

    // Soporte táctil básico (swipe)
    let touchStartX = 0;
    heroTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      stopAutoplay();
    }, { passive: true });
    heroTrack.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (delta > 40) prevSlide();
      else if (delta < -40) nextSlide();
      startAutoplay();
    }, { passive: true });
  }

  /* ============================================================
     Flechas para carruseles de tarjetas con scroll horizontal
     (usado por la sección "Visitar Tomorrowland Bélgica").
     Funciona con cualquier .card-arrow que tenga data-target
     apuntando al id del contenedor .card-track.
     ============================================================ */
  document.querySelectorAll('.card-arrow').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const track = document.getElementById(targetId);
      if (!track) return;

      const card = track.querySelector('.news-card, .grid-card');
      const scrollAmount = card ? card.getBoundingClientRect().width + 24 : 320;
      const direction = btn.classList.contains('card-arrow-next') ? 1 : -1;

      rippleEffect(btn);
      pressFeedback(btn, 0.88);

      track.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    });
  });

  /* ============================================================
     Arrastre con mouse (drag-to-scroll) para los carruseles de
     tarjetas — permite navegar el carrusel arrastrando con el
     puntero, además de las flechas y el scroll táctil nativo.
     ============================================================ */
  function enableDragScroll(track) {
    if (!track || track.dataset.dragBound) return;
    track.dataset.dragBound = 'true';

    let isDown = false;
    let moved = false;
    let startX = 0;
    let scrollStart = 0;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return; // el táctil ya hace scroll nativo
      isDown = true;
      moved = false;
      startX = e.clientX;
      scrollStart = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      track.scrollLeft = scrollStart - delta;
    });

    function endDrag() {
      isDown = false;
      track.classList.remove('is-dragging');
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);

    // Evita que un enlace dentro de la tarjeta se active justo después de arrastrar
    track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  document.querySelectorAll('.card-track').forEach(enableDragScroll);
})();
