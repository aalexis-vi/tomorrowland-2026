# Tomorrowland 2026 — Sitio web

Sitio web inspirado visualmente en Tomorrowland 2026: una página principal (`index.html`) más un pequeño grupo de páginas independientes para Festival, Eventos y Música. Construido únicamente con **HTML5 + CSS3 + JavaScript**, sin frameworks, y organizado en carpetas separadas para facilitar su mantenimiento.

## 1. ¿Qué es este proyecto?

Un sitio que recrea la experiencia de un festival internacional de música electrónica, con:

- Header fijo con menús desplegables y menú hamburguesa en móvil, presente en todas las páginas.
- **`index.html`**: hero a pantalla completa con carrusel de imágenes, sección "Visitar Tomorrowland Bélgica" con carrusel de noticias, sección de video con miniatura, sección "Tomorrowland Brasil 2027" y sección "Estación de Radio".
- **Páginas independientes** (ver sección 1.2): Festival (Bélgica / Brasil), Eventos (Bélgica 2026 / Brasil 2027) y Música (Sets y videos).
- Footer con redes sociales, igual en todas las páginas.
- Animaciones con GSAP, Anime.js, Lottie, Animate.css y Lenis (ver sección 3.3).

## 1.1 Correcciones aplicadas a la versión editada en Visual Studio

Antes de agregar las librerías y el nuevo contenido, se revisó el código que traías (con las animaciones ya retocadas en Visual Studio) y se corrigieron dos errores reales que habría dado problemas:

1. **El carrusel de Bélgica podía dejar de responder al hacer clic en sus flechas.** La función del efecto ripple estaba declarada dentro de un bloque `if` pero se usaba fuera de él; en modo estricto (`'use strict'`, que este proyecto usa en todos sus archivos JS) eso lanza un error en tiempo de ejecución y rompe el botón. Se movió la función a un nivel donde ambos carruseles pueden usarla.
2. **El hero (`overflow: visible`) podía dejar que las imágenes se salieran del recuadro** durante el efecto de zoom, especialmente en pantallas angostas. Se devolvió a `overflow: hidden`, que es lo correcto para un carrusel a pantalla completa.

El resto de las mejoras visuales que ya habías incorporado (flechas con más brillo, indicador de progreso en los puntos del hero, tarjetas con más profundidad) se conservaron y se integraron con el nuevo sistema de animación.

## 1.2 Páginas independientes (Festival / Eventos / Música)

Además de `index.html`, el menú "Festival", "Eventos" y "Música" enlaza a páginas propias en vez de anclas dentro de la misma página:

| Página | Archivo | Contenido |
|---|---|---|
| Tomorrowland Bélgica | `festival/belgica.html` | El lugar y su historia: De Schorre (Boom), por qué es único, galería de momentos. No cambia de una edición a otra. |
| Tomorrowland Brasil | `festival/brasil.html` | Lo mismo, para Itu (São Paulo). |
| Bélgica 2026 | `eventos/belgica-2026.html` | La edición concreta: fechas, escenario principal "Consciencia", entradas/paquetes y las últimas noticias reales de 2026. |
| Brasil 2027 | `eventos/brasil-2027.html` | La próxima edición, aún sin fecha ni line-up oficial — página de "quédate al tanto", sin inventar noticias que todavía no existen. |
| Sets y videos | `musica/sets-videos.html` | El video oficial embebido, enlaces a dónde ver los sets completos (YouTube / app / Apple Music) y una galería de tarjetas de video. |

Cada una de estas páginas reutiliza los mismos estilos y scripts que `index.html` (rutas relativas con `../`, ya que viven un nivel más abajo) más una hoja adicional, `css/pages.css`, con los componentes propios de estas páginas (banner de página, migas de pan, tarjetas de características, tarjetas de entradas, galería de video, etc.). El estado "activo" del menú en estas páginas se marca directamente en el HTML (clase `.active` en el `dropdown-link`/`mobile-sublink` correspondiente), ya que el scroll-spy de `js/animations.js` solo tiene sentido dentro de `index.html`.

