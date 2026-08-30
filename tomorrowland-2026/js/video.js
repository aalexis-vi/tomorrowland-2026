/* ============================================================
   VIDEO.JS
   Responsable de: el reproductor con miniatura de cualquier
   sección de video del sitio (la de index.html y las tarjetas
   de video de musica/sets-videos.html). El video de YouTube
   solo se carga cuando la persona hace clic en el botón de
   reproducir — así la página carga más rápido y el video se
   reproduce directamente ahí mismo, sin salir del sitio.

   Usa la API real de reproductor de YouTube (no un <iframe>
   suelto) específicamente para poder escuchar su evento
   "onError": algunos videos (sobre todo sets de DJ y
   transmisiones con música con derechos restringidos) no
   permiten incrustarse fuera de YouTube, y sin este control esa
   falla se veía como el cartel feo y genérico de YouTube
   ("Video no disponible") en vez de algo acorde al sitio.

   Funciona con cualquier cantidad de reproductores en la misma
   página: basta con que cada uno sea un ".video-responsive" con
   "data-video-id" y contenga un botón ".video-play-btn" dentro.

   Dentro de un ".video-showcase" (1 video principal + varios
   secundarios, ver index.html y musica/sets-videos.html) los
   secundarios no reproducen en su propio recuadro chico: al
   hacer clic, se intercambian con el video principal — ese pasa
   a ser "el grande" y arranca a reproducirse ahí (ver
   initVideoShowcaseSwap más abajo).
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Carga diferida de la API de YouTube ----------
     Se pide una sola vez, recién cuando hace falta (el primer clic en
     cualquier reproductor de la página), y cualquier intento de
     reproducir que llegue mientras todavía está cargando se encola en
     "pendingPlays" — la API llama a "onYouTubeIframeAPIReady" (nombre
     fijo, lo exige la propia API) apenas está lista, y ahí se procesan
     en orden. */
  const pendingPlays = [];

  function loadYouTubeApi() {
    if (document.getElementById('yt-iframe-api')) return;
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  window.onYouTubeIframeAPIReady = function () {
    pendingPlays.splice(0).forEach((fn) => fn());
  };

  // Un reproductor por recuadro — se usa para poder destruirlo
  // correctamente (player.destroy() limpia el iframe y sus listeners)
  // antes de reemplazar el video de ese mismo recuadro.
  const players = new WeakMap();

  // Códigos reales de YT.PlayerError (ver https://developers.google.com/youtube/iframe_api_reference#onError):
  //   2   → el "videoId" tiene un formato inválido
  //   5   → el reproductor HTML5 no puede procesar este contenido (a veces transitorio)
  //   100 → el video no existe o es privado
  //   101 / 150 → el dueño del video no permite reproducirlo en reproductores incrustados
  const ERROR_MESSAGES = {
    2: 'El ID de este video no es válido.',
    5: 'Este video no se pudo cargar (error del reproductor).',
    100: 'Este video no existe o es privado.',
    101: 'El dueño de este video no permite reproducirlo fuera de YouTube.',
    150: 'El dueño de este video no permite reproducirlo fuera de YouTube.'
  };

  function showUnavailable(facade, videoId, code) {
    const existingIframe = facade.querySelector('iframe');
    if (existingIframe) existingIframe.remove();

    // Se deja el código a la vista (no solo en consola) para no tener que
    // adivinar la causa mirando videos al azar — ver la tabla de arriba.
    const detail = ERROR_MESSAGES[code] || 'No se pudo reproducir aquí.';
    console.warn(`[video.js] YT.PlayerError ${code} en ${videoId}: ${detail}`);

    const notice = document.createElement('div');
    notice.className = 'video-unavailable';
    notice.innerHTML = `
      <span class="video-unavailable-icon" aria-hidden="true">⚠</span>
      <p>${detail}<br><small>(código ${code})</small></p>
      <a class="video-unavailable-link" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">Verlo en YouTube ↗</a>
    `;
    facade.appendChild(notice);
    facade.classList.add('is-unavailable');
  }

  function playVideo(facade) {
    if (facade.classList.contains('is-playing') || facade.classList.contains('is-unavailable')) return;

    // ===== EDITAR VIDEO ===== (cambia el atributo data-video-id en el HTML)
    const videoId = facade.dataset.videoId;
    if (!videoId) return;

    facade.classList.add('is-playing');
    const mount = document.createElement('div');
    facade.appendChild(mount);

    function create() {
      const player = new YT.Player(mount, {
        videoId,
        playerVars: { autoplay: 1, rel: 0 },
        events: {
          onReady: (event) => {
            const iframe = event.target.getIframe();
            iframe.title = 'Video oficial de Tomorrowland';
            iframe.style.opacity = '0';
            if (typeof gsap !== 'undefined') {
              gsap.to(iframe, { opacity: 1, duration: .5, ease: 'power1.out' });
            } else {
              iframe.style.transition = 'opacity .5s ease';
              requestAnimationFrame(() => { iframe.style.opacity = '1'; });
            }
          },
          onError: (event) => {
            players.delete(facade);
            showUnavailable(facade, videoId, event.data);
          }
        }
      });
      players.set(facade, player);
    }

    if (window.YT && window.YT.Player) {
      create();
    } else {
      pendingPlays.push(create);
      loadYouTubeApi();
    }
  }

  // Destruye el reproductor (si lo hay) y quita el aviso de "no
  // disponible" (si lo hay) — deja el recuadro de nuevo mostrando su
  // miniatura + botón. Se usa antes de intercambiar el video de un
  // recuadro, para no dejar nada "huérfano" reproduciendo o mostrando
  // un error que ya no corresponde a ese lugar.
  function resetFacade(facade) {
    const player = players.get(facade);
    if (player && typeof player.destroy === 'function') {
      player.destroy();
      players.delete(facade);
    } else {
      const iframe = facade.querySelector('iframe');
      if (iframe) {
        iframe.src = ''; // corta la carga/reproducción antes de quitarlo del DOM
        iframe.remove();
      }
    }

    const notice = facade.querySelector('.video-unavailable');
    if (notice) notice.remove();

    facade.classList.remove('is-playing', 'is-unavailable');
  }

  /* ---------- Reproducción normal: clic en el propio reproductor ----------
     Los secundarios de un ".video-showcase" quedan afuera: esos no
     reproducen en su propio recuadro (ver initVideoShowcaseSwap). */
  document.querySelectorAll('.video-responsive[data-video-id]').forEach((facade) => {
    if (facade.closest('.video-secondary')) return;

    const playBtn = facade.querySelector('.video-play-btn');
    if (!playBtn) return;
    playBtn.addEventListener('click', () => playVideo(facade));
  });

  /* ---------- Showcase: promover un video secundario a "principal" ----------
     Al hacer clic en cualquier parte de un video secundario, se
     intercambian el ID de YouTube y la miniatura con el reproductor
     grande, y el grande arranca a reproducirse — ese pasa a ser el
     video principal, y el que estaba antes queda disponible en el
     lugar del que se hizo clic (no se pierde, solo cambia de sitio). */
  function initVideoShowcaseSwap() {
    document.querySelectorAll('.video-showcase').forEach((showcase) => {
      const mainFacade = showcase.querySelector('.video-frame .video-responsive');
      if (!mainFacade) return;

      // El enlace de respaldo ("¿No se reproduce aquí? Míralo en YouTube")
      // apunta por defecto al video principal original — si no se
      // actualiza también al intercambiar, seguiría apuntando al video
      // equivocado cuando el que queda arriba es otro.
      const fallbackLink = showcase.querySelector('.video-fallback-link');

      // La etiqueta ("Tomorrowland 2026 · Sin filtros", etc.) tiene que
      // viajar CON el video: si solo se intercambian el ID y la miniatura,
      // un secundario se queda con el texto de lo que había antes en su
      // lugar, describiendo el video equivocado.
      const mainTitle = showcase.querySelector('.video-main-title');

      showcase.querySelectorAll('.video-secondary .video-responsive').forEach((facade) => {
        facade.addEventListener('click', () => {
          const mainPoster = mainFacade.querySelector('.video-poster');
          const secPoster = facade.querySelector('.video-poster');
          const secTitleEl = facade.closest('.video-secondary')?.querySelector('.video-secondary-title');
          const mainId = mainFacade.dataset.videoId;
          const secId = facade.dataset.videoId;
          if (!secId || secId === mainId) return;

          resetFacade(mainFacade);
          resetFacade(facade);

          mainFacade.dataset.videoId = secId;
          facade.dataset.videoId = mainId;

          if (mainTitle && secTitleEl) {
            const titleText = mainTitle.textContent;
            mainTitle.textContent = secTitleEl.textContent;
            secTitleEl.textContent = titleText;
          }

          if (mainPoster && secPoster) {
            const posterSrc = mainPoster.src;
            const posterAlt = mainPoster.alt;
            mainPoster.src = secPoster.src;
            mainPoster.alt = secPoster.alt;
            secPoster.src = posterSrc;
            secPoster.alt = posterAlt;
          }

          if (fallbackLink) fallbackLink.href = `https://www.youtube.com/watch?v=${secId}`;

          // Sin setTimeout a propósito: hay que crear el reproductor en el
          // mismo tick del clic. Si se difiere (aunque sea unos ms), se
          // pierde el "gesto de usuario" que los navegadores exigen para
          // permitir el autoplay, y eso puede hacer fallar el video sin
          // que tenga nada que ver con una restricción real de YouTube.
          playVideo(mainFacade);

          const frame = mainFacade.closest('.video-frame');
          if (frame) {
            // Con Lenis manejando el scroll (ver js/smooth-scroll.js), el
            // scrollIntoView nativo del navegador queda compitiendo con él
            // y se siente tironeado — se usa lenis.scrollTo() si está
            // disponible, y solo se cae al nativo si Lenis no cargó
            // (ej. prefers-reduced-motion, que tampoco anima este scroll).
            if (window.TomorrowlandLenis) {
              window.TomorrowlandLenis.scrollTo(frame, { offset: -120 });
            } else {
              frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
      });
    });
  }

  initVideoShowcaseSwap();
})();
