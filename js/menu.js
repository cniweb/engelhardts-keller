/**
 * menu.js - Public Menu Page Logic
 * Dynamically displays dishes, handles category filtering, and hides deactivated items
 */

class KellerMenuRenderer {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.container = null;
    this.categoryNav = null;
  }

  init() {
    this.container = document.getElementById('menu-items-grid');
    this.categoryNav = document.getElementById('menu-category-tabs');
    const searchInput = document.getElementById('menu-search');
    const searchClear = document.getElementById('menu-search-clear');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (!this.container) return;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (searchClear) {
          if (this.searchQuery) {
            searchClear.classList.remove('hidden');
          } else {
            searchClear.classList.add('hidden');
          }
        }
        this.render();
      });
    }

    if (searchClear && searchInput) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        searchClear.classList.add('hidden');
        searchInput.focus();
        this.render();
      });
    }

    // Floating Back to Top Button
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 280) {
          backToTopBtn.classList.add('show');
        } else {
          backToTopBtn.classList.remove('show');
        }
      }, { passive: true });

      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Support URL hash for direct QR-code links (e.g. #warme_speisen, #biere)
    const rawHash = window.location.hash.replace('#', '').replace('cat-', '');
    if (rawHash) {
      const menuData = window.kellerStore.getMenu();
      if (menuData?.categories?.some(c => c.id === rawHash)) {
        this.currentCategory = rawHash;
      }
    }

    // Subscribe to store updates (e.g. if updated via admin in another tab or same session)
    window.kellerStore.subscribe(() => {
      this.renderCategories();
      this.renderPizzaOvenNotice();
      this.renderMakrelenGrillNotice();
      this.render();
    });

    // Initial render
    this.renderPizzaOvenNotice();
    this.renderMakrelenGrillNotice();
    this.renderCategories();
    this.render();
  }

  renderPizzaOvenNotice() {
    const box = document.getElementById('pizza-oven-notice-box');
    if (!box) return;

    const settings = window.kellerStore.getSettings();
    const pizzaOven = settings?.pizza_oven || {
      active: false,
      notice_active: 'Heute ist unser Steinbackofen in Betrieb! Frische Steinofen-Pizza ab 16 Uhr.',
      notice_inactive: 'Unser Steinbackofen ist heute nicht in Betrieb (Steinofen-Pizza gibt es nur an bestimmten Tagen).'
    };

    if (pizzaOven.active) {
      box.innerHTML = `
        <div style="background:#ecfdf5; border:1px solid #10b981; border-radius:var(--radius-sm); padding:0.6rem 0.9rem; margin-top:0.4rem; display:flex; align-items:center; gap:0.6rem; color:#065f46; font-size:0.9rem;">
          <i class="fa-solid fa-fire-burner" style="color:#059669; font-size:1.1rem;"></i>
          <div>
            <strong style="color:#047857;">🔥 Steinbackofen heute in Betrieb:</strong>
            <span style="margin-left:0.35rem;">${this.escape(pizzaOven.notice_active || 'Heute frische Steinofen-Pizza aus unserem Ofen!')}</span>
          </div>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:var(--radius-sm); padding:0.6rem 0.9rem; margin-top:0.4rem; display:flex; align-items:center; gap:0.6rem; color:#475569; font-size:0.88rem;">
          <i class="fa-solid fa-circle-info" style="color:#64748b; font-size:1.05rem;"></i>
          <div>
            <strong>Hinweis zum Steinbackofen:</strong>
            <span style="margin-left:0.35rem;">${this.escape(pizzaOven.notice_inactive || 'Unser Steinbackofen ist heute nicht in Betrieb (Steinofen-Pizza bieten wir nur an bestimmten Tagen an).')}</span>
          </div>
        </div>
      `;
    }
  }

  renderMakrelenGrillNotice() {
    const box = document.getElementById('makrelen-grill-notice-box');
    if (!box) return;

    const settings = window.kellerStore.getSettings();
    const makrelen = settings?.makrelen_grill || {
      active: false,
      notice_active: '🐟 Heute frische Makrelen vom Holzkohlegrill (11,- €) – solange der Vorrat reicht!',
      notice_inactive: 'Gegrillte Makrelen gibt es an ausgewählten Aktionstagen im August.'
    };

    if (makrelen.active) {
      box.innerHTML = `
        <div style="background:#eff6ff; border:1px solid #3b82f6; border-radius:var(--radius-sm); padding:0.75rem 1rem; margin-top:0.6rem; display:flex; align-items:center; gap:0.9rem; color:#1e40af; font-size:0.92rem; flex-wrap:wrap;">
          <img src="assets/images/makrelen_grill.jpg" alt="Gegrillte Makrelen vom Holzkohlegrill" style="width:72px; height:52px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid #93c5fd;" />
          <div style="flex:1;">
            <strong style="color:#1d4ed8; display:block; margin-bottom:0.15rem;">🐟 Aktionstag: Frische Makrelen vom Holzkohlegrill (11,- €)</strong>
            <span>${this.escape(makrelen.notice_active || 'Heute frische Makrelen vom Holzkohlegrill!')}</span>
          </div>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); padding:0.5rem 0.9rem; margin-top:0.4rem; display:flex; align-items:center; gap:0.6rem; color:#64748b; font-size:0.86rem;">
          <i class="fa-solid fa-fish" style="color:#94a3b8; font-size:1rem;"></i>
          <div>
            <strong>Gegrillte Makrelen:</strong>
            <span style="margin-left:0.35rem;">${this.escape(makrelen.notice_inactive || 'Gegrillte Makrelen gibt es an ausgewählten Aktionstagen im August.')}</span>
          </div>
        </div>
      `;
    }
  }

  renderCategories() {
    if (!this.categoryNav) return;
    const menuData = window.kellerStore.getMenu();
    if (!menuData || !menuData.categories) return;

    let html = `
      <button class="cat-tab ${this.currentCategory === 'all' ? 'active' : ''}" data-cat="all">
        <i class="fa-solid fa-layer-group"></i> Alle Speisen & Getränke
      </button>
    `;

    menuData.categories.forEach(cat => {
      // count active items in category
      const activeCount = (menuData.items || []).filter(i => i.category === cat.id && i.active !== false).length;
      if (activeCount > 0) {
        html += `
          <button class="cat-tab ${this.currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
            <i class="fa-solid ${cat.icon || 'fa-utensils'}"></i> ${cat.name}
            <span class="cat-badge">${activeCount}</span>
          </button>
        `;
      }
    });

    this.categoryNav.innerHTML = html;

    // Attach click events
    this.categoryNav.querySelectorAll('.cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.categoryNav.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-cat');
        // Scroll active tab into view in horizontal scroller
        try {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } catch (e) {}
        this.render();
      });
    });
  }

  render() {
    if (!this.container) return;
    const menuData = window.kellerStore.getMenu();
    if (!menuData || !menuData.items) {
      this.container.innerHTML = '<div class="menu-empty"><p>Speisekarte wird geladen...</p></div>';
      return;
    }

    // Filter items: ONLY show items where active !== false
    let items = menuData.items.filter(item => item.active !== false);

    // Filter by Category
    if (this.currentCategory !== 'all') {
      items = items.filter(item => item.category === this.currentCategory);
    }

    // Filter by Search
    if (this.searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(this.searchQuery) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(this.searchQuery)))
      );
    }

    if (items.length === 0) {
      this.container.innerHTML = `
        <div class="menu-empty-state">
          <i class="fa-solid fa-mug-hot"></i>
          <h3>Keine Gerichte gefunden</h3>
          <p>Für diese Auswahl sind aktuell keine Speisen verfügbar oder entsprechen nicht Ihrer Suche.</p>
        </div>
      `;
      return;
    }

    // Group items by category if "all" is selected
    if (this.currentCategory === 'all' && !this.searchQuery) {
      let groupedHtml = '';
      menuData.categories.forEach(cat => {
        const catItems = items.filter(i => i.category === cat.id);
        if (catItems.length > 0) {
          groupedHtml += `
            <section class="menu-category-section" id="cat-${cat.id}">
              <div class="category-header">
                <div class="category-title">
                  <i class="fa-solid ${cat.icon || 'fa-utensils'}"></i>
                  <h2>${cat.name}</h2>
                </div>
                ${cat.desc ? `<p class="category-subtitle">${cat.desc}</p>` : ''}
              </div>
              <div class="menu-grid">
                ${catItems.map(item => this.renderItemCard(item)).join('')}
              </div>
            </section>
          `;
        }
      });
      this.container.innerHTML = groupedHtml;
    } else {
      this.container.innerHTML = `
        <div class="menu-grid">
          ${items.map(item => this.renderItemCard(item)).join('')}
        </div>
      `;
    }
  }

  renderItemCard(item) {
    const formattedPrice = Number(item.price).toFixed(2).replace('.', ',') + ' €';
    const tagBadges = (item.tags || []).map(t => {
      let tagClass = 'tag-default';
      let icon = '';
      if (t.includes('vegetarisch')) { tagClass = 'tag-veg'; icon = '<i class="fa-solid fa-seedling"></i>'; }
      if (t.includes('vegan')) { tagClass = 'tag-vegan'; icon = '<i class="fa-solid fa-leaf"></i>'; }
      if (t.includes('scharf')) { tagClass = 'tag-spicy'; icon = '<i class="fa-solid fa-pepper-hot"></i>'; }
      if (t.includes('steinofen')) { tagClass = 'tag-pizza'; icon = '<i class="fa-solid fa-fire"></i>'; }
      if (t.includes('fisch') || t.includes('holzkohlegrill') || t.includes('august')) { tagClass = 'tag-highlight'; icon = '<i class="fa-solid fa-fish"></i>'; }
      if (t.includes('hausgemacht') || t.includes('exklusiv')) { tagClass = 'tag-highlight'; icon = '<i class="fa-solid fa-star"></i>'; }
      
      const niceLabel = t.charAt(0).toUpperCase() + t.slice(1);
      return `<span class="dish-tag ${tagClass}">${icon} ${niceLabel}</span>`;
    }).join(' ');

    const isMakrele = item.id === 'item_makrele_grill';
    const photoThumb = isMakrele
      ? `<div style="margin-bottom:0.85rem; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--slate-200); box-shadow:var(--shadow-sm);">
           <img src="assets/images/makrelen_grill.jpg" alt="Gegrillte Makrele vom Holzkohlegrill" style="width:100%; max-height:160px; object-fit:cover; display:block;" />
         </div>`
      : '';

    return `
      <article class="dish-card ${isMakrele ? 'dish-card-featured' : ''}" id="dish-${item.id}">
        ${photoThumb}
        <div class="dish-header">
          <h3 class="dish-name">${this.escape(item.name)}</h3>
          <span class="dish-price">${formattedPrice}</span>
        </div>
        ${item.description ? `<p class="dish-desc">${this.escape(item.description)}</p>` : ''}
        ${tagBadges ? `<div class="dish-tags">${tagBadges}</div>` : ''}
      </article>
    `;
  }

  escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await window.kellerStore.init();
  const renderer = new KellerMenuRenderer();
  renderer.init();
});