Para que las tarjetas (`.news-card`/`.grid-card`) y los reproductores de video funcionaran igual fuera de `index.html`, se generalizaron dos piezas de `js/`:

- `js/animations.js` → `initCardReveal()` ahora recorre **cualquier** `.card-track` de la página (antes solo miraba los tres contenedores de `index.html` por su `id`).
- `js/video.js` → ahora soporta **cualquier cantidad** de reproductores por página (antes asumía uno solo, buscado por `id`); basta con que cada uno sea un `.video-responsive[data-video-id]` con un botón `.video-play-btn` dentro.

## 2. Estructura de carpetas

```text
tomorrowland-2026/
│
├── index.html                 → toda la estructura HTML de la página principal
│
├── festival/
│   ├── belgica.html            → página "Tomorrowland Bélgica" (el lugar, no la edición)
│   └── brasil.html              → página "Tomorrowland Brasil"
│
├── eventos/
│   ├── belgica-2026.html        → página de la edición "Bélgica 2026" (fechas, entradas, noticias)
│   └── brasil-2027.html          → página de la edición "Brasil 2027" (aún sin anunciar)
│
├── musica/
│   └── sets-videos.html          → página "Sets y videos"
│
├── css/
│   ├── styles.css              → estilos principales (colores, layout, componentes)
│   ├── animations.css          → estados iniciales y animaciones puramente CSS
│   ├── pages.css                → componentes usados solo por festival/eventos/musica (ver 1.2)
│   └── responsive.css          → media queries (tablet / móvil)
│
├── js/
│   ├── main.js                  → datos de contenido (noticias/tarjetas) + inicialización
│   ├── carousel.js              → lógica del carrusel del hero y flechas de tarjetas
│   ├── navigation.js            → header, dropdowns, menú hamburguesa y acordeón móvil
│   ├── smooth-scroll.js         → scroll suave con inercia (Lenis) + su enganche con ScrollTrigger
│   ├── animations.js            → motor de animación (GSAP/ScrollTrigger, Anime.js, Lottie)
│   └── video.js                  → reproductor de video con miniatura (clic para reproducir)
│
├── assets/
│   ├── images/
│   │   ├── hero/                 → imágenes del carrusel principal
│   │   ├── belgium/               → imágenes de las noticias de Bélgica
│   │   ├── brazil/                 → imágenes de las tarjetas de Brasil
│   │   ├── radio/                  → imágenes de la Estación de Radio
│   │   └── general/                 → logo, miniatura del video y fotos de reserva
│   ├── icons/                          → emblema SVG y favicons
│   ├── lottie/                          → animación scroll-cue.json
│   ├── videos/                           → videos locales, si se necesitan
│   └── vendor/                            → librerías de terceros (ver sección 3.3)
│       ├── gsap/
│       ├── anime/
│       ├── lottie/
│       ├── lenis/
│       └── animate-css/
│
└── README.md
```

## 3. Cómo ejecutar el proyecto localmente

No requiere instalación ni build. Basta con abrir `index.html` en un navegador, aunque se recomienda usar un servidor local para que todas las rutas relativas funcionen igual que en producción:

```bash
# Opción 1 — Python
cd tomorrowland-2026
python3 -m http.server 8000
# abrir http://localhost:8000

# Opción 2 — Node (si tienes serve instalado)
npx serve .
```

## 3.1 Imágenes y logo ya incluidos

Este proyecto ya incluye fotografías reales del festival y el emblema oficial de Tomorrowland — **ninguna tarjeta del sitio queda vacía o con placeholder**:

