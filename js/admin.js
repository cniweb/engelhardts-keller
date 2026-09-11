/**
 * admin.js - Admin Dashboard Logic for Engelhardt's Keller
 * Manages 5 status options, announcement banner, and menu item CRUD/availability toggles
 */

class KellerAdminDashboard {
  constructor() {
    this.editModal = null;
    this.photoModal = null;
    this.activeCategoryFilter = 'all';
    this.searchQuery = '';
    this.galleryCatFilter = 'all';
    this.gallerySearch = '';
  }

  async init() {
    await window.kellerStore.init();
    await window.kellerWeather.fetchWeather();

    this.setupAuth();
    if (window.kellerStore.isAuthenticated()) {
      this.renderDashboard();
    }
  }

  setupAuth() {
    const authOverlay = document.getElementById('admin-auth-overlay');
    const authForm = document.getElementById('admin-auth-form');
    const pinInput = document.getElementById('admin-pin-input');
    const pinError = document.getElementById('admin-pin-error');
    const logoutBtn = document.getElementById('admin-logout-btn');

    if (!authOverlay) return;

    if (window.kellerStore.isAuthenticated()) {
      authOverlay.classList.add('hidden');
    } else {
      authOverlay.classList.remove('hidden');
    }

    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPin = pinInput.value.trim();
        if (window.kellerStore.login(enteredPin)) {
          pinError.classList.add('hidden');
          authOverlay.classList.add('hidden');
          this.renderDashboard();
          this.showToast('Erfolgreich angemeldet!', 'success');
        } else {
          pinError.classList.remove('hidden');
          pinInput.value = '';
          pinInput.focus();
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.kellerStore.logout();
        authOverlay.classList.remove('hidden');
        pinInput.value = '';
        this.showToast('Abgemeldet', 'info');
      });
    }
  }

  resolveAssetPath(src) {
    if (!src) return '';
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('../') || src.startsWith('/')) {
      return src;
    }
    const isSubdir = window.location.pathname.includes('/admin/') || 
                     window.location.pathname.endsWith('/admin') || 
                     window.location.pathname.includes('\\admin\\') ||
                     window.location.pathname.endsWith('\\admin');
    return isSubdir ? '../' + src : src;
  }

  renderDashboard() {
    if (document.getElementById('save-status-btn') || document.querySelector('input[name="biergarten_status"]')) {
      this.renderStatusControls();
    }
    if (document.getElementById('save-announcement-btn')) {
      this.renderAnnouncementControls();
    }
    if (document.getElementById('admin-pizza-oven-toggle')) {
      this.renderPizzaOvenControls();
    }
    if (document.getElementById('admin-makrelen-grill-toggle')) {
      this.renderMakrelenGrillControls();
    }
    if (document.getElementById('admin-menu-list')) {
      this.renderMenuItems();
      this.setupModals();
    }
    if (document.getElementById('admin-gallery-list')) {
      this.renderGalleryItems();
      this.setupPhotoModal();
    }
    if (document.getElementById('admin-events-list')) {
      this.renderEventsItems();
      this.setupEventModal();
    }
    if (document.getElementById('export-menu-json-btn')) {
      this.setupJsonExportImport();
    }
  }

  // --- 1. Status Management (5 Options) ---
  renderStatusControls() {
    const settings = window.kellerStore.getSettings();
    const currentStatus = settings?.biergarten_status || 'vom_wetter_abhaengig';
    const currentReason = settings?.status_override_reason || '';

    const statusRadios = document.querySelectorAll('input[name="biergarten_status"]');
    statusRadios.forEach(radio => {
      radio.checked = radio.value === currentStatus;
      radio.addEventListener('change', () => {
        this.updateStatusPreview(radio.value, document.getElementById('status-reason-input')?.value);
      });
    });

    const reasonInput = document.getElementById('status-reason-input');
    if (reasonInput) {
      reasonInput.value = currentReason;
      reasonInput.addEventListener('input', () => {
        const selected = document.querySelector('input[name="biergarten_status"]:checked')?.value || currentStatus;
        this.updateStatusPreview(selected, reasonInput.value);
      });
    }

    const saveBtn = document.getElementById('save-status-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="biergarten_status"]:checked');
        if (!selectedRadio) return;

        const newStatus = selectedRadio.value;
        const newReason = reasonInput ? reasonInput.value.trim() : '';

        window.kellerStore.saveSettings({
          biergarten_status: newStatus,
          status_override_reason: newReason
        });

        this.showToast('Biergarten-Status erfolgreich aktualisiert!', 'success');
        this.updateStatusPreview(newStatus, newReason);
      });
    }

    this.updateStatusPreview(currentStatus, currentReason);
  }

  updateStatusPreview(statusValue, reasonValue) {
    const previewContainer = document.getElementById('admin-status-preview');
    if (!previewContainer) return;

    // Simulate status with temp settings
    const tempSettings = {
      biergarten_status: statusValue,
      status_override_reason: reasonValue
    };
    const calc = window.kellerWeather.calculateStatus(tempSettings);

    previewContainer.innerHTML = `
      <div class="status-preview-box preview-${calc.badgeType}">
        <div class="preview-badge-row">
          <span class="preview-badge badge-${calc.badgeType}">
            <i class="fa-solid fa-circle-dot"></i> ${calc.badgeText}
          </span>
          <span class="preview-mode-tag">${statusValue === 'vom_wetter_abhaengig' ? '⚡ Wetter-Automatik Ebensfeld' : '🔒 Manuelle Überschreibung'}</span>
        </div>
        <h4 class="preview-title">${calc.title}</h4>
        <p class="preview-desc">${calc.subtitle}</p>
        <div class="preview-meta">
          <small><i class="fa-solid fa-circle-info"></i> ${calc.reason}</small>
        </div>
      </div>
    `;
  }

  // --- 2. Announcement Banner Management ---
  renderAnnouncementControls() {
    const settings = window.kellerStore.getSettings();
    const ann = settings?.announcement || { active: false, text: '', badge: 'Aktuelles' };

    const activeCheckbox = document.getElementById('announcement-active');
    const textInput = document.getElementById('announcement-text');
    const badgeInput = document.getElementById('announcement-badge');
    const saveBtn = document.getElementById('save-announcement-btn');

    if (activeCheckbox) activeCheckbox.checked = ann.active !== false;
    if (textInput) textInput.value = ann.text || '';
    if (badgeInput) badgeInput.value = ann.badge || 'Aktuelles';

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        window.kellerStore.saveSettings({
          announcement: {
            active: activeCheckbox ? activeCheckbox.checked : true,
            text: textInput ? textInput.value.trim() : '',
            badge: badgeInput ? badgeInput.value.trim() : 'Aktuelles'
          }
        });
        this.showToast('Ankündigung erfolgreich gespeichert!', 'success');
      });
    }
  }

  // --- 2b. Pizza-Ofen Steuerung ---
  renderPizzaOvenControls() {
    const settings = window.kellerStore.getSettings();
    const pizzaSettings = settings?.pizza_oven || {
      active: false,
      notice_active: 'Heute ist unser Steinbackofen in Betrieb! Frische Steinofen-Pizza ab 16 Uhr.',
      notice_inactive: 'Unser Steinbackofen ist heute nicht in Betrieb (Steinofen-Pizza gibt es nur an bestimmten Tagen).'
    };

    const toggle = document.getElementById('admin-pizza-oven-toggle');
    const badge = document.getElementById('admin-pizza-status-badge');
    const summary = document.getElementById('admin-pizza-status-summary');
    const activeInput = document.getElementById('pizza-notice-active-input');
    const inactiveInput = document.getElementById('pizza-notice-inactive-input');
    const syncCheckbox = document.getElementById('sync-pizza-dishes-checkbox');
    const saveBtn = document.getElementById('save-pizza-oven-btn');

    if (activeInput) activeInput.value = pizzaSettings.notice_active || '';
    if (inactiveInput) inactiveInput.value = pizzaSettings.notice_inactive || '';

    const updateDisplay = (isActive) => {
      if (toggle) toggle.checked = isActive;
      if (badge) {
        if (isActive) {
          badge.className = 'cat-badge';
          badge.style.background = 'var(--color-open-border)';
          badge.style.color = '#fff';
          badge.innerHTML = '<i class="fa-solid fa-fire"></i> Ofen ist AN';
        } else {
          badge.className = 'cat-badge';
          badge.style.background = 'var(--slate-400)';
          badge.style.color = '#fff';
          badge.innerHTML = '<i class="fa-solid fa-power-off"></i> Ofen ist AUS';
        }
      }
      if (summary) {
        summary.textContent = isActive
          ? 'Steinbackofen ist aktiv. Pizzen werden auf der Speisekarte angeboten.'
          : 'Steinbackofen ist aus. Pizzen sind auf der Speisekarte deaktiviert.';
      }
    };

    updateDisplay(pizzaSettings.active);

    if (toggle) {
      toggle.addEventListener('change', () => {
        updateDisplay(toggle.checked);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const isOvenActive = toggle ? toggle.checked : false;
        const nActive = activeInput ? activeInput.value.trim() : '';
        const nInactive = inactiveInput ? inactiveInput.value.trim() : '';
        const syncDishes = syncCheckbox ? syncCheckbox.checked : true;

        window.kellerStore.setPizzaOven(isOvenActive, nActive, nInactive);
        if (syncDishes) {
          window.kellerStore.toggleAllPizzaDishes(isOvenActive);
          this.renderMenuItems(); // refresh menu list in admin view
        }

        this.showToast(`Pizza-Ofen Status gespeichert (${isOvenActive ? 'AN' : 'AUS'})!`, 'success');
      });
    }
  }

  // --- 2c. Gegrillte Makrelen Steuerung ---
  renderMakrelenGrillControls() {
    const settings = window.kellerStore.getSettings();
    const makrelenSettings = settings?.makrelen_grill || {
      active: false,
      notice_active: '🐟 Heute frische Makrelen vom Holzkohlegrill (11,- €) – solange der Vorrat reicht!',
      notice_inactive: 'Gegrillte Makrelen gibt es an ausgewählten Aktionstagen im August.'
    };

    const toggle = document.getElementById('admin-makrelen-grill-toggle');
    const badge = document.getElementById('admin-makrelen-status-badge');
    const summary = document.getElementById('admin-makrelen-status-summary');
    const activeInput = document.getElementById('makrelen-notice-active-input');
    const inactiveInput = document.getElementById('makrelen-notice-inactive-input');
    const syncCheckbox = document.getElementById('sync-makrelen-dish-checkbox');
    const saveBtn = document.getElementById('save-makrelen-grill-btn');

    if (activeInput) activeInput.value = makrelenSettings.notice_active || '';
    if (inactiveInput) inactiveInput.value = makrelenSettings.notice_inactive || '';

    const updateDisplay = (isActive) => {
      if (toggle) toggle.checked = isActive;
      if (badge) {
        if (isActive) {
          badge.className = 'cat-badge';
          badge.style.background = 'var(--color-open-border)';
          badge.style.color = '#fff';
          badge.innerHTML = '<i class="fa-solid fa-fish"></i> Fischgrill ist AN';
        } else {
          badge.className = 'cat-badge';
          badge.style.background = 'var(--slate-400)';
          badge.style.color = '#fff';
          badge.innerHTML = '<i class="fa-solid fa-power-off"></i> Grill ist AUS';
        }
      }
      if (summary) {
        summary.textContent = isActive
          ? 'Fischgrill ist aktiv. Makrelen (11,- €) werden auf der Speisekarte angeboten.'
          : 'Fischgrill ist aus. Makrelen sind auf der Speisekarte deaktiviert.';
      }
    };

    updateDisplay(makrelenSettings.active);

    if (toggle) {
      toggle.addEventListener('change', () => {
        updateDisplay(toggle.checked);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const isGrillActive = toggle ? toggle.checked : false;
        const nActive = activeInput ? activeInput.value.trim() : '';
        const nInactive = inactiveInput ? inactiveInput.value.trim() : '';
        const syncDish = syncCheckbox ? syncCheckbox.checked : true;

        window.kellerStore.setMakrelenGrill(isGrillActive, nActive, nInactive);
        if (syncDish) {
          window.kellerStore.toggleMakrelenDish(isGrillActive);
          this.renderMenuItems(); // refresh menu list in admin view
        }

        this.showToast(`Makrelengrill-Status gespeichert (${isGrillActive ? 'AN' : 'AUS'})!`, 'success');
      });
    }
  }

  // --- 3. Speisekarten-Verwaltung (CRUD + Active Toggle) ---
  renderMenuItems() {
    const listContainer = document.getElementById('admin-menu-list');
    const statsContainer = document.getElementById('admin-menu-stats');
    if (!listContainer) return;

    const menuData = window.kellerStore.getMenu();
    if (!menuData || !menuData.items) {
      listContainer.innerHTML = '<p>Keine Speisen vorhanden.</p>';
      return;
    }

    // Stats
    const totalCount = menuData.items.length;
    const activeCount = menuData.items.filter(i => i.active !== false).length;
    const deactivatedCount = totalCount - activeCount;

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-pill stat-total"><i class="fa-solid fa-list"></i> Gesamt: <strong>${totalCount}</strong></div>
        <div class="stat-pill stat-active"><i class="fa-solid fa-check"></i> Aktiv: <strong>${activeCount}</strong></div>
        <div class="stat-pill stat-inactive"><i class="fa-solid fa-ban"></i> Deaktiviert / Ausverkauft: <strong>${deactivatedCount}</strong></div>
      `;
    }

    // Category Filter Dropdown / Tabs
    this.renderCategoryFilter(menuData.categories);

    // Filter Items
    let items = menuData.items;
    if (this.activeCategoryFilter !== 'all') {
      items = items.filter(i => i.category === this.activeCategoryFilter);
    }
    if (this.searchQuery) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(this.searchQuery) ||
        (i.description && i.description.toLowerCase().includes(this.searchQuery))
      );
    }

    if (items.length === 0) {
      listContainer.innerHTML = '<div class="admin-empty"><p>Keine Gerichte für diesen Filter gefunden.</p></div>';
      return;
    }

    listContainer.innerHTML = items.map(item => {
      const isAvailable = item.active !== false;
      const catObj = (menuData.categories || []).find(c => c.id === item.category);
      const catName = catObj ? catObj.name : item.category;
      const priceStr = Number(item.price).toFixed(2).replace('.', ',') + ' €';

      return `
        <div class="admin-item-row ${isAvailable ? '' : 'item-row-deactivated'}" id="admin-row-${item.id}">
          <div class="item-status-switch">
            <label class="toggle-switch" title="${isAvailable ? 'Aktiv (Wird auf Website angezeigt)' : 'Deaktiviert (Auf Website ausgeblendet)'}">
              <input type="checkbox" class="toggle-item-btn" data-id="${item.id}" ${isAvailable ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <span class="status-label ${isAvailable ? 'text-success' : 'text-danger'}">
              ${isAvailable ? 'Aktiv' : 'Deaktiviert'}
            </span>
          </div>

          <div class="item-info">
            <div class="item-title-row">
              <strong class="item-name">${this.escape(item.name)}</strong>
              <span class="item-category-tag">${catName}</span>
              <span class="item-price-tag">${priceStr}</span>
            </div>
            ${item.description ? `<p class="item-desc-text">${this.escape(item.description)}</p>` : ''}
            ${item.tags && item.tags.length ? `
              <div class="item-tags-row">
                ${item.tags.map(t => `<span class="mini-tag">${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <div class="item-actions">
            <button class="btn btn-sm btn-outline edit-item-btn" data-id="${item.id}" title="Gericht bearbeiten">
              <i class="fa-solid fa-pen-to-square"></i> Bearbeiten
            </button>
            <button class="btn btn-sm btn-danger-outline delete-item-btn" data-id="${item.id}" title="Gericht löschen">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Toggle Listeners
    listContainer.querySelectorAll('.toggle-item-btn').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = chk.getAttribute('data-id');
        const newState = chk.checked;
        window.kellerStore.toggleItemActive(id, newState);
        this.renderMenuItems();
        this.showToast(newState ? 'Gericht wieder auf Speisekarte aktiviert' : 'Gericht deaktiviert (ausgeblendet)', newState ? 'success' : 'info');
      });
    });

    // Attach Edit Listeners
    listContainer.querySelectorAll('.edit-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openEditModal(id);
      });
    });

    // Attach Delete Listeners
    listContainer.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = menuData.items.find(i => i.id === id);
        if (confirm(`Möchten Sie das Gericht "${item?.name || 'Ausgewähltes Gericht'}" wirklich löschen?`)) {
          window.kellerStore.deleteItem(id);
          this.renderMenuItems();
          this.showToast('Gericht gelöscht', 'warning');
        }
      });
    });
  }

  renderCategoryFilter(categories) {
    const filterContainer = document.getElementById('admin-cat-filter');
    if (!filterContainer) return;

    let html = `<option value="all" ${this.activeCategoryFilter === 'all' ? 'selected' : ''}>Alle Kategorien</option>`;
    categories.forEach(cat => {
      html += `<option value="${cat.id}" ${this.activeCategoryFilter === cat.id ? 'selected' : ''}>${cat.name}</option>`;
    });

    filterContainer.innerHTML = html;
    filterContainer.onchange = (e) => {
      this.activeCategoryFilter = e.target.value;
      this.renderMenuItems();
    };

    const searchInput = document.getElementById('admin-menu-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderMenuItems();
      };
    }
  }

  // --- 4. Modals (Add / Edit Dish) ---
  setupModals() {
    const modal = document.getElementById('dish-modal');
    const form = document.getElementById('dish-modal-form');
    const closeBtn = document.getElementById('close-dish-modal');
    const cancelBtn = document.getElementById('cancel-dish-modal');
    const addBtn = document.getElementById('add-dish-btn');

    if (!modal) return;

    const closeModal = () => modal.classList.add('hidden');

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    if (addBtn) {
      addBtn.onclick = () => {
        this.openCreateModal();
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('modal-dish-id').value;
        const name = document.getElementById('modal-dish-name').value.trim();
        const category = document.getElementById('modal-dish-category').value;
        const price = parseFloat(document.getElementById('modal-dish-price').value) || 0;
        const description = document.getElementById('modal-dish-desc').value.trim();
        const active = document.getElementById('modal-dish-active').checked;
        const tagsStr = document.getElementById('modal-dish-tags').value;
        const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

        if (!name) {
          alert('Bitte geben Sie einen Namen für das Gericht ein.');
          return;
        }

        if (id) {
          // Update
          window.kellerStore.updateItem(id, {
            name, category, price, description, active, tags
          });
          this.showToast('Gericht erfolgreich aktualisiert!', 'success');
        } else {
          // Add new
          window.kellerStore.addItem({
            name, category, price, description, active, tags
          });
          this.showToast('Neues Gericht angelegt!', 'success');
        }

        closeModal();
        this.renderMenuItems();
      };
    }
  }

  openCreateModal() {
    const modal = document.getElementById('dish-modal');
    const title = document.getElementById('dish-modal-title');
    const menuData = window.kellerStore.getMenu();

    document.getElementById('modal-dish-id').value = '';
    document.getElementById('modal-dish-name').value = '';
    document.getElementById('modal-dish-price').value = '9.50';
    document.getElementById('modal-dish-desc').value = '';
    document.getElementById('modal-dish-active').checked = true;
    document.getElementById('modal-dish-tags').value = 'hausgemacht, regional';

    const catSelect = document.getElementById('modal-dish-category');
    catSelect.innerHTML = (menuData.categories || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    title.textContent = 'Neues Gericht anlegen';
    modal.classList.remove('hidden');
    document.getElementById('modal-dish-name').focus();
  }

  openEditModal(id) {
    const modal = document.getElementById('dish-modal');
    const title = document.getElementById('dish-modal-title');
    const menuData = window.kellerStore.getMenu();
    const item = (menuData.items || []).find(i => i.id === id);

    if (!item) return;

    document.getElementById('modal-dish-id').value = item.id;
    document.getElementById('modal-dish-name').value = item.name;
    document.getElementById('modal-dish-price').value = item.price;
    document.getElementById('modal-dish-desc').value = item.description || '';
    document.getElementById('modal-dish-active').checked = item.active !== false;
    document.getElementById('modal-dish-tags').value = (item.tags || []).join(', ');

    const catSelect = document.getElementById('modal-dish-category');
    catSelect.innerHTML = (menuData.categories || []).map(c => `
      <option value="${c.id}" ${c.id === item.category ? 'selected' : ''}>${c.name}</option>
    `).join('');

    title.textContent = 'Gericht bearbeiten';
    modal.classList.remove('hidden');
    document.getElementById('modal-dish-name').focus();
  }

  // --- 4. Fotogalerie-Verwaltung (CRUD, Upload, Kategorie-Zuweisung, Löschen) ---
  renderGalleryItems() {
    const listContainer = document.getElementById('admin-gallery-list');
    const statsContainer = document.getElementById('admin-gallery-stats');
    const catSelect = document.getElementById('admin-gallery-cat-filter');
    const searchInput = document.getElementById('admin-gallery-search');
    if (!listContainer) return;

    const galleryData = window.kellerStore.getGallery();
    if (!galleryData || !galleryData.items) {
      listContainer.innerHTML = '<p>Keine Fotos vorhanden.</p>';
      return;
    }

    const categories = galleryData.categories || [];
    const items = galleryData.items || [];

    // Populate category filter dropdown
    if (catSelect) {
      catSelect.innerHTML = `
        <option value="all" ${this.galleryCatFilter === 'all' ? 'selected' : ''}>Alle Kategorien (${items.length})</option>
        ${categories.map(c => {
          const count = items.filter(i => i.category === c.id).length;
          return `<option value="${c.id}" ${this.galleryCatFilter === c.id ? 'selected' : ''}>${c.name} (${count})</option>`;
        }).join('')}
      `;
      catSelect.onchange = (e) => {
        this.galleryCatFilter = e.target.value;
        this.renderGalleryItems();
      };
    }

    // Setup search listener
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', (e) => {
        this.gallerySearch = e.target.value.toLowerCase().trim();
        this.renderGalleryItems();
      });
    }

    // Stats
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-pill stat-total"><i class="fa-solid fa-camera"></i> Gesamt: <strong>${items.length}</strong></div>
        ${categories.map(c => {
          const count = items.filter(i => i.category === c.id).length;
          return `<div class="stat-pill"><i class="fa-solid ${c.icon || 'fa-image'}"></i> ${c.name}: <strong>${count}</strong></div>`;
        }).join('')}
      `;
    }

    // Filter items
    let filtered = items;
    if (this.galleryCatFilter !== 'all') {
      filtered = filtered.filter(i => i.category === this.galleryCatFilter);
    }
    if (this.gallerySearch) {
      filtered = filtered.filter(i => i.title && i.title.toLowerCase().includes(this.gallerySearch));
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div style="grid-column: 1/-1; padding:2rem; text-align:center; color:var(--slate-500);"><p>Keine Fotos für diesen Filter gefunden.</p></div>';
      return;
    }

    listContainer.innerHTML = filtered.map(item => {
      const catObj = categories.find(c => c.id === item.category);
      const catName = catObj ? catObj.name : item.category;

      return `
        <div class="admin-photo-card" style="background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm); display:flex; flex-direction:column;">
          <div style="position:relative; width:100%; height:180px; background:var(--slate-100); overflow:hidden;">
            <img src="${this.escape(this.resolveAssetPath(item.src))}" alt="${this.escape(item.title)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy" />
            <span style="position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.65); color:#fff; font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:var(--radius-full); backdrop-filter:blur(4px);">
              ${this.escape(catName)}
            </span>
          </div>

          <div style="padding:1rem; flex:1; display:flex; flex-direction:column; justify-content:space-between; gap:0.75rem;">
            <div>
              <strong style="font-size:0.95rem; color:var(--slate-900); display:block; margin-bottom:0.4rem; line-height:1.3;">
                ${this.escape(item.title)}
              </strong>
              
              <!-- Quick Category Changer -->
              <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.8rem; color:var(--slate-500);">
                <label for="cat-select-${item.id}" style="margin:0;">Kategorie:</label>
                <select id="cat-select-${item.id}" class="form-control form-control-sm admin-change-photo-cat" data-id="${item.id}" style="font-size:0.8rem; padding:0.2rem 0.5rem; height:auto;">
                  ${categories.map(c => `
                    <option value="${c.id}" ${c.id === item.category ? 'selected' : ''}>${c.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.5rem; border-top:1px solid var(--slate-100); padding-top:0.6rem;">
              <button class="btn btn-sm btn-outline edit-photo-btn" data-id="${item.id}" title="Bearbeiten">
                <i class="fa-solid fa-pen"></i> Bearbeiten
              </button>
              <button class="btn btn-sm btn-danger-outline delete-photo-btn" data-id="${item.id}" title="Löschen">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach inline category change listeners
    listContainer.querySelectorAll('.admin-change-photo-cat').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-id');
        const newCat = sel.value;
        window.kellerStore.updateGalleryImage(id, { category: newCat });
        this.renderGalleryItems();
        this.showToast('Kategorie des Fotos aktualisiert!', 'success');
      });
    });

    // Attach Edit listeners
    listContainer.querySelectorAll('.edit-photo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openEditPhotoModal(btn.getAttribute('data-id'));
      });
    });

    // Attach Delete listeners
    listContainer.querySelectorAll('.delete-photo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const galleryData = window.kellerStore.getGallery();
        const item = (galleryData.items || []).find(i => i.id === id);
        const name = item ? item.title : 'dieses Foto';
        if (confirm(`Möchten Sie „${name}“ wirklich aus der Galerie löschen?`)) {
          window.kellerStore.deleteGalleryImage(id);
          this.renderGalleryItems();
          this.showToast('Foto erfolgreich gelöscht!', 'info');
        }
      });
    });
  }

  setupPhotoModal() {
    const modal = document.getElementById('photo-modal');
    const closeBtn = document.getElementById('close-photo-modal');
    const cancelBtn = document.getElementById('cancel-photo-modal');
    const addBtn = document.getElementById('add-photo-btn');
    const form = document.getElementById('photo-modal-form');
    const fileInput = document.getElementById('modal-photo-file');
    const srcInput = document.getElementById('modal-photo-src');
    const previewBox = document.getElementById('modal-photo-preview');

    if (!modal) return;

    const closeModal = () => {
      modal.classList.add('hidden');
      if (form) form.reset();
      if (previewBox) previewBox.innerHTML = '<span style="color:var(--slate-500); font-size:0.9rem;">Kein Bild ausgewählt</span>';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.onclick = closeModal;

    if (addBtn) {
      addBtn.onclick = () => {
        this.openAddPhotoModal();
      };
    }

    // Live preview on file upload
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          if (srcInput) srcInput.value = dataUrl;
          if (previewBox) {
            previewBox.innerHTML = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:cover;" />`;
          }
        };
        reader.readAsDataURL(file);
      };
    }

    // Live preview on text input
    if (srcInput) {
      srcInput.oninput = (e) => {
        const url = e.target.value.trim();
        if (previewBox) {
          if (url) {
            previewBox.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/biergarten.jpg'" />`;
          } else {
            previewBox.innerHTML = '<span style="color:var(--slate-500); font-size:0.9rem;">Kein Bild ausgewählt</span>';
          }
        }
      };
    }

    // Form submit
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('modal-photo-id').value;
        const title = document.getElementById('modal-photo-title').value.trim();
        const category = document.getElementById('modal-photo-category').value;
        let src = srcInput ? srcInput.value.trim() : '';

        if (!src) {
          alert('Bitte wählen Sie eine Bilddatei aus oder geben Sie einen Bildpfad/URL an.');
          return;
        }

        if (id) {
          // Update
          window.kellerStore.updateGalleryImage(id, { title, category, src });
          this.showToast('Foto erfolgreich aktualisiert!', 'success');
        } else {
          // Add new
          window.kellerStore.addGalleryImage({ title, category, src, active: true });
          this.showToast('Neues Foto zur Galerie hinzugefügt!', 'success');
        }

        closeModal();
        this.renderGalleryItems();
      };
    }
  }

  openAddPhotoModal() {
    const modal = document.getElementById('photo-modal');
    const titleEl = document.getElementById('photo-modal-title');
    const catSelect = document.getElementById('modal-photo-category');
    const previewBox = document.getElementById('modal-photo-preview');
    const galleryData = window.kellerStore.getGallery();

    document.getElementById('modal-photo-id').value = '';
    document.getElementById('modal-photo-title').value = '';
    if (document.getElementById('modal-photo-src')) document.getElementById('modal-photo-src').value = '';
    if (document.getElementById('modal-photo-file')) document.getElementById('modal-photo-file').value = '';

    if (catSelect && galleryData?.categories) {
      catSelect.innerHTML = galleryData.categories.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    }

    if (titleEl) titleEl.textContent = 'Neues Foto hinzufügen';
    if (previewBox) previewBox.innerHTML = '<span style="color:var(--slate-500); font-size:0.9rem;">Kein Bild ausgewählt</span>';

    modal.classList.remove('hidden');
    document.getElementById('modal-photo-title').focus();
  }

  openEditPhotoModal(id) {
    const modal = document.getElementById('photo-modal');
    const titleEl = document.getElementById('photo-modal-title');
    const catSelect = document.getElementById('modal-photo-category');
    const previewBox = document.getElementById('modal-photo-preview');
    const galleryData = window.kellerStore.getGallery();
    const item = (galleryData.items || []).find(i => i.id === id);

    if (!item) return;

    document.getElementById('modal-photo-id').value = item.id;
    document.getElementById('modal-photo-title').value = item.title;
    document.getElementById('modal-photo-src').value = item.src;
    if (document.getElementById('modal-photo-file')) document.getElementById('modal-photo-file').value = '';

    if (catSelect && galleryData?.categories) {
      catSelect.innerHTML = galleryData.categories.map(c => `
        <option value="${c.id}" ${c.id === item.category ? 'selected' : ''}>${c.name}</option>
      `).join('');
    }

    if (previewBox) {
      previewBox.innerHTML = `<img src="${this.escape(this.resolveAssetPath(item.src))}" style="width:100%; height:100%; object-fit:cover;" />`;
    }

    if (titleEl) titleEl.textContent = 'Foto bearbeiten';
    modal.classList.remove('hidden');
    document.getElementById('modal-photo-title').focus();
  }

  // --- 4b. Live-Events Verwaltung ---
  renderEventsItems() {
    const listContainer = document.getElementById('admin-events-list');
    if (!listContainer) return;

    const events = window.kellerStore.getEvents();
    if (!events || events.length === 0) {
      listContainer.innerHTML = '<p style="color:var(--slate-500); padding:1rem; text-align:center;">Keine Events angelegt. Klicken Sie auf „Neues Event anlegen“.</p>';
      return;
    }

    listContainer.innerHTML = events.map(event => {
      const isActive = event.active !== false;
      const formattedDate = event.date_formatted || this.formatDateGerman(event.date);

      return `
        <div class="admin-event-card ${isActive ? '' : 'inactive'}" data-id="${event.id}">
          <img src="${this.resolveAssetPath(event.image || 'assets/images/events/event_maascheisser.jpg')}" alt="${this.escape(event.title)}" class="admin-event-thumb" />
          <div class="admin-event-info">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
              <span class="event-date-pill" style="font-size:0.78rem; padding:0.2rem 0.55rem;"><i class="fa-solid fa-calendar-day"></i> ${this.escape(formattedDate)}</span>
              <span class="event-time-pill" style="font-size:0.78rem; padding:0.2rem 0.55rem;"><i class="fa-solid fa-clock"></i> ${this.escape(event.time || '')}</span>
              <span class="cat-badge" style="font-size:0.75rem; background:var(--primary-100); color:var(--primary-800);">${this.escape(event.badge || 'Live-Event')}</span>
            </div>
            <h4 style="margin:0 0 0.35rem 0; font-size:1.15rem; color:var(--slate-900);">${this.escape(event.title)}</h4>
            <p style="margin:0; font-size:0.88rem; color:var(--slate-600); line-height:1.45;">${this.escape(event.description)}</p>
          </div>
          <div class="admin-event-actions">
            <label class="toggle-switch" title="${isActive ? 'Event aktiv (auf Startseite sichtbar)' : 'Event ausgeblendet'}">
              <input type="checkbox" class="toggle-event-active" data-id="${event.id}" ${isActive ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-sm btn-outline edit-event-btn" data-id="${event.id}" title="Event bearbeiten">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-danger-outline delete-event-btn" data-id="${event.id}" title="Event löschen">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wire toggle listeners
    listContainer.querySelectorAll('.toggle-event-active').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const active = e.target.checked;
        window.kellerStore.toggleEventActive(id, active);
        const card = e.target.closest('.admin-event-card');
        if (card) {
          card.classList.toggle('inactive', !active);
        }
        this.showToast(`Event "${id}" ${active ? 'aktiviert' : 'deaktiviert'}`, 'info');
      });
    });

    // Wire edit listeners
    listContainer.querySelectorAll('.edit-event-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditEventModal(id);
      });
    });

    // Wire delete listeners
    listContainer.querySelectorAll('.delete-event-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Möchten Sie dieses Event wirklich unwiderruflich löschen?')) {
          window.kellerStore.deleteEvent(id);
          this.renderEventsItems();
          this.showToast('Event erfolgreich gelöscht', 'info');
        }
      });
    });
  }

  setupEventModal() {
    const modal = document.getElementById('event-modal');
    const openBtn = document.getElementById('add-event-btn');
    const closeBtn = document.getElementById('close-event-modal');
    const cancelBtn = document.getElementById('cancel-event-modal');
    const form = document.getElementById('event-modal-form');
    const fileInput = document.getElementById('modal-event-file');
    const srcInput = document.getElementById('modal-event-src');
    const previewBox = document.getElementById('modal-event-preview');

    if (!modal) return;

    const closeModal = () => {
      modal.classList.add('hidden');
      form.reset();
      document.getElementById('modal-event-id').value = '';
      if (previewBox) previewBox.innerHTML = '<span style="color:var(--slate-500); font-size:0.9rem;">Kein Bild ausgewählt</span>';
    };

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        document.getElementById('modal-event-id').value = '';
        form.reset();
        document.getElementById('event-modal-heading').innerHTML = '<i class="fa-solid fa-guitar" style="color:var(--amber-500);"></i> Neues Event anlegen';
        if (previewBox) previewBox.innerHTML = '<span style="color:var(--slate-500); font-size:0.9rem;">Kein Bild ausgewählt</span>';
        modal.classList.remove('hidden');
        document.getElementById('modal-event-title').focus();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            srcInput.value = dataUrl;
            if (previewBox) {
              previewBox.innerHTML = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:cover;" />`;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (srcInput) {
      srcInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val && previewBox) {
          previewBox.innerHTML = `<img src="${this.escape(val)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\\'color:#ef4444;\\'>Bild konnte nicht geladen werden</span>'" />`;
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('modal-event-id').value;
        const title = document.getElementById('modal-event-title').value.trim();
        const date = document.getElementById('modal-event-date').value;
        const time = document.getElementById('modal-event-time').value.trim();
        const badge = document.getElementById('modal-event-badge').value.trim() || 'Live-Event';
        const description = document.getElementById('modal-event-desc').value.trim();
        const image = srcInput.value.trim() || 'assets/images/events/event_maascheisser.jpg';
        const date_formatted = this.formatDateGerman(date);

        if (id) {
          window.kellerStore.updateEvent(id, {
            title, date, time, badge, description, image, date_formatted
          });
          this.showToast('Event erfolgreich aktualisiert!', 'success');
        } else {
          window.kellerStore.addEvent({
            title, date, time, badge, description, image, date_formatted, active: true
          });
          this.showToast('Neues Event erfolgreich angelegt!', 'success');
        }

        closeModal();
        this.renderEventsItems();
      });
    }
  }

  openEditEventModal(id) {
    const modal = document.getElementById('event-modal');
    const previewBox = document.getElementById('modal-event-preview');
    const events = window.kellerStore.getEvents();
    const item = events.find(e => e.id === id);

    if (!item) return;

    document.getElementById('modal-event-id').value = item.id;
    document.getElementById('modal-event-title').value = item.title;
    document.getElementById('modal-event-date').value = item.date || '';
    document.getElementById('modal-event-time').value = item.time || '';
    document.getElementById('modal-event-badge').value = item.badge || '';
    document.getElementById('modal-event-desc').value = item.description || '';
    document.getElementById('modal-event-src').value = item.image || '';

    if (previewBox && item.image) {
      previewBox.innerHTML = `<img src="${this.escape(this.resolveAssetPath(item.image))}" style="width:100%; height:100%; object-fit:cover;" />`;
    }

    document.getElementById('event-modal-heading').innerHTML = '<i class="fa-solid fa-guitar" style="color:var(--amber-500);"></i> Event bearbeiten';
    modal.classList.remove('hidden');
    document.getElementById('modal-event-title').focus();
  }

  formatDateGerman(dateStr) {
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

  // --- 5. Export / Import / Reset ---
  setupJsonExportImport() {
    const exportBtn = document.getElementById('export-menu-json-btn');
    const importInput = document.getElementById('import-menu-json-input');
    const resetMenuBtn = document.getElementById('reset-menu-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    if (exportBtn) {
      exportBtn.onclick = () => {
        const menuData = window.kellerStore.getMenu();
        const jsonStr = JSON.stringify(menuData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `engelhardts_keller_speisekarte_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Speisekarte erfolgreich als JSON exportiert!', 'success');
      };
    }

    const exportGalleryBtn = document.getElementById('export-gallery-json-btn');
    if (exportGalleryBtn) {
      exportGalleryBtn.onclick = () => {
        const galleryData = window.kellerStore.getGallery();
        const jsonStr = JSON.stringify(galleryData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `engelhardts_keller_galerie_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Fotogalerie erfolgreich als JSON exportiert!', 'success');
      };
    }

    const exportEventsBtn = document.getElementById('export-events-json-btn');
    if (exportEventsBtn) {
      exportEventsBtn.onclick = () => {
        const eventsData = { events: window.kellerStore.getEvents() };
        const jsonStr = JSON.stringify(eventsData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `engelhardts_keller_events_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Events erfolgreich als JSON exportiert!', 'success');
      };
    }

    if (importInput) {
      importInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const imported = JSON.parse(ev.target.result);
            if (imported.events && Array.isArray(imported.events)) {
              window.kellerStore.saveEvents(imported);
              this.renderEventsItems();
              this.showToast('Events erfolgreich importiert!', 'success');
            } else if (imported.items && Array.isArray(imported.items)) {
              window.kellerStore.saveMenu(imported);
              this.renderMenuItems();
              this.showToast('Speisekarte erfolgreich importiert!', 'success');
            } else if (imported.categories && Array.isArray(imported.categories)) {
              window.kellerStore.saveGallery(imported);
              this.renderGalleryItems();
              this.showToast('Fotogalerie erfolgreich importiert!', 'success');
            } else {
              alert('Ungültiges Format: Das JSON muss ein "events"-, "items"- oder "categories"-Array enthalten.');
            }
          } catch (err) {
            alert('Fehler beim Einlesen der JSON-Datei: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
    }

    if (resetMenuBtn) {
      resetMenuBtn.onclick = async () => {
        if (confirm('Möchten Sie die Speisekarte wirklich auf die Standardkarte zurücksetzen? Eigene Änderungen gehen verloren.')) {
          await window.kellerStore.resetMenuToDefault();
          this.renderMenuItems();
          this.showToast('Speisekarte auf Werkszustand zurückgesetzt', 'info');
        }
      };
    }

    const resetGalleryBtn = document.getElementById('reset-gallery-btn');
    if (resetGalleryBtn) {
      resetGalleryBtn.onclick = async () => {
        if (confirm('Möchten Sie die Fotogalerie wirklich auf den Werkszustand zurücksetzen? Alle hinzugefügten Fotos oder Kategorie-Änderungen werden zurückgesetzt.')) {
          await window.kellerStore.resetGalleryToDefault();
          this.renderGalleryItems();
          this.showToast('Fotogalerie auf Werkszustand zurückgesetzt', 'info');
        }
      };
    }

    const resetEventsBtn = document.getElementById('reset-events-btn');
    if (resetEventsBtn) {
      resetEventsBtn.onclick = async () => {
        if (confirm('Möchten Sie die Events wirklich auf den Werkszustand zurücksetzen? Alle hinzugefügten oder geänderten Events werden zurückgesetzt.')) {
          await window.kellerStore.resetEventsToDefault();
          this.renderEventsItems();
          this.showToast('Events auf Werkszustand zurückgesetzt', 'info');
        }
      };
    }

    if (resetSettingsBtn) {
      resetSettingsBtn.onclick = async () => {
        if (confirm('Möchten Sie alle Einstellungen (Status, Ankündigung, Pizzaofen) auf Standard zurücksetzen?')) {
          await window.kellerStore.resetSettingsToDefault();
          this.renderStatusControls();
          this.renderAnnouncementControls();
          this.renderPizzaOvenControls();
          this.renderMakrelenGrillControls();
          this.showToast('Einstellungen zurückgesetzt', 'info');
        }
      };
    }
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.className = `admin-toast toast-${type} show`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const admin = new KellerAdminDashboard();
  admin.init();
});
