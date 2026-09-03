/**
 * weather.js - Weather Engine & Beer Garden Status Logic for Ebensfeld
 * Connects to Open-Meteo API and calculates open/closed status
 */

const EBENSFELD_COORDS = {
  lat: 50.0673,
  lon: 10.9628,
  city: 'Ebensfeld (Oberfranken)'
};

const WMO_CODES = {
  0: { label: 'Sonnig & klar', icon: 'fa-sun', isRain: false },
  1: { label: 'Überwiegend sonnig', icon: 'fa-cloud-sun', isRain: false },
  2: { label: 'Teilweise bewölkt', icon: 'fa-cloud-sun', isRain: false },
  3: { label: 'Bewölkt', icon: 'fa-cloud', isRain: false },
  45: { label: 'Neblig', icon: 'fa-smog', isRain: false },
  48: { label: 'Reifnebel', icon: 'fa-smog', isRain: false },
  51: { label: 'Leichter Nieselregen', icon: 'fa-cloud-rain', isRain: true },
  53: { label: 'Mäßiger Nieselregen', icon: 'fa-cloud-rain', isRain: true },
  55: { label: 'Dichter Nieselregen', icon: 'fa-cloud-rain', isRain: true },
  61: { label: 'Leichter Regen', icon: 'fa-cloud-showers-heavy', isRain: true },
  63: { label: 'Mäßiger Regen', icon: 'fa-cloud-showers-heavy', isRain: true },
  65: { label: 'Starker Regen', icon: 'fa-cloud-showers-heavy', isRain: true },
  71: { label: 'Leichter Schneefall', icon: 'fa-snowflake', isRain: true },
  73: { label: 'Mäßiger Schneefall', icon: 'fa-snowflake', isRain: true },
  75: { label: 'Starker Schneefall', icon: 'fa-snowflake', isRain: true },
  80: { label: 'Leichte Regenschauer', icon: 'fa-cloud-sun-rain', isRain: true },
  81: { label: 'Mäßige Regenschauer', icon: 'fa-cloud-showers-water', isRain: true },
  82: { label: 'Heftige Regenschauer', icon: 'fa-cloud-showers-water', isRain: true },
  95: { label: 'Gewitter', icon: 'fa-bolt', isRain: true },
  96: { label: 'Gewitter mit leichtem Hagel', icon: 'fa-cloud-bolt', isRain: true },
  99: { label: 'Gewitter mit starkem Hagel', icon: 'fa-cloud-bolt', isRain: true }
};

class KellerWeather {
  constructor() {
    this.weatherData = null;
    this.statusInfo = null;
    this.lastFetched = null;
  }