- `assets/images/hero/hero-1.jpg` a `hero-4.jpg` → fotos reales usadas en el carrusel del hero.
- `assets/images/belgium/belgium-1.jpg` a `belgium-4.jpg` → fotos reales usadas en las 4 tarjetas de noticias de Bélgica.
- `assets/images/brazil/brazil-1.jpg` a `brazil-4.jpg` → fotos reales usadas en las 4 tarjetas de Tomorrowland Brasil.
- `assets/images/radio/radio-1.jpg` a `radio-4.jpg` → fotos reales usadas en las 4 tarjetas de la Estación de Radio.
- Las miniaturas de la sección de video (`.video-showcase`) usan las miniaturas reales de cada video de YouTube (`https://i.ytimg.com/vi/<ID>/hqdefault.jpg`), no un archivo local — así siempre coinciden con el video que representan. `assets/images/general/video-poster.jpg` queda como imagen de reserva por si prefieres una miniatura propia en vez de la de YouTube.
- `assets/icons/tomorrowland-emblem.svg` → el emblema oficial (vector), usado como logo en el header, el footer y el hero mediante `mask-image` en CSS (así puede colorearse con el degradado de marca o en blanco según el fondo).
- `assets/icons/favicon-32.png` / `favicon-180.png` → favicon generado a partir del emblema.
- `assets/images/general/` → algunas fotos de reserva no usadas todavía en ninguna sección (`brazil-extra-1.jpg`, `crowd-vertical.jpg`, `crowd-lights.jpg`), por si quieres ampliar alguna sección más adelante.

Los textos de Brasil y Radio son descripciones genéricas y verídicas (no se inventaron noticias específicas con fechas o datos concretos) — reemplázalos por contenido oficial cuando lo tengas, siguiendo la sección 5.

## 3.2 Animaciones e interactividad

El sitio incluye una capa de animación elaborada, pensada para sentirse fluida sin sacrificar accesibilidad ni rendimiento:

- **Hero**: línea de tiempo de entrada (logo → fecha → título → subtítulo) y cross-fade de 1.2s entre imágenes con paneo tipo "Ken Burns" (12s) de fondo. Al hacer scroll, el propio carrusel se difumina, se atenúa y se desplaza a distinta velocidad que el resto de la página (efecto de profundidad).
- **Título del hero**: en vez de un simple fundido, cada palabra ("Tomorrowland" y "2026") se separa en su propio elemento (sin plugins de pago) y entra con su propio desenfoque + desfase (`initHeroIntro` en `js/animations.js`).
- **Títulos de sección — "efecto cine"**: arrancan desenfocados, corridos hacia abajo y transparentes; al entrar en pantalla (`IntersectionObserver`, sin depender de GSAP) pasan a nítidos y en su lugar, y vuelven al estado inicial al salir de pantalla — se repite cada vez que se cruza la sección al scrollear (`initSectionTitleCineEffect` en `js/animations.js`, estados en `css/styles.css`).
- **Indicadores del hero**: cada punto activo muestra una barra de progreso que se llena en sincronía con el temporizador del autoplay, y se pausa visualmente si el mouse está sobre el hero.
- **Tarjetas (Bélgica / Brasil / Radio)**: aparecen con desenfoque + escala progresiva al entrar en pantalla (una tras otra, no todas a la vez), y reaccionan al mouse con una inclinación 3D ("tilt") suave además del zoom y brillo de la imagen interna.
- **Carrusel de Bélgica**: además de las flechas (con efecto ripple al hacer clic), se puede arrastrar con el mouse (drag-to-scroll) para navegar las noticias, junto con el scroll táctil nativo en móvil.
- **Parallax**: las imágenes de las tarjetas y el resplandor de la sección de video se desplazan sutilmente a distinta velocidad que el scroll de la página.
- **Menú móvil**: el ícono de hamburguesa se transforma en una "X" animada, y el acordeón mide la altura real de su contenido al abrirse (no se corta contenido largo).
- **Scroll suave con inercia**: todo el sitio se desplaza con Lenis en vez del scroll nativo del navegador — se siente continuo y con un poco de "peso", en vez de saltar de a pasos. Reemplaza al scroll-snap por sección que tenía antes el sitio (ambos compiten por la posición final del scroll y se sienten tironeados si conviven). Ver `js/smooth-scroll.js`.
- Todo esto respeta `prefers-reduced-motion`: si el sistema operativo del visitante tiene activada la reducción de movimiento, las animaciones se desactivan automáticamente y el contenido queda visible de inmediato (incluido el scroll con inercia: `smooth-scroll.js` directamente no inicializa Lenis en ese caso).

