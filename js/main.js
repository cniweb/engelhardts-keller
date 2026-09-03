/**
 * main.js - Core Application Scripts for Engelhardt's Keller
 * Handles navigation, status widgets, announcement banners, and lightbox
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Data & Weather
  if (window.kellerStore) {
    await window.kellerStore.init();
  }
  if (window.kellerWeather) {
    await window.kellerWeather.fetchWeather();
  }

  initNavigation();
  initAnnouncementBanner();
  initNavbarStatusPill();
  initStatusWidget();
  initWeatherPreview();
  initPizzaStatusBadge();
  initHomeEvents();
  initLightbox();
  initBackToTop();
  initFooterYear();

  // React to changes in store
  if (window.kellerStore) {
    window.kellerStore.subscribe(() => {
      initAnnouncementBanner();
      initNavbarStatusPill();
      initStatusWidget();
      initWeatherPreview();
      initPizzaStatusBadge();
      initHomeEvents();
    });
  }
});

// --- Navigation & Mobile Drawer ---
function initNavigation() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navDrawer = document.getElementById('mobile-nav-drawer');
  const navBackdrop = document.getElementById('nav-backdrop');
  const closeBtn = document.getElementById('close-mobile-nav');
  const header = document.querySelector('.site-header');

  const openDrawer = () => {
    if (navDrawer) navDrawer.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (navDrawer) navDrawer.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('show');
    document.body.style.overflow = '';
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (navBackdrop) navBackdrop.addEventListener('click', closeDrawer);

  // Close drawer when clicking any link inside it
  if (navDrawer) {
    navDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // Scroll shadow on header
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
}

// --- Announcement Banner ---
function initAnnouncementBanner() {
  const banner = document.getElementById('site-announcement-banner');
  if (!banner || !window.kellerStore) return;

  const settings = window.kellerStore.getSettings();
  const ann = settings?.announcement;

  if (ann && ann.active && ann.text) {
    banner.innerHTML = `
      <div class="announcement-content container">
        <span class="announcement-badge"><i class="fa-solid fa-bell"></i> ${ann.badge || 'Aktuell'}</span>
        <span class="announcement-text">${ann.text}</span>
      </div>
    `;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
    banner.innerHTML = '';
  }
}

// --- Status Pill in Navbar ---
function initNavbarStatusPill() {
  const pill = document.getElementById('navbar-status-pill');
  if (!pill || !window.kellerStore || !window.kellerWeather) return;

  const settings = window.kellerStore.getSettings();
  const status = window.kellerWeather.calculateStatus(settings);

  pill.className = `navbar-status-pill pill-${status.badgeType}`;
  pill.innerHTML = `<span class="pill-dot"></span> <span>${status.badgeText}</span>`;
  pill.title = `${status.title}: ${status.reason}`;
}

// --- Main Status Widget (on index.html) ---
function initStatusWidget() {
  const widgetContainer = document.getElementById('keller-status-widget');
  if (!widgetContainer || !window.kellerStore || !window.kellerWeather) return;

  const settings = window.kellerStore.getSettings();
  const status = window.kellerWeather.calculateStatus(settings);
  const currentW = status.currentWeather || { temperature_2m: 20, wmo: { label: 'Sonnig', icon: 'fa-sun' } };
  const hourly = window.kellerWeather.getHourlyPreview();

  widgetContainer.className = `status-hero-card card-${status.badgeType}`;
  widgetContainer.innerHTML = `
    <div class="status-card-inner">
      <div class="status-top-row">
        <div class="status-badge-wrapper">
          <span class="status-main-badge badge-${status.badgeType}">
            <span class="status-pulse-dot"></span>
            ${status.badgeText}
          </span>
          ${status.isOverridden ? '<span class="status-mode-hint"><i class="fa-solid fa-lock"></i> Manuell</span>' : '<span class="status-mode-hint"><i class="fa-solid fa-bolt"></i> Live Ebensfeld-Wetter</span>'}
        </div>
        <div class="status-live-weather">
          <div class="live-weather-icon"><i class="fa-solid ${currentW.wmo.icon}"></i></div>
          <div class="live-weather-data">
            <span class="live-temp">${Math.round(currentW.temperature_2m)}°C</span>
            <span class="live-condition">${currentW.wmo.label}</span>
          </div>
        </div>
      </div>

      <div class="status-message-body">
        <h2 class="status-headline">${status.title}</h2>
        <p class="status-subtitle">${status.subtitle}</p>
        <p class="status-explanation"><i class="fa-solid fa-circle-info"></i> ${status.reason}</p>
      </div>

      ${hourly.length > 0 ? `
        <div class="status-forecast-strip">
          <div class="forecast-strip-title"><i class="fa-solid fa-clock"></i> Stunden-Vorschau Ebensfeld:</div>
          <div class="forecast-hours">
            ${hourly.map(h => `
              <div class="forecast-hour-item">
                <span class="hour-time">${h.hour}</span>
                <i class="fa-solid ${h.wmo.icon} hour-icon" title="${h.wmo.label}"></i>
                <span class="hour-temp">${h.temp}°C</span>
                <span class="hour-rain ${h.prob > 25 ? 'rain-warning' : ''}">
                  <i class="fa-solid fa-droplet"></i> ${h.prob}%
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="status-card-footer">
        <div class="regular-hours-hint">
          <i class="fa-solid fa-calendar-days"></i> <strong>Reguläre Kellerzeiten:</strong> Di–Sa ab 16:00 Uhr | So & Feiertage ab 11:00 Uhr | Mo Ruhetag
        </div>
        <div class="status-actions">
          <a href="oeffnungszeiten.html" class="btn btn-sm btn-outline"><i class="fa-solid fa-cloud-sun"></i> Wetterdetails</a>
          <a href="speisekarte.html" class="btn btn-sm btn-primary"><i class="fa-solid fa-utensils"></i> Zur Speisekarte</a>
        </div>
      </div>
    </div>
  `;
}

// --- Extended Weather Preview (on oeffnungszeiten.html) ---
function initWeatherPreview() {
  const previewContainer = document.getElementById('extended-weather-forecast');
  if (!previewContainer || !window.kellerWeather || !window.kellerWeather.weatherData) return;

  const w = window.kellerWeather.weatherData;
  const current = w.current;
  if (!current) return;

  const hourly = window.kellerWeather.getHourlyPreview();
  const currentWmo = (WMO_CODES && WMO_CODES[current.weather_code]) || { label: 'Heiter', icon: 'fa-sun' };

  previewContainer.innerHTML = `
    <div class="extended-weather-card">
      <div class="weather-current-grid">
        <div class="weather-now-main">
          <i class="fa-solid ${currentWmo.icon} current-large-icon"></i>
          <div>
            <div class="now-temp">${Math.round(current.temperature_2m)} °C</div>
            <div class="now-desc">${currentWmo.label} in Ebensfeld</div>
          </div>
        </div>
        <div class="weather-now-stats">
          <div class="stat-box"><i class="fa-solid fa-droplet"></i> Niederschlag: <strong>${current.precipitation || 0} mm</strong></div>
          <div class="stat-box"><i class="fa-solid fa-wind"></i> Wind: <strong>${Math.round(current.wind_speed_10m || 0)} km/h</strong></div>
          <div class="stat-box"><i class="fa-solid fa-location-dot"></i> Station: <strong>Ebensfeld (96250)</strong></div>
        </div>
      </div>

      <div class="extended-hourly-table-wrap">
        <h4><i class="fa-solid fa-chart-line"></i> Vorschau für die heutigen Kellerstunden:</h4>
        <div class="hourly-cards-flex">
          ${hourly.map(h => `
            <div class="hourly-card ${h.prob > 40 ? 'card-rainy' : ''}">
              <div class="h-time">${h.hour}</div>
              <i class="fa-solid ${h.wmo.icon} h-icon"></i>
              <div class="h-temp">${h.temp} °C</div>
              <div class="h-prob"><i class="fa-solid fa-umbrella"></i> ${h.prob} %</div>
              <div class="h-desc">${h.wmo.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// --- Lightbox for Image Gallery ---
function initLightbox() {
  const galleryItems = document.querySelectorAll('.lightbox-trigger');
  if (galleryItems.length === 0) return;

  let lightboxModal = document.getElementById('gallery-lightbox-modal');
  if (!lightboxModal) {
    lightboxModal = document.createElement('div');
    lightboxModal.id = 'gallery-lightbox-modal';
    lightboxModal.className = 'gallery-lightbox hidden';
    lightboxModal.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-dialog">
        <button class="lightbox-close" id="lightbox-close-btn" aria-label="Schließen">&times;</button>
        <button class="lightbox-prev" id="lightbox-prev-btn" aria-label="Vorheriges Bild"><i class="fa-solid fa-chevron-left"></i></button>
        <div class="lightbox-image-container">
          <img src="" alt="" id="lightbox-active-img" />
          <p id="lightbox-caption" class="lightbox-caption"></p>
        </div>
        <button class="lightbox-next" id="lightbox-next-btn" aria-label="Nächstes Bild"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    `;
    document.body.appendChild(lightboxModal);
  }

  const activeImg = document.getElementById('lightbox-active-img');
  const captionEl = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const overlay = lightboxModal.querySelector('.lightbox-overlay');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');

  let currentIndex = 0;
  const itemsList = Array.from(galleryItems);

  const showImage = (index) => {
    if (index < 0) index = itemsList.length - 1;
    if (index >= itemsList.length) index = 0;
    currentIndex = index;

    const item = itemsList[currentIndex];
    const imgSrc = item.getAttribute('data-src') || item.getAttribute('src') || item.getAttribute('href');
    const caption = item.getAttribute('data-caption') || item.getAttribute('alt') || '';

    if (activeImg) activeImg.src = imgSrc;
    if (captionEl) captionEl.textContent = caption;
    lightboxModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightboxModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (activeImg) activeImg.src = '';
  };

  itemsList.forEach((el, idx) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showImage(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (overlay) overlay.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  document.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

function initFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

// --- Dynamic Pizza Oven & Makrelen Grill Status Badge on Homepage ---
function initPizzaStatusBadge() {
  const tag = document.getElementById('home-pizza-card-tag');
  const text = document.getElementById('home-pizza-card-text');
  if (!tag) return;

  const settings = window.kellerStore ? window.kellerStore.getSettings() : null;
  const pizzaOven = settings?.pizza_oven;
  const makrelen = settings?.makrelen_grill;

  if (makrelen?.active && pizzaOven?.active) {
    tag.innerHTML = '<i class="fa-solid fa-fish"></i> Makrelen & Steinofen-Pizza!';
    tag.style.background = '#ecfdf5';
    tag.style.color = '#065f46';
    tag.style.border = '1px solid #10b981';
    if (text) {
      text.textContent = `${pizzaOven.notice_active} Zusätzlich heute: ${makrelen.notice_active}`;
    }
  } else if (makrelen?.active) {
    tag.innerHTML = '<i class="fa-solid fa-fish"></i> Heute frische Makrelen (11,- €)!';
    tag.style.background = '#eff6ff';
    tag.style.color = '#1e40af';
    tag.style.border = '1px solid #3b82f6';
    if (text && makrelen.notice_active) {
      text.textContent = makrelen.notice_active;
    }
  } else if (pizzaOven?.active) {
    tag.innerHTML = '<i class="fa-solid fa-fire"></i> Pizzaofen heute an!';
    tag.style.background = '#ecfdf5';
    tag.style.color = '#065f46';
    tag.style.border = '1px solid #10b981';
    if (text && pizzaOven.notice_active) {
      text.textContent = pizzaOven.notice_active;
    }
  } else {
    tag.innerHTML = '<i class="fa-solid fa-pizza-slice"></i> Pizza & Makrelen an Aktionstagen';
    tag.style.background = 'var(--slate-100)';
    tag.style.color = 'var(--slate-600)';
    tag.style.border = '1px solid var(--slate-300)';
    if (text) {
      text.textContent = 'Für das leibliche Wohl ist bestens gesorgt: Neben traditionellen fränkischen Brotzeiten bieten wir knusprige Steinofen-Pizzen (an Pizza-Tagen), Pfannenschnitzel sowie an bestimmten August-Tagen gegrillte Makrelen frisch vom Holzkohlegrill.';
    }
  }
}

// Floating Back to Top Handler
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 280) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Home Live Events Component ---
function initHomeEvents() {
  const container = document.getElementById('home-events-container');
  if (!container || !window.kellerStore) return;

  const allEvents = window.kellerStore.getEvents();
  const activeEvents = allEvents.filter(e => e.active !== false);

  if (activeEvents.length === 0) {
    container.innerHTML = `
      <div class="no-events-box" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-calendar-check fa-2x" style="color:var(--primary-700); margin-bottom:0.75rem;"></i>
        <h3 style="font-size:1.3rem; margin-bottom:0.5rem; color:var(--primary-900);">Aktuell keine festen Termine angekündigt</h3>
        <p style="font-size:0.95rem; color:var(--slate-600); margin:0;">
          Schauen Sie bald wieder vorbei oder folgen Sie uns auf Facebook und Instagram für spontane Live-Musik-Termine bei schönem Wetter!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = activeEvents.map(event => {
    const formattedDate = event.date_formatted || formatDateGerman(event.date);
    const badge = event.badge || 'Live-Event';

    return `
      <article class="event-card" id="${event.id}">
        <div class="event-img-wrap lightbox-trigger" data-src="${event.image || 'assets/images/biergarten_sommer.jpg'}" data-caption="${escapeHtml(event.title)} – ${escapeHtml(formattedDate)}" style="cursor:pointer;">
          <img src="${event.image || 'assets/images/events/event_maascheisser.jpg'}" alt="${escapeHtml(event.title)}" class="event-img" loading="lazy" />
          <span class="event-badge"><i class="fa-solid fa-music"></i> ${escapeHtml(badge)}</span>
        </div>
        <div class="event-body">
          <div class="event-date-row">
            <span class="event-date-pill"><i class="fa-solid fa-calendar-day"></i> ${escapeHtml(formattedDate)}</span>
            <span class="event-time-pill"><i class="fa-solid fa-clock"></i> ${escapeHtml(event.time || '')}</span>
          </div>
          <h3 class="event-title">${escapeHtml(event.title)}</h3>
          <p class="event-desc">${escapeHtml(event.description)}</p>
          <div class="event-footer">
            <span class="event-entry-tag"><i class="fa-solid fa-ticket"></i> Eintritt frei</span>
            <span class="event-location-tag"><i class="fa-solid fa-location-dot"></i> Biergarten-Bühne</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function formatDateGerman(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return `${weekdays[dateObj.getDay()]}, ${d}.${m}.${y}`;
  }
  return dateStr;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


