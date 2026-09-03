/**
 * store.js - Central Data Store for Engelhardt's Keller
 * Handles LocalStorage persistence with fallback to default JSON data
 */

const STORAGE_KEYS = {
  MENU: 'engelhardts_keller_menu_v4',
  SETTINGS: 'engelhardts_keller_settings_v3',
  GALLERY: 'engelhardts_keller_gallery_v1',
  EVENTS: 'engelhardts_keller_events_v1',
  AUTH: 'engelhardts_keller_auth_v1'
};

class KellerStore {
  constructor() {
    this.menuData = null;
    this.settingsData = null;
    this.galleryData = null;
    this.eventsData = null;
    this.listeners = [];
  }

  async init() {
    await Promise.all([this.loadSettings(), this.loadMenu(), this.loadGallery(), this.loadEvents()]);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb({
      menu: this.menuData,
      settings: this.settingsData,
      gallery: this.galleryData,
      events: this.eventsData
    }));
  }

  // --- Settings ---
  async loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        this.settingsData = JSON.parse(saved);
        return this.settingsData;
      } catch (e) {
        console.warn('Invalid saved settings, loading fallback', e);
      }
    }

    try {
      const resp = await fetch('data/settings.json');
      const data = await resp.json();
      this.settingsData = data.settings;
    } catch (e) {
      console.error('Failed to load settings.json', e);
      this.settingsData = {
        biergarten_status: 'vom_wetter_abhaengig',
        status_override_reason: '',
        announcement: {
          active: true,
          text: "Saisonstart am Engelhardt's Keller: Wenn die Sonne lacht, wird der Keller aufgemacht!",
          badge: 'Aktuelles'
        },
        coordinates: { lat: 50.0673, lon: 10.9628, city: 'Ebensfeld' },
        admin_pin: 'keller1867'
      };
    }
    return this.settingsData;
  }

  saveSettings(newSettings) {
    this.settingsData = { ...this.settingsData, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settingsData));
    this.notify();
    return this.settingsData;
  }

  getSettings() {
    return this.settingsData;
  }

  setPizzaOven(active, noticeActive, noticeInactive) {
    const current = this.getSettings() || {};
    const pizzaOven = current.pizza_oven || {};
    current.pizza_oven = {
      active: !!active,
      notice_active: noticeActive !== undefined ? noticeActive : (pizzaOven.notice_active || "Heute ist unser Steinbackofen in Betrieb! Frische Steinofen-Pizza ab 16 Uhr."),
      notice_inactive: noticeInactive !== undefined ? noticeInactive : (pizzaOven.notice_inactive || "Unser Steinbackofen ist heute nicht in Betrieb (Steinofen-Pizza gibt es nur an bestimmten Tagen).")
    };
    return this.saveSettings(current);
  }

  toggleAllPizzaDishes(active) {
    if (!this.menuData || !this.menuData.items) return;
    this.menuData.items.forEach(item => {
      if (item.category === 'pizza') {
        item.active = !!active;
      }
    });
    return this.saveMenu(this.menuData);
  }

  setMakrelenGrill(active, noticeActive, noticeInactive) {
    const current = this.getSettings() || {};
    const makrelen = current.makrelen_grill || {};
    current.makrelen_grill = {
      active: !!active,
      notice_active: noticeActive !== undefined ? noticeActive : (makrelen.notice_active || "🐟 Heute frische Makrelen vom Holzkohlegrill (11,- €) – solange der Vorrat reicht!"),
      notice_inactive: noticeInactive !== undefined ? noticeInactive : (makrelen.notice_inactive || "Gegrillte Makrelen gibt es an ausgewählten Aktionstagen im August.")
    };
    return this.saveSettings(current);
  }

  toggleMakrelenDish(active) {
    if (!this.menuData || !this.menuData.items) return;
    const item = this.menuData.items.find(i => i.id === 'item_makrele_grill');
    if (item) {
      item.active = !!active;
      return this.saveMenu(this.menuData);
    }
  }

  // --- Menu ---
  async loadMenu() {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU);
    if (saved) {
      try {
        this.menuData = JSON.parse(saved);
        return this.menuData;
      } catch (e) {
        console.warn('Invalid saved menu, loading fallback', e);
      }
    }

    try {
      const resp = await fetch('data/menu.json');
      const data = await resp.json();
      this.menuData = data;
    } catch (e) {
      console.error('Failed to load menu.json', e);
      this.menuData = { categories: [], items: [] };
    }
    return this.menuData;
  }

  saveMenu(newMenu) {
    this.menuData = newMenu;
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(this.menuData));
    this.notify();
    return this.menuData;
  }

  getMenu() {
    return this.menuData;
  }

  // Quick item toggling
  toggleItemActive(itemId, forceState = null) {
    if (!this.menuData || !this.menuData.items) return null;
    const item = this.menuData.items.find(i => i.id === itemId);
    if (item) {
      item.active = forceState !== null ? forceState : !item.active;
      this.saveMenu(this.menuData);
      return item;
    }
    return null;
  }

  addItem(newItem) {
    if (!this.menuData) this.menuData = { categories: [], items: [] };
    newItem.id = 'item_' + Date.now();
    if (newItem.active === undefined) newItem.active = true;
    this.menuData.items.push(newItem);
    this.saveMenu(this.menuData);
    return newItem;
  }

  updateItem(itemId, updatedFields) {
    if (!this.menuData || !this.menuData.items) return null;
    const index = this.menuData.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      this.menuData.items[index] = { ...this.menuData.items[index], ...updatedFields };
      this.saveMenu(this.menuData);
      return this.menuData.items[index];
    }
    return null;
  }

  deleteItem(itemId) {
    if (!this.menuData || !this.menuData.items) return false;
    this.menuData.items = this.menuData.items.filter(i => i.id !== itemId);
    this.saveMenu(this.menuData);
    return true;
  }

  async resetMenuToDefault() {
    localStorage.removeItem(STORAGE_KEYS.MENU);
    return await this.loadMenu();
  }

  async resetSettingsToDefault() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return await this.loadSettings();
  }

  // --- Gallery ---
  async loadGallery() {
    const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (saved) {
      try {
        this.galleryData = JSON.parse(saved);
        return this.galleryData;
      } catch (e) {
        console.warn('Invalid saved gallery, loading fallback', e);
      }
    }

    try {
      const resp = await fetch('data/gallery.json');
      const data = await resp.json();
      this.galleryData = data;
    } catch (e) {
      console.error('Failed to load gallery.json', e);
      this.galleryData = { categories: [], items: [] };
    }
    return this.galleryData;
  }

  saveGallery(newGallery) {
    this.galleryData = newGallery;
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(this.galleryData));
    this.notify();
    return this.galleryData;
  }

  getGallery() {
    return this.galleryData;
  }

  addGalleryImage(newImg) {
    if (!this.galleryData) this.galleryData = { categories: [], items: [] };
    if (!this.galleryData.items) this.galleryData.items = [];
    newImg.id = 'img_' + Date.now();
    if (newImg.active === undefined) newImg.active = true;
    this.galleryData.items.unshift(newImg); // add at start of list
    this.saveGallery(this.galleryData);
    return newImg;
  }

  updateGalleryImage(imgId, updatedFields) {
    if (!this.galleryData || !this.galleryData.items) return null;
    const index = this.galleryData.items.findIndex(i => i.id === imgId);
    if (index !== -1) {
      this.galleryData.items[index] = { ...this.galleryData.items[index], ...updatedFields };
      this.saveGallery(this.galleryData);
      return this.galleryData.items[index];
    }
    return null;
  }

  deleteGalleryImage(imgId) {
    if (!this.galleryData || !this.galleryData.items) return false;
    this.galleryData.items = this.galleryData.items.filter(i => i.id !== imgId);
    this.saveGallery(this.galleryData);
    return true;
  }

  async resetGalleryToDefault() {
    localStorage.removeItem(STORAGE_KEYS.GALLERY);
    return await this.loadGallery();
  }

  // --- Events ---
  async loadEvents() {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      try {
        this.eventsData = JSON.parse(saved);
        return this.eventsData;
      } catch (e) {
        console.warn('Invalid saved events, loading fallback', e);
      }
    }

    try {
      const resp = await fetch('data/events.json');
      const data = await resp.json();
      this.eventsData = data;
    } catch (e) {
      console.error('Failed to load events.json', e);
      this.eventsData = { events: [] };
    }
    return this.eventsData;
  }

  saveEvents(events) {
    this.eventsData = events;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.eventsData));
    this.notify();
  }

  getEvents() {
    return this.eventsData?.events || [];
  }

  toggleEventActive(eventId, forceState = null) {
    const events = this.getEvents();
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      ev.active = forceState !== null ? forceState : !ev.active;
      this.saveEvents({ events });
      return ev.active;
    }
    return false;
  }

  addEvent(newEvent) {
    if (!this.eventsData) this.eventsData = { events: [] };
    if (!this.eventsData.events) this.eventsData.events = [];
    newEvent.id = 'event_' + Date.now();
    if (newEvent.active === undefined) newEvent.active = true;
    this.eventsData.events.push(newEvent);
    this.eventsData.events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    this.saveEvents(this.eventsData);
    return newEvent;
  }

  updateEvent(eventId, updatedFields) {
    if (!this.eventsData || !this.eventsData.events) return null;
    const index = this.eventsData.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.eventsData.events[index] = { ...this.eventsData.events[index], ...updatedFields };
      this.eventsData.events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      this.saveEvents(this.eventsData);
      return this.eventsData.events[index];
    }
    return null;
  }

  deleteEvent(eventId) {
    if (!this.eventsData || !this.eventsData.events) return false;
    this.eventsData.events = this.eventsData.events.filter(e => e.id !== eventId);
    this.saveEvents(this.eventsData);
    return true;
  }

  async resetEventsToDefault() {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    return await this.loadEvents();
  }

  // --- Auth Session ---
  isAuthenticated() {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  }

  login(pin) {
    const settings = this.getSettings();
    const correctPin = (settings && settings.admin_pin) || 'keller1867';
    if (pin === correctPin) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      return true;
    }
    return false;
  }

  logout() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}

// Global singleton instance
window.kellerStore = new KellerStore();