## 3.3 Librerías de animación utilizadas

El proyecto sigue siendo HTML5 + CSS3 + JavaScript puro (sin frameworks ni build step), pero incorpora 5 librerías de animación, **ya incluidas dentro del proyecto** en `assets/vendor/` para que funcionen sin necesitar conexión a internet:

| Librería | Versión | Dónde se usa | Licencia |
|---|---|---|---|
| **GSAP + ScrollTrigger** | 3.15 | Línea de tiempo de entrada del hero, efecto de profundidad al hacer scroll, aparición de secciones/tarjetas y parallax de imágenes. Es el motor principal de animación del sitio. | GreenSock "No Charge" (gratuita, ver `assets/vendor/gsap/NOTICE.txt`) |
| **Anime.js** | 4.5 | Inclinación 3D ("tilt") de las tarjetas al pasar el mouse, morfo del ícono de hamburguesa, acordeón del menú móvil y efecto ripple de los botones. | MIT |
| **Lottie** (lottie-web) | 5.13 | Indicador animado de "desplázate hacia abajo" en el hero (`assets/lottie/scroll-cue.json`, una animación vectorial ligera hecha para este proyecto). | MIT |
| **Animate.css** | 4.1 | Clases rápidas de entrada/énfasis: el botón de reproducir video, la etiqueta "Tomorrowland Brasil" y el punto "en vivo" de la Estación de Radio. | MIT |
| **Lenis** | 1.3.26 | Scroll suave con inercia de toda la página, sincronizado con ScrollTrigger (ver `js/smooth-scroll.js`). | MIT |

> **Nota sobre Motion (Framer Motion):** no se incluyó porque es una librería exclusiva para proyectos **React** (usa componentes y hooks de React), y este proyecto es HTML/CSS/JS puro sin ningún framework, tal como se pidió en el brief original. Si en algún momento el proyecto migra a React, Motion sería la opción natural para reemplazar Anime.js/GSAP en las animaciones basadas en componentes.

Si alguna de estas librerías no llegara a cargar (por ejemplo, si mueves los archivos de `assets/vendor/` sin querer), el sitio no se rompe: cada animación tiene un respaldo en CSS puro o deja el contenido visible de inmediato.

## 4. Dónde cambiar las imágenes

Todas las imágenes usan una ruta a un archivo dentro de `assets/images/...`. Si el archivo no existe todavía, la página muestra automáticamente un **placeholder** (fondo con degradado) en su lugar — el diseño nunca se rompe.

| Elemento | Dónde editar | Carpeta de destino |
|---|---|---|
| Imágenes del hero | `js/carousel.js` → arreglo `heroSlides` | `assets/images/hero/` |
| Imágenes de noticias de Bélgica | `js/main.js` → arreglo `belgiumNews` | `assets/images/belgium/` |
| Imágenes de Brasil | `js/main.js` → arreglo `brazilNews` | `assets/images/brazil/` |
| Imágenes de la Estación de Radio | `js/main.js` → arreglo `radioNews` | `assets/images/radio/` |
| Logo | `index.html` → busca `EDITAR LOGO` | `assets/images/general/` |

Para usar una imagen real, coloca el archivo en la carpeta indicada y actualiza el campo `image` con la ruta correspondiente, por ejemplo:

```javascript
{ image: 'assets/images/hero/hero-1.jpg', alt: '...' }
```

## 5. Dónde cambiar los textos

Todos los textos de las tarjetas (títulos, descripciones, fechas) están centralizados en `js/main.js`, dentro de tres arreglos:

- `belgiumNews`
- `brazilNews` (contenido de ejemplo — reemplazar cuando exista contenido oficial)
- `radioNews` (placeholders — reemplazar cuando exista contenido real)

El texto del hero (título, subtítulo, fecha/lugar) se edita directamente en `index.html`, dentro de `<section class="hero">`.

## 6. Dónde cambiar los enlaces

