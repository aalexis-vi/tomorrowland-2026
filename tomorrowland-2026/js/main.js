/* ============================================================
   MAIN.JS
   Responsable de: inicialización general del sitio, datos de
   contenido editable (noticias/tarjetas) y su renderizado en
   el DOM. Este es el archivo principal a editar cuando se
   quiera actualizar texto, imágenes o enlaces del contenido.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     ===== NOTICIAS TOMORROWLAND BÉLGICA =====
     Edita, agrega o elimina objetos de este arreglo para
     actualizar el carrusel de la sección "Visitar Tomorrowland
     Bélgica". "image" debe apuntar a assets/images/belgium/.
     ============================================================ */
  const belgiumNews = [
    {
      image: 'assets/images/belgium/belgium-1.jpg',
      title: 'Sets completos disponibles en YouTube, la aplicación de Tomorrowland y Apple Music',
      description: 'Revive la magia de Tomorrowland 2026.',
      link: '#'
    },
    {
      image: 'assets/images/belgium/belgium-2.jpg',
      title: 'Se ha cerrado un capítulo inolvidable de Tomorrowland Bélgica',
      description: 'Juntos, hemos escrito páginas únicas, hermosas e intensas en la historia de Consciencia.',
      link: '#'
    },
    {
      image: 'assets/images/belgium/belgium-3.jpg',
      title: "Este es el escenario principal 'Consciencia' de Tomorrowland Bélgica",
      description: 'Echa un primer vistazo a la impresionante pieza central de Tomorrowland Bélgica 2026.',
      link: '#'
    },
    {
      image: 'assets/images/belgium/belgium-4.jpg',
      title: 'Entra en el mundo de Consciencia',
      description: 'Una magnífica historia donde lo imposible es solo un sueño a punto de hacerse realidad.',
      link: '#'
    }
  ];
  /* Nota: las imágenes anteriores corresponden a fotografías reales
     provistas para el proyecto (assets/images/belgium/). */

  /* ============================================================
     ===== NOTICIAS TOMORROWLAND BRASIL =====
     "image" debe apuntar a assets/images/brazil/.
     ============================================================ */
  const brazilNews = [
    {
      image: 'assets/images/brazil/brazil-1.jpg',
      tag: 'Tomorrowland Brasil',
      title: 'El emblema de Tomorrowland toma forma en el cielo',
      description: 'Cientos de drones dibujan el logo del festival sobre el escenario principal, acompañados de fuegos artificiales.',
      link: '#'
    },
    {
      image: 'assets/images/brazil/brazil-2.jpg',
      tag: 'Tomorrowland Brasil',
      title: 'La energía de Brasil no tiene comparación',
      description: 'La bandera brasileña ondea entre luces y flores gigantes, en una de las noches más recordadas de esta edición.',
      link: '#'
    },
    {
      image: 'assets/images/brazil/brazil-3.jpg',
      tag: 'Tomorrowland Brasil',
      title: 'De día o de noche, la misma magia',
      description: 'Con el sol de frente o bajo las luces del escenario, la energía de Tomorrowland se vive igual de intensa.',
      link: '#'
    },
    {
      image: 'assets/images/brazil/brazil-4.jpg',
      tag: 'Tomorrowland Brasil',
      title: 'Un escenario que parece sacado de otro mundo',
      description: 'Flores gigantes, luces bioluminiscentes y fuegos artificiales transforman cada noche en un espectáculo único.',
      link: '#'
    }
  ];

  /* ============================================================
     ===== ESTACIÓN DE RADIO =====
     "image" debe apuntar a assets/images/radio/. El campo "meta"
     usa el nombre real de la radio oficial de Tomorrowland
     (One World Radio) como etiqueta genérica.
     ============================================================ */
  const radioNews = [
    {
      image: 'assets/images/radio/radio-1.jpg',
      title: 'Así se vive Tomorrowland desde dentro',
      description: 'Un vistazo detrás de escena, junto a los artistas que hacen posible la magia del festival.',
      meta: 'One World Radio',
      link: '#'
    },
    {
      image: 'assets/images/radio/radio-2.jpg',
      title: 'Los escenarios que marcaron una era',
      description: 'Revive la atmósfera de algunos de los diseños más icónicos en la historia de Tomorrowland.',
      meta: 'One World Radio',
      link: '#'
    },
    {
      image: 'assets/images/radio/radio-3.jpg',
      title: 'La comunidad que nunca deja de bailar',
      description: 'Personas de todo el mundo, una misma energía: la esencia de vivir Tomorrowland.',
      meta: 'One World Radio',
      link: '#'
    },
    {
      image: 'assets/images/radio/radio-4.jpg',
      title: 'Momentos que se sienten para siempre',
      description: 'Los pequeños detalles — una chispa, una luz, un instante — también cuentan la historia del festival.',
      meta: 'One World Radio',
      link: '#'
    }
  ];

  /* ---------- Helpers de renderizado ---------- */

  function createImage(src, alt, placeholderLabel) {
    const wrapper = document.createElement('div');
    // Shimmer mientras la imagen carga, en vez de dejar el hueco vacío
    // (se quita solo al terminar de cargar, con éxito o con error).
    wrapper.classList.add('media-skeleton');

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.className = 'js-parallax';
    img.dataset.speed = '0.06';
    img.addEventListener('load', () => wrapper.classList.remove('media-skeleton'));
    img.addEventListener('error', () => {
      wrapper.classList.remove('media-skeleton');
      wrapper.classList.add('img-fallback');
      wrapper.setAttribute('data-placeholder', placeholderLabel);
    });
    wrapper.appendChild(img);
    return wrapper;
  }

  function renderBelgiumCards() {
    const track = document.getElementById('belgiumTrack');
    if (!track) return;

    belgiumNews.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'news-card';

      const media = createImage(item.image, item.title, 'Imagen — assets/images/belgium/');
      media.classList.add('news-card-media'); // (además de "media-skeleton", puesta por createImage)

      const body = document.createElement('div');
      body.className = 'news-card-body';
      body.innerHTML = `
        <h3 class="news-card-title">${item.title}</h3>
        <p class="news-card-desc">${item.description}</p>
        <a class="news-card-link" href="${item.link}">Ver más <span class="btn-arrow" aria-hidden="true">→</span></a>
      `;

      card.appendChild(media);
      card.appendChild(body);
      track.appendChild(card);
    });
  }

  function renderBrazilCards() {
    const grid = document.getElementById('brazilGrid');
    if (!grid) return;

    brazilNews.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'grid-card';

      const media = createImage(item.image, item.title, 'Imagen — assets/images/brazil/');
      media.classList.add('grid-card-media'); // (además de "media-skeleton", puesta por createImage)

      const body = document.createElement('div');
      body.className = 'grid-card-body';
      body.innerHTML = `
        <span class="grid-card-tag animate__animated animate__pulse animate__infinite animate__slower">${item.tag}</span>
        <h3 class="grid-card-title">${item.title}</h3>
        <p class="grid-card-desc">${item.description}</p>
        <a class="grid-card-link" href="${item.link}">Leer más →</a>
      `;

      card.appendChild(media);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function renderRadioCards() {
    const grid = document.getElementById('radioGrid');
    if (!grid) return;

    radioNews.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'grid-card';

      const media = createImage(item.image, item.title, '[IMAGEN AQUÍ]');
      media.classList.add('grid-card-media'); // (además de "media-skeleton", puesta por createImage)

      const body = document.createElement('div');
      body.className = 'grid-card-body';
      body.innerHTML = `
        <h3 class="grid-card-title">${item.title}</h3>
        <p class="grid-card-desc">${item.description}</p>
        <p class="grid-card-meta">${item.meta}</p>
        <a class="grid-card-link" href="${item.link}">Leer más →</a>
      `;

      card.appendChild(media);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function setFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Inicialización ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderBelgiumCards();
    renderBrazilCards();
    renderRadioCards();
    setFooterYear();

    // Vuelve a calcular las animaciones de aparición ahora que
    // las tarjetas dinámicas ya existen en el DOM.
    if (window.TomorrowlandAnimations) {
      window.TomorrowlandAnimations.refresh();
    }
    // Ídem para el carrusel 3D: recién ahora hay tarjetas dentro de
    // cada .card-track para calcularles su rotación/escala.
    if (window.TomorrowlandEffects) {
      window.TomorrowlandEffects.refreshCoverflow();
    }
  });
})();