  async fetchWeather() {
    // Cache for 10 minutes in session
    const cacheKey = 'keller_weather_cache';
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          this.weatherData = data;
          this.lastFetched = new Date(timestamp);
          return this.weatherData;
        }
      } catch (e) {
        // invalid cache
      }
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${EBENSFELD_COORDS.lat}&longitude=${EBENSFELD_COORDS.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&timezone=Europe%2FBerlin&forecast_days=3`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Wetter-API HTTP ' + response.status);
      this.weatherData = await response.json();
      this.lastFetched = new Date();
      sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: this.weatherData }));
      return this.weatherData;
    } catch (err) {
      console.warn('Wetterabfrage fehlgeschlagen, nutze Fallback', err);
      // Sensible Fallback if offline
      this.weatherData = {
        current: {
          temperature_2m: 21.5,
          precipitation: 0.0,
          weather_code: 1,
          wind_speed_10m: 8.5
        },
        hourly: {
          time: [],
          temperature_2m: [],
          precipitation_probability: [],
          precipitation: [],
          weather_code: []
        },
        isFallback: true
      };
      return this.weatherData;
    }
  }

  calculateStatus(settings) {
    const override = settings?.biergarten_status || 'vom_wetter_abhaengig';
    const customReason = settings?.status_override_reason || '';
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentHour = now.getHours();

    const currentWeather = this.weatherData?.current || { temperature_2m: 20, weather_code: 1, precipitation: 0 };
    const wmo = WMO_CODES[currentWeather.weather_code] || { label: 'Heiter', icon: 'fa-sun', isRain: false };

    // 1. Check Admin Overrides first
    if (override === 'geoffnet') {
      return {
        key: 'open_override',
        isOpen: true,
        badgeType: 'open',
        badgeText: 'Heute geöffnet',
        title: 'Biergarten ist geöffnet!',
        subtitle: customReason || 'Freuen Sie sich auf eine kühle Kellerliebe und fränkische Brotzeiten unter den Linden.',
        reason: customReason || 'Vom Keller-Team manuell als geöffnet markiert.',
        isOverridden: true,
        currentWeather: { ...currentWeather, wmo }
      };
    }

    if (override === 'geschlossen') {
      return {
        key: 'closed_override',
        isOpen: false,
        badgeType: 'closed',
        badgeText: 'Heute geschlossen',
        title: 'Heute geschlossen',
        subtitle: customReason || 'Unser Biergarten bleibt heute geschlossen.',
        reason: customReason || 'Vom Keller-Team manuell als geschlossen markiert.',
        isOverridden: true,
        currentWeather: { ...currentWeather, wmo }
      };
    }

    if (override === 'geschlossene_gesellschaft') {
      return {
        key: 'event',
        isOpen: false,
        badgeType: 'event',
        badgeText: 'Geschlossene Gesellschaft',
        title: 'Heute private Feierlichkeit',
        subtitle: customReason || 'Wir haben heute exklusiv für eine geschlossene Gesellschaft geöffnet.',
        reason: customReason || 'Der Biergarten ist für den regulären Publikumsverkehr geschlossen.',
        isOverridden: true,
        currentWeather: { ...currentWeather, wmo }
      };
    }

    if (override === 'urlaub') {
      return {
        key: 'vacation',
        isOpen: false,
        badgeType: 'vacation',
        badgeText: 'Betriebsurlaub',
        title: 'Wir machen Betriebsurlaub',
        subtitle: customReason || 'Unser Keller macht eine kurze Pause. Wir freuen uns bald wieder auf Sie!',
        reason: customReason || 'Betriebsurlaub der Familie Engelhardt.',
        isOverridden: true,
        currentWeather: { ...currentWeather, wmo }
      };
    }

    // 2. Automatic Mode: "vom_wetter_abhaengig"
    // Check Monday Ruhetag
    if (dayOfWeek === 1) {
      return {
        key: 'closed_monday',
        isOpen: false,
        badgeType: 'closed',
        badgeText: 'Montags Ruhetag',
        title: 'Heute Ruhetag',
        subtitle: 'Montag ist unser regulärer Ruhetag. Ab Dienstag haben wir ab 16:00 Uhr wieder für Sie geöffnet (bei schönem Wetter).',
        reason: 'Montag ist regulärer Ruhetag am Engelhardt\'s Keller.',
        isOverridden: false,
        currentWeather: { ...currentWeather, wmo }
      };
    }

    // Regular opening window
    const openHour = dayOfWeek === 0 ? 11 : 16;
    const closeHour = 22;

    // Evaluate weather in opening window today
    let willRain = false;
    let rainDetails = [];
    let avgTemp = currentWeather.temperature_2m;

    if (this.weatherData?.hourly?.time?.length) {
      const todayPrefix = now.toISOString().slice(0, 10);
      const hourly = this.weatherData.hourly;

      let count = 0;
      let sumTemp = 0;

      for (let i = 0; i < hourly.time.length; i++) {
        const timeStr = hourly.time[i];
        if (timeStr.startsWith(todayPrefix)) {
          const hour = parseInt(timeStr.slice(11, 13), 10);
          if (hour >= openHour && hour <= 21) {
            const prob = hourly.precipitation_probability[i] || 0;
            const amount = hourly.precipitation[i] || 0;
            const code = hourly.weather_code[i] || 0;
            const isRainCode = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

            sumTemp += hourly.temperature_2m[i] || 18;
            count++;

            if (prob > 45 || amount >= 0.3 || isRainCode) {
              willRain = true;
              rainDetails.push({ hour: `${hour}:00`, prob, amount, label: WMO_CODES[code]?.label || 'Regen' });
            }
          }
        }
      }
      if (count > 0) avgTemp = Math.round((sumTemp / count) * 10) / 10;
    }

    // Is it past closing time?
    if (currentHour >= closeHour) {
      return {
        key: 'closed_evening',
        isOpen: false,
        badgeType: 'closed',
        badgeText: 'Bereits geschlossen',
        title: 'Für heute geschlossen',
        subtitle: 'Unser Biergarten hat für heute geschlossen. Wir freuen uns morgen wieder auf Ihren Besuch!',
        reason: 'Außerhalb der regulären Kellerzeiten.',
        isOverridden: false,
        currentWeather: { ...currentWeather, wmo }
      };
    }

    // Rain or bad weather predicted
    if (willRain || currentWeather.precipitation > 0.2 || (currentWeather.weather_code >= 51 && currentWeather.weather_code <= 99)) {
      const detailText = rainDetails.length > 0 
        ? `Niederschlagsvorhersage für Ebensfeld meldet Regen (${rainDetails.map(r => `${r.hour}: ${r.prob}%`).slice(0, 3).join(', ')}).`
        : 'Aufgrund von Niederschlag bleibt der Keller heute geschlossen.';

      return {
        key: 'closed_weather',
        isOpen: false,
        badgeType: 'closed',
        badgeText: 'Wetterbedingt geschlossen',
        title: 'Heute geschlossen wegen Regen',
        subtitle: 'Bei feuchtem oder regnerischem Wetter bleibt unser Freisitz leider geschlossen.',
        reason: detailText,
        isOverridden: false,
        currentWeather: { ...currentWeather, wmo }
      };
    }

    // Good weather!
    const isCurrentlyOpen = currentHour >= openHour && currentHour < closeHour;
    const openTimeText = dayOfWeek === 0 ? 'ab 11:00 Uhr' : 'ab 16:00 Uhr';

    return {
      key: 'open_weather',
      isOpen: true,
      badgeType: 'open',
      badgeText: isCurrentlyOpen ? 'Jetzt geöffnet' : `Öffnet heute ${openTimeText}`,
      title: isCurrentlyOpen ? 'Biergarten ist geöffnet!' : `Heute geöffnet (${openTimeText})`,
      subtitle: `Sonniges Biergartenwetter in Ebensfeld bei rund ${Math.round(avgTemp)} °C. Genießen Sie fränkische Kellerkultur unter den schattigen Linden!`,
      reason: `Wetterprognose für Ebensfeld ist trocken und einladend (${wmo.label}, ${Math.round(currentWeather.temperature_2m)} °C).`,
      isCurrentlyOpen,
      openTimeText,
      isOverridden: false,
      currentWeather: { ...currentWeather, wmo }
    };
  }

  // Get next 4 hours preview
  getHourlyPreview() {
    if (!this.weatherData?.hourly?.time) return [];
    const now = new Date();
    const currentHour = now.getHours();
    const todayPrefix = now.toISOString().slice(0, 10);
    const hourly = this.weatherData.hourly;

    const list = [];
    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];
      if (timeStr.startsWith(todayPrefix)) {
        const hour = parseInt(timeStr.slice(11, 13), 10);
        if (hour >= currentHour && list.length < 5) {
          const code = hourly.weather_code[i] || 0;
          list.push({
            hour: `${hour}:00`,
            temp: Math.round(hourly.temperature_2m[i]),
            prob: hourly.precipitation_probability[i] || 0,
            amount: hourly.precipitation[i] || 0,
            wmo: WMO_CODES[code] || { label: 'Heiter', icon: 'fa-sun' }
          });
        }
      }
    }
    return list;
  }
}

window.kellerWeather = new KellerWeather();