- Enlaces de navegación (header y menú móvil): en `index.html`, dentro de `<nav class="main-nav">` y `<div class="mobile-menu">`.
- Enlaces "Ver más" / "Leer más" de las tarjetas: campo `link` de cada objeto en `js/main.js`.
- Redes sociales del footer: en `index.html`, busca el comentario `===== REDES SOCIALES =====` y reemplaza el `href="#"` de cada ícono por la URL real.

## 7. Dónde cambiar el video

Cada video se muestra con una **miniatura y un botón de reproducir** — el video de YouTube solo se carga y se reproduce (directo ahí mismo, sin salir de la página) cuando la persona hace clic. Esto hace que la página cargue más rápido, y funciona para cualquier cantidad de videos en la misma página (`js/video.js` no busca un video por `id`: engancha automáticamente cualquier `.video-responsive[data-video-id]` que tenga un botón `.video-play-btn` adentro).

La sección de video de `index.html` (`<section class="section-video" id="video">`) y la de `musica/sets-videos.html` muestran **1 video principal + 3 secundarios** (clase `.video-showcase`, ver también `css/pages.css`). En ambos archivos, busca el comentario `EDITAR VIDEO`:

- **Video principal**: cambia el atributo `data-video-id="..."` del `<div class="video-responsive">` dentro de `.video-frame` por el ID de YouTube que quieras (la parte final de la URL, después de `v=` o `/embed/`), y el `src` de su `<img class="video-poster">` por la miniatura que quieras mostrar antes de reproducir (funciona bien usar directamente `https://i.ytimg.com/vi/<ID>/hqdefault.jpg`, la miniatura real de ese video).
- **Videos secundarios**: cada uno vive en un `.video-secondary` dentro de `.video-secondary-grid` — mismo patrón (`data-video-id` + `<img class="video-poster">`), más un `<span class="video-secondary-title">` con su título.

Para agregar o quitar un video secundario, copia o borra un bloque `.video-secondary` completo — no hace falta tocar `js/video.js`. El texto que acompaña al video principal se edita en `<p class="video-quote">`, dentro de `.video-showcase-caption`.

> **Ojo con el ID que elijas:** no todos los videos de YouTube se dejan incrustar en sitios de terceros — algunos (sets de DJs, transmisiones con música con derechos restringidos, y a veces incluso aftermovies oficiales) tienen el embed bloqueado por quien subió el video, y solo se pueden ver entrando directo a YouTube. Cuando eso pasa, el sitio lo detecta solo (`js/video.js` escucha el evento `onError` de la API de YouTube) y en vez del cartel genérico de YouTube muestra un aviso propio con un enlace directo a YouTube (`.video-unavailable`, ver `css/styles.css`) — no hay forma de "arreglarlo" desde el código de este sitio: si te aparece ese aviso, prueba con otro ID.

Los videos secundarios no reproducen en su propio recuadro chico: al hacer clic en cualquiera, se intercambia con el video principal (ID de YouTube + miniatura) y el principal arranca a reproducirse ahí — el que estaba antes de principal no se pierde, queda disponible en el lugar del que se hizo clic. Esa lógica vive en `initVideoShowcaseSwap()`, dentro de `js/video.js`.

## 8. Cómo agregar nuevas noticias (Bélgica)

Abre `js/main.js` y agrega un nuevo objeto al arreglo `belgiumNews`:

```javascript
belgiumNews.push({
  image: 'assets/images/belgium/belgium-5.jpg',
  title: 'Nuevo título de la noticia',
  description: 'Descripción breve de la noticia.',
  link: '#'
});
```

La tarjeta se generará automáticamente en el carrusel — no es necesario tocar el HTML ni el CSS.

## 9. Cómo agregar nuevas tarjetas (Brasil / Radio)

El proceso es idéntico: agrega un nuevo objeto al arreglo correspondiente en `js/main.js` (`brazilNews` o `radioNews`), respetando los mismos campos que ya usan los demás elementos del arreglo. Las tarjetas se generan dinámicamente, así que la sección crecerá automáticamente en el grid.

---

**Nota:** este proyecto es una demostración/plantilla y no un sitio oficial de Tomorrowland.
