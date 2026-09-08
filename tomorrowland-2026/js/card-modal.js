/* ============================================================
   CARD-MODAL.JS
   Responsable de: expandir en un modal las tarjetas informativas
   del sitio al hacer clic — las de ícono (.feature-card), las de
   noticias (.news-card, carrusel de Bélgica) y las de galería
   (.grid-card, Brasil/Radio). Muestra el mismo contenido de la
   tarjeta (imagen, ícono, título, descripción) más grande y con
   foco, para que la interacción no se quede en "solo mirar".

   Deliberadamente NO se aplica a un ".feature-card" que sea un
   <a> real (ej. las tarjetas "YouTube / App / Apple Music" de
   musica/sets-videos.html): esas ya son un enlace de verdad hacia
   otro destino, y convertirlas en un modal sería un paso atrás
   (un clic que antes te llevaba a algún lado, ahora no iría a
   ningún sitio). Tampoco se intercepta el enlace "Ver más" de una
   tarjeta cuando de verdad apunta a otra página del sitio (no un
   "#" de relleno) — ese clic navega normal; el resto de la
   tarjeta sigue abriendo el modal igual.

   Sigue el mismo patrón que animations.js/effects.js: expone
   window.TomorrowlandCardModal.refresh() para que main.js pueda
   volver a llamarlo después de inyectar tarjetas dinámicas
   (belgiumNews/brazilNews/radioNews en index.html).
   ============================================================ */

(function () {
  'use strict';

  const CARD_SELECTOR = '.feature-card, .news-card, .grid-card';
  const boundCards = new WeakSet();
  let modal, panel, mediaEl, iconEl, tagEl, titleEl, descEl, metaEl, linkEl;
  let lastTrigger = null;

  function buildModal() {
    if (modal) return;

    modal = document.createElement('div');
    modal.className = 'tl-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="tl-modal-backdrop" data-modal-close></div>
      <div class="tl-modal-panel" role="dialog" aria-modal="true" aria-labelledby="tlModalTitle">
        <button class="tl-modal-close" type="button" aria-label="Cerrar" data-modal-close>
          <svg viewBox="0 0 384 512" aria-hidden="true"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
        </button>
        <div class="tl-modal-media" hidden><img alt=""></div>
        <div class="tl-modal-body">
          <span class="tl-modal-icon" hidden></span>
          <span class="tl-modal-tag" hidden></span>
          <h3 class="tl-modal-title" id="tlModalTitle"></h3>
          <p class="tl-modal-desc"></p>
          <p class="tl-modal-meta" hidden></p>
          <a class="tl-modal-link btn" hidden>Ver más <span class="btn-arrow" aria-hidden="true">→</span></a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    panel = modal.querySelector('.tl-modal-panel');
    mediaEl = modal.querySelector('.tl-modal-media');
    iconEl = modal.querySelector('.tl-modal-icon');
    tagEl = modal.querySelector('.tl-modal-tag');
    titleEl = modal.querySelector('.tl-modal-title');
    descEl = modal.querySelector('.tl-modal-desc');
    metaEl = modal.querySelector('.tl-modal-meta');
    linkEl = modal.querySelector('.tl-modal-link');

    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-close]')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  function extractCardData(card) {
    const img = card.querySelector('img');
    const icon = card.querySelector('.feature-card-icon svg');
    const tag = card.querySelector('.grid-card-tag');
    const title = card.querySelector('.feature-card-title, .news-card-title, .grid-card-title');
    const desc = card.querySelector('.feature-card-desc, .news-card-desc, .grid-card-desc');
    const meta = card.querySelector('.grid-card-meta');
    const linkAnchor = card.querySelector('.news-card-link, .grid-card-link');

    let link = null;
    if (linkAnchor) {
      const href = linkAnchor.getAttribute('href');
      if (href && href !== '#') {
        // El propio botón del modal ya trae su flecha (".btn-arrow"); si no se
        // excluye la del enlace original al copiar su texto, queda duplicada
        // ("Ver sets y videos → →").
        const clone = linkAnchor.cloneNode(true);
        clone.querySelectorAll('.btn-arrow').forEach((arrow) => arrow.remove());
        link = { href, label: clone.textContent.trim() || 'Ver más' };
      }
    }

    return {
      image: img ? { src: img.currentSrc || img.src, alt: img.alt } : null,
      iconHTML: icon ? icon.outerHTML : null,
      tag: tag ? tag.textContent.trim() : null,
      title: title ? title.textContent.trim() : '',
      desc: desc ? desc.textContent.trim() : '',
      meta: meta ? meta.textContent.trim() : null,
      link
    };
  }

  function fillOptional(el, value, isHTML) {
    if (!value) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    if (isHTML) el.innerHTML = value;
    else el.textContent = value;
  }

  function openModal(card) {
    buildModal();
    const data = extractCardData(card);

    if (data.image) {
      mediaEl.hidden = false;
      const img = mediaEl.querySelector('img');
      img.src = data.image.src;
      img.alt = data.image.alt || '';
    } else {
      mediaEl.hidden = true;
    }

    fillOptional(iconEl, data.iconHTML, true);
    fillOptional(tagEl, data.tag, false);
    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    fillOptional(metaEl, data.meta, false);

    if (data.link) {
      linkEl.hidden = false;
      linkEl.href = data.link.href;
      linkEl.firstChild.textContent = data.link.label + ' ';
    } else {
      linkEl.hidden = true;
    }

    lastTrigger = card;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('tl-modal-locked');
    if (window.TomorrowlandLenis) window.TomorrowlandLenis.stop();

    // Un frame de margen para que el navegador registre el estado inicial
    // (aria-hidden recién quitado) antes de animar — si no, a veces se
    // pierde la transición de entrada por llegar en el mismo tick.
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      modal.querySelector('.tl-modal-close').focus();
    });
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('tl-modal-locked');
    if (window.TomorrowlandLenis) window.TomorrowlandLenis.start();
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  function bindCard(card) {
    if (boundCards.has(card) || card.tagName === 'A') return;
    boundCards.add(card);

    card.classList.add('tl-modal-trigger');
    if (!card.hasAttribute('tabindex')) card.tabIndex = 0;
    card.setAttribute('role', 'button');

    card.addEventListener('click', (e) => {
      const realLink = e.target.closest('.news-card-link, .grid-card-link');
      if (realLink) {
        const href = realLink.getAttribute('href');
        if (href && href !== '#') return; // enlace real: que navegue normal
        e.preventDefault(); // "#" de relleno: no saltar arriba, abrir el modal
      }
      openModal(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.target !== card) return; // el foco está en un enlace interno: que actúe normal
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  }

  function refresh() {
    document.querySelectorAll(CARD_SELECTOR).forEach(bindCard);
  }

  document.addEventListener('DOMContentLoaded', refresh);

  // API pública: main.js llama a esto después de inyectar tarjetas dinámicas
  // (igual que TomorrowlandAnimations/TomorrowlandEffects).
  window.TomorrowlandCardModal = { refresh };
})();
