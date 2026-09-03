/**
 * gallery.js - Dynamic Gallery Renderer for fotos.html
 * Fetches and displays photos from KellerStore, handles category filtering and integrates with Lightbox
 */

class KellerGalleryRenderer {
  constructor() {
    this.currentFilter = 'all';
    this.container = null;
    this.filterNav = null;
  }

  init() {
    this.container = document.getElementById('gallery-container');
    this.filterNav = document.getElementById('gallery-filter-buttons');

    if (!this.container) return;

    // Subscribe to store updates
    if (window.kellerStore) {
      window.kellerStore.subscribe(() => {
        this.render();
      });
    }

    this.render();
  }

  render() {
    const galleryData = window.kellerStore ? window.kellerStore.getGallery() : null;
    if (!galleryData || !galleryData.items) {
      if (this.container) {
        this.container.innerHTML = '<div style="text-align:center; padding:3rem; grid-column: 1/-1;"><p>Fotos werden geladen...</p></div>';
      }
      return;
    }

    this.renderFilterTabs(galleryData);
    this.renderImages(galleryData);
  }

  renderFilterTabs(galleryData) {
    if (!this.filterNav) return;
    const categories = galleryData.categories || [];
    const allActiveItems = galleryData.items.filter(i => i.active !== false);

    let html = `
      <button class="cat-tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
        <i class="fa-solid fa-border-all"></i> Alle Fotos
        <span class="cat-badge">${allActiveItems.length}</span>
      </button>
    `;

    categories.forEach(cat => {
      const count = allActiveItems.filter(i => i.category === cat.id).length;
      if (count > 0) {
        html += `
          <button class="cat-tab ${this.currentFilter === cat.id ? 'active' : ''}" data-filter="${cat.id}">
            <i class="fa-solid ${cat.icon || 'fa-image'}"></i> ${cat.name}
            <span class="cat-badge">${count}</span>
          </button>
        `;
      }
    });

    this.filterNav.innerHTML = html;

    // Attach click events to tabs
    this.filterNav.querySelectorAll('.cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterNav.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-filter');
        this.renderImages(galleryData);
      });
    });
  }

  renderImages(galleryData) {
    if (!this.container) return;
    let items = galleryData.items.filter(i => i.active !== false);

    if (this.currentFilter !== 'all') {
      items = items.filter(i => i.category === this.currentFilter);
    }

    if (items.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:3rem; background:var(--white); border-radius:var(--radius-xl); box-shadow:var(--shadow-sm);">
          <i class="fa-solid fa-camera fa-2x" style="color:var(--slate-400); margin-bottom:1rem;"></i>
          <h3>Keine Fotos in dieser Kategorie</h3>
          <p style="color:var(--slate-600);">Wählen Sie einen anderen Filter aus.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = items.map(item => `
      <div class="gallery-item lightbox-trigger" data-category="${item.category}" data-src="${this.escape(item.src)}" data-caption="${this.escape(item.title)}">
        <img src="${this.escape(item.src)}" alt="${this.escape(item.title)}" class="gallery-img" loading="lazy" />
        <div class="gallery-overlay">
          <span class="gallery-caption-text">
            <i class="fa-solid fa-magnifying-glass-plus"></i> ${this.escape(item.title)}
          </span>
        </div>
      </div>
    `).join('');

    // Re-bind lightbox event handlers in main.js
    if (typeof initLightbox === 'function') {
      initLightbox();
    }
  }

  escape(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.kellerStore) {
    await window.kellerStore.init();
  }
  const gallery = new KellerGalleryRenderer();
  gallery.init();
});
