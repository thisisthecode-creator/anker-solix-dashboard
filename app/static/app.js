// === i18n: Auto-detect browser language ===
const LANG = navigator.language.startsWith('de') ? 'de' : 'en';
document.documentElement.lang = LANG;

const I18N = {
    de: {
        refreshing: 'Aktualisieren...', offline: 'Offline - Daten aus Cache',
        connecting: 'Verbinde...', connected: 'Verbunden', disconnected: 'Getrennt',
        notifications: 'Benachrichtigungen',
        forecastTitle: 'Solar-Prognose (7 Tage)', forecastSource: 'Warschau · 240° SW · konkav 45°–75° · Open-Meteo',
        forecastVsReal: 'Prognose vs. Realität (7 Tage)',
        solarInput: 'Solareingabe', battery: 'Batterie', temperature: 'Temperatur', totalOutput: 'Ausgang Gesamt',
        energyFlow: 'Energiefluss',
        energySavings: 'Energie & Ersparnis',
        today: 'Heute', week: 'Woche', month: 'Monat', total: 'Gesamt', year: 'Jahr', day: 'Tag',
        solar: 'Solar', consumption: 'Verbrauch', savedEur: 'Gespart EUR',
        batteryPct: 'Batterie (%)', temperatureC: 'Temperatur (C)', totalOutputW: 'Ausgang Gesamt (W)',
        acCharging: 'AC Laden (W)', dailyProd: 'Tagesproduktion (kWh)', batteryHealth: 'Batterie-Gesundheit (SOH %)',
        statistics: 'Statistiken', days7: '7 Tage', days30: '30 Tage', all: 'Alle',
        peakSolar: 'Peak Solar', avgSolar: 'Ø Solar', avgTemp: 'Ø Temperatur',
        peakOutput: 'Peak Output', minBattery: 'Min Batterie', maxBattery: 'Max Batterie',
        dataExport: 'Daten Export (CSV)', mqttOverview: 'MQTT Übersicht',
        paybackCalc: 'Amortisations-Rechner', systemCost: 'Systemkosten', savedSoFar: 'Gespart bisher', remaining: 'Verbleibend',
        showCostBreakdown: 'Kostenaufstellung anzeigen',
        costPanels: '2× ECO-WORTHY 200W Panels', costMounts: '2× Halterung Balkongeländer',
        costCableXt60: 'Solarkabel XT60i', costFeedthrough: 'Fensterdurchführung',
        costExtension: 'Verlängerungskabel 2m', costTotal: 'Gesamt',
        dataBackup: 'Daten-Backup', downloadDb: 'DB-Export herunterladen', mqttLog: 'MQTT Live-Log',
        time: 'Zeit', back: '‹ Zurück', next: 'Weiter ›',
        page: 'Seite', entries: 'Einträge',
        // Dynamic JS strings
        clouds: 'Wolken',
        fullIn: 'Voll in ~', emptyIn: 'Leer in ~', fullyCharged: 'Voll geladen',
        solarKwh: 'Solar kWh', consumptionKwh: 'Verbrauch kWh',
        forecast: 'Prognose', actual: 'Real',
        expectedPayback: 'Voraussichtlich amortisiert:', paidOff: 'System ist amortisiert!',
        noMonthlyData: 'Noch keine Monatsdaten zur Berechnung.',
        noBackup: 'Noch kein Backup erstellt.',
        backupOld: 'Letztes Backup vor {d} Tagen. Bitte erneut sichern!',
        backupRecent: 'Letztes Backup: {date} ({d} Tage her)',
        batteryLow: 'Batterie niedrig', batteryAt: 'Batterie bei {v}%',
        batteryFull: 'Batterie voll geladen', batteryFullBody: 'Akku ist bei 100%',
        solarPeak: 'Solar-Peak erreicht', peakAt: 'Peak bei {v} W',
        stormWarning: 'Sturmwarnung', stormBody: 'Wind {v} km/h erwartet! Panels prüfen.',
        tempWarning: 'Temperatur-Warnung', tempWarningBody: 'Powerstation bei {v}°C! Überhitzungsgefahr.',
        dailyReport: 'Solar-Tagesreport', dailyReportBody: '☀️ {kwh} kWh | Peak {peak} W | {hours}h Sonne | 💰 {eur} €',
        notifNotSupported: 'Benachrichtigungen werden auf diesem Gerät nicht unterstützt. Auf iOS: App zum Homescreen hinzufügen.',
        kwhWeek: 'kWh / 7 Tage', avgKwhDay: '⌀ kWh / Tag', sunHours: 'h Sonne',
        perWeek: '/ Woche', perDay: '/ Tag', wind: 'Wind',
        chargeEquiv: 'Ladezyklen-Äquivalent',
        techSpecs: 'Technische Daten', specInput: 'Eingang', specOutput: 'Ausgang',
        specBattery: 'Batterie', specPhysical: 'Gehäuse', specAcCharge: 'AC Laden',
        specChargeTime: 'Ladezeit', specCapacity: 'Kapazität', specCycles: 'Zyklen',
        specDimensions: 'Maße', specWeight: 'Gewicht', specExpandable: 'Erweiterbar', specNo: 'Nein',
        solarScore: 'Solar-Score', todayVsYesterday: 'Heute vs. Gestern (Solar W)',
        heatmapTitle: 'Solar-Kalender', less: 'Weniger', more: 'Mehr',
        forecastAccuracyLabel: 'Prognose-Genauigkeit',
        batteryCycles: 'Batterie-Zyklen', totalCycles: 'Zyklen Gesamt', todayCycles: 'Heute',
        cycleHealth: 'Verbleibend', cycles: 'Zyklen',
        cycleEstimate: 'Bei {rate} Zyklen/Tag: ~{years} Jahre Lebensdauer',
        usagePatterns: 'Verbrauchsmuster', noPatterns: 'Noch nicht genug Daten für Muster.',
        avgWatts: '⌀ {w} W', regularUsage: 'Regelmäßiger Verbrauch',
        shareTitle: 'Mein Solar-Tag', shareText: 'Solar: {kwh} kWh ☀️ | Score: {score}%',
        yesterday: 'Gestern', todayLabel: 'Heute',
        savedTotal: 'Gespart gesamt:', thisWeek: 'Diese Woche', lastWeek: 'Letzte Woche',
        weekBetter: '{pct}% mehr als letzte Woche ↑', weekWorse: '{pct}% weniger als letzte Woche ↓',
        weekSame: 'Gleich wie letzte Woche', daysUntilRoi: 'Tage bis Amortisation',
        avoided: 'vermieden', totalProduced: 'erzeugt', roiDone: 'Amortisiert! 🎉',
        weeklyReport: 'Wochen-Report', weeklyReportBody: 'Solar: {kwh} kWh | Gespart: {eur} € | CO₂: {co2} kg vermieden',
        autoTheme: 'Auto-Theme aktiv', cafes: 'Cafés',
        chargingIdle: 'Idle', chargingDischarge: 'Entladen', chargingCharge: 'Laden',
        acSwitch: 'AC', dcSwitch: 'DC', switchOn: 'An', switchOff: 'Aus',
        overloadWarning: 'Überlast!', overloadBody: 'Überlast am Ausgang erkannt! Geräte prüfen.',
        chargeLimits: 'Ladegrenzen', firmware: 'Firmware', batteryAh: 'Ah',
        acLimit: 'AC Limit', portCharging: 'Laden', portDischarging: 'Entladen', portIdle: 'Idle',
        deviceInfo: 'Geräte-Info', displayOn: 'Display An', displayOff: 'Display Aus',
        ledMode: 'LED', expansionPacks: 'Erweiterungen',
        weatherCodes: { 0: 'Klar', 1: 'Heiter', 2: 'Teilw. bewölkt', 3: 'Bewölkt', 45: 'Nebel', 48: 'Nebel', 51: 'Niesel', 53: 'Niesel', 55: 'Regen', 61: 'Regen', 63: 'Regen', 65: 'Starkregen', 71: 'Schnee', 73: 'Schnee', 75: 'Schnee', 80: 'Schauer', 81: 'Schauer', 82: 'Gewitter', 95: 'Gewitter', 96: 'Hagel' },
        dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    },
    en: {
        refreshing: 'Refreshing...', offline: 'Offline - Cached data',
        connecting: 'Connecting...', connected: 'Connected', disconnected: 'Disconnected',
        notifications: 'Notifications',
        forecastTitle: 'Solar Forecast (7 Days)', forecastSource: 'Warsaw · 240° SW · concave 45°–75° · Open-Meteo',
        forecastVsReal: 'Forecast vs. Reality (7 Days)',
        solarInput: 'Solar Input', battery: 'Battery', temperature: 'Temperature', totalOutput: 'Total Output',
        energyFlow: 'Energy Flow',
        energySavings: 'Energy & Savings',
        today: 'Today', week: 'Week', month: 'Month', total: 'Total', year: 'Year', day: 'Day',
        solar: 'Solar', consumption: 'Consumption', savedEur: 'Saved EUR',
        batteryPct: 'Battery (%)', temperatureC: 'Temperature (C)', totalOutputW: 'Total Output (W)',
        acCharging: 'AC Charging (W)', dailyProd: 'Daily Production (kWh)', batteryHealth: 'Battery Health (SOH %)',
        statistics: 'Statistics', days7: '7 Days', days30: '30 Days', all: 'All',
        peakSolar: 'Peak Solar', avgSolar: 'Avg Solar', avgTemp: 'Avg Temperature',
        peakOutput: 'Peak Output', minBattery: 'Min Battery', maxBattery: 'Max Battery',
        dataExport: 'Data Export (CSV)', mqttOverview: 'MQTT Overview',
        paybackCalc: 'Payback Calculator', systemCost: 'System Cost', savedSoFar: 'Saved so far', remaining: 'Remaining',
        showCostBreakdown: 'Show cost breakdown',
        costPanels: '2× ECO-WORTHY 200W Panels', costMounts: '2× Balcony Rail Mounts',
        costCableXt60: 'Solar Cable XT60i', costFeedthrough: 'Window Feedthrough',
        costExtension: 'Extension Cable 2m', costTotal: 'Total',
        dataBackup: 'Data Backup', downloadDb: 'Download DB Export', mqttLog: 'MQTT Live Log',
        time: 'Time', back: '‹ Back', next: 'Next ›',
        page: 'Page', entries: 'entries',
        clouds: 'Clouds',
        fullIn: 'Full in ~', emptyIn: 'Empty in ~', fullyCharged: 'Fully charged',
        solarKwh: 'Solar kWh', consumptionKwh: 'Consumption kWh',
        forecast: 'Forecast', actual: 'Actual',
        expectedPayback: 'Expected payback:', paidOff: 'System is paid off!',
        noMonthlyData: 'No monthly data for calculation yet.',
        noBackup: 'No backup created yet.',
        backupOld: 'Last backup {d} days ago. Please back up again!',
        backupRecent: 'Last backup: {date} ({d} days ago)',
        batteryLow: 'Battery Low', batteryAt: 'Battery at {v}%',
        batteryFull: 'Battery Fully Charged', batteryFullBody: 'Battery is at 100%',
        solarPeak: 'Solar Peak Reached', peakAt: 'Peak at {v} W',
        stormWarning: 'Storm Warning', stormBody: 'Wind {v} km/h expected! Check panels.',
        tempWarning: 'Temperature Warning', tempWarningBody: 'Powerstation at {v}°C! Overheating risk.',
        dailyReport: 'Solar Daily Report', dailyReportBody: '☀️ {kwh} kWh | Peak {peak} W | {hours}h Sun | 💰 {eur} €',
        notifNotSupported: 'Notifications not supported on this device. On iOS: add app to home screen first.',
        kwhWeek: 'kWh / 7 Days', avgKwhDay: 'Avg kWh / Day', sunHours: 'h Sun',
        perWeek: '/ Week', perDay: '/ Day', wind: 'Wind',
        chargeEquiv: 'Charge Equivalents',
        solarScore: 'Solar Score', todayVsYesterday: 'Today vs. Yesterday (Solar W)',
        heatmapTitle: 'Solar Calendar', less: 'Less', more: 'More',
        forecastAccuracyLabel: 'Forecast Accuracy',
        batteryCycles: 'Battery Cycles', totalCycles: 'Total Cycles', todayCycles: 'Today',
        cycleHealth: 'Remaining', cycles: 'Cycles',
        cycleEstimate: 'At {rate} cycles/day: ~{years} years lifespan',
        usagePatterns: 'Usage Patterns', noPatterns: 'Not enough data for patterns yet.',
        avgWatts: 'Avg {w} W', regularUsage: 'Regular usage',
        shareTitle: 'My Solar Day', shareText: 'Solar: {kwh} kWh ☀️ | Score: {score}%',
        yesterday: 'Yesterday', todayLabel: 'Today',
        savedTotal: 'Total saved:', thisWeek: 'This Week', lastWeek: 'Last Week',
        weekBetter: '{pct}% more than last week ↑', weekWorse: '{pct}% less than last week ↓',
        weekSame: 'Same as last week', daysUntilRoi: 'Days until ROI',
        avoided: 'avoided', totalProduced: 'produced', roiDone: 'Paid off! 🎉',
        weeklyReport: 'Weekly Report', weeklyReportBody: 'Solar: {kwh} kWh | Saved: {eur} € | CO₂: {co2} kg avoided',
        autoTheme: 'Auto-theme active', cafes: 'Cafés',
        chargingIdle: 'Idle', chargingDischarge: 'Discharging', chargingCharge: 'Charging',
        acSwitch: 'AC', dcSwitch: 'DC', switchOn: 'On', switchOff: 'Off',
        overloadWarning: 'Overload!', overloadBody: 'Output overload detected! Check devices.',
        chargeLimits: 'Charge Limits', firmware: 'Firmware', batteryAh: 'Ah',
        acLimit: 'AC Limit', portCharging: 'Charging', portDischarging: 'Discharging', portIdle: 'Idle',
        deviceInfo: 'Device Info', displayOn: 'Display On', displayOff: 'Display Off',
        ledMode: 'LED', expansionPacks: 'Expansions',
        weatherCodes: { 0: 'Clear', 1: 'Fair', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Rain', 61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Snow', 73: 'Snow', 75: 'Snow', 80: 'Showers', 81: 'Showers', 82: 'Thunderstorm', 95: 'Thunderstorm', 96: 'Hail' },
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }
};

function t(key) { return I18N[LANG][key] || I18N.de[key] || key; }

// Apply translations to HTML elements with data-i18n attribute
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = t(key);
        if (val) el.textContent = val;
    });
}

// === Number formatting (locale-aware) ===
const locale = LANG === 'de' ? 'de-DE' : 'en-US';
const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
const fmt2 = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
const fmtEur = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const EUR_PER_KWH = 0.25; // Poland household electricity price
const SYSTEM_COST_EUR = 941; // 4011 PLN ÷ 4.2623 (NBP rate 2026-04-08)
const CO2_KG_PER_KWH = 0.7; // Poland electricity mix
const CAFE_PRICE_EUR = 3.70; // Price of a café in Warsaw

function fmtWh(kwh) {
    const wh = kwh * 1000;
    if (wh >= 1000) return fmt2.format(kwh) + ' kWh';
    return fmt.format(wh) + ' Wh';
}

const $ = id => document.getElementById(id);
const dot = $('statusDot');
const statusText = $('statusText');

// Forward declarations for charts referenced in applyTheme
let charts = {};
let combinedChart = null;
let dailyBarChart = null;
let sohChart = null;

// === Theme ===
let themeMode = localStorage.getItem('themeMode') || 'auto'; // 'auto', 'dark', 'light'
let darkMode = localStorage.getItem('theme') !== 'light';
const themeIcons = { auto: '🌗', dark: '&#9790;', light: '&#9728;&#65039;' };

function getAutoDark() {
    const now = new Date();
    if (!window._sunrise || !window._sunset) {
        // Fallback: 6:00-20:00 = light
        const h = now.getHours();
        return h < 6 || h >= 20;
    }
    return now < window._sunrise || now > window._sunset;
}

function checkAutoTheme() {
    if (themeMode === 'auto') {
        const shouldBeDark = getAutoDark();
        if (shouldBeDark !== darkMode) {
            darkMode = shouldBeDark;
            localStorage.setItem('theme', darkMode ? 'dark' : 'light');
            applyTheme();
        }
    }
}

function applyTheme() {
    document.body.classList.toggle('light-mode', !darkMode);
    const btn = $('themeToggle');
    if (btn) btn.innerHTML = themeIcons[themeMode] || themeIcons.auto;
    if (btn) btn.title = themeMode === 'auto' ? t('autoTheme') : (darkMode ? 'Dark' : 'Light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = darkMode ? '#000000' : '#f5f5f5';
    Chart.defaults.color = darkMode ? '#888' : '#666';
    Chart.defaults.borderColor = darkMode ? '#222' : '#e0e0e0';
    const gridColor = darkMode ? '#1a1a1a' : '#e0e0e0';
    for (const key of Object.keys(charts)) {
        const c = charts[key];
        if (c && c.options && c.options.scales) {
            if (c.options.scales.y && c.options.scales.y.grid) c.options.scales.y.grid.color = gridColor;
            c.update('none');
        }
    }
    if (combinedChart && combinedChart.options && combinedChart.options.scales) {
        if (combinedChart.options.scales.yW && combinedChart.options.scales.yW.grid) combinedChart.options.scales.yW.grid.color = gridColor;
        combinedChart.update('none');
    }
    if (dailyBarChart && dailyBarChart.options && dailyBarChart.options.scales) {
        if (dailyBarChart.options.scales.y && dailyBarChart.options.scales.y.grid) dailyBarChart.options.scales.y.grid.color = gridColor;
        dailyBarChart.update('none');
    }
}
const themeBtn = $('themeToggle');
if (themeBtn) themeBtn.addEventListener('click', () => {
    // Cycle: auto → dark → light → auto
    if (themeMode === 'auto') {
        themeMode = 'dark'; darkMode = true;
    } else if (themeMode === 'dark') {
        themeMode = 'light'; darkMode = false;
    } else {
        themeMode = 'auto'; darkMode = getAutoDark();
    }
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    applyTheme();
});

// Apply auto theme on load
if (themeMode === 'auto') darkMode = getAutoDark();
applyTheme();

Chart.defaults.color = darkMode ? '#888' : '#666';
Chart.defaults.borderColor = darkMode ? '#222' : '#e0e0e0';
Chart.defaults.font.family = '-apple-system, system-ui, sans-serif';

// Apply i18n after DOM is ready
applyI18n();

// === Notifications ===
let notifEnabled = localStorage.getItem('notif') === 'true';
let notifBatteryLowSent = false;
let notifSolarPeakSent = false;
let lastSolarForPeak = 0;
let solarWasAbove50 = false;

function updateNotifBtn() {
    const btn = $('notifToggle');
    if (btn) btn.classList.toggle('active', notifEnabled);
}
updateNotifBtn();

const notifBtn = $('notifToggle');
if (notifBtn) {
    notifBtn.addEventListener('click', async () => {
        if (!('Notification' in window)) { alert(t('notifNotSupported')); return; }
        if (!notifEnabled) {
            if (Notification.permission !== 'granted') {
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') return;
            }
            notifEnabled = true;
        } else {
            notifEnabled = false;
        }
        localStorage.setItem('notif', notifEnabled);
        updateNotifBtn();
    });
    // Double-tap bell = test notification
    notifBtn.addEventListener('dblclick', () => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            alert(t('notifNotSupported'));
            return;
        }
        new Notification('Test', { body: 'Push-Benachrichtigungen funktionieren!', icon: '/static/icon-192.png' });
    });
}

let notifBatteryFullSent = false;
let notifStormSent = false;
let notifTempHighSent = false;

function checkNotifications(d) {
    if (!notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    // Battery low (<20%)
    if (d.battery_soc < 20 && !notifBatteryLowSent) {
        new Notification(t('batteryLow'), { body: t('batteryAt').replace('{v}', d.battery_soc), icon: '/static/icon-192.png' });
        notifBatteryLowSent = true;
    }
    if (d.battery_soc >= 25) notifBatteryLowSent = false;
    // Battery full (100%)
    if (d.battery_soc >= 100 && !notifBatteryFullSent) {
        new Notification(t('batteryFull'), { body: t('batteryFullBody'), icon: '/static/icon-192.png' });
        notifBatteryFullSent = true;
    }
    if (d.battery_soc < 99) notifBatteryFullSent = false;
    // Temperature high (>40°C)
    const temp = d.temperature || 0;
    if (temp > 40 && !notifTempHighSent) {
        new Notification(t('tempWarning'), { body: t('tempWarningBody').replace('{v}', fmt.format(temp)), icon: '/static/icon-192.png' });
        notifTempHighSent = true;
    }
    if (temp <= 38) notifTempHighSent = false;
    // Solar peak detection
    const solar = d.solar_watts || 0;
    if (solar > 50) solarWasAbove50 = true;
    if (solarWasAbove50 && solar < lastSolarForPeak && lastSolarForPeak > 50 && !notifSolarPeakSent) {
        new Notification(t('solarPeak'), { body: t('peakAt').replace('{v}', fmt.format(lastSolarForPeak)), icon: '/static/icon-192.png' });
        notifSolarPeakSent = true;
    }
    if (solar < 10) { notifSolarPeakSent = false; solarWasAbove50 = false; }
    lastSolarForPeak = solar;
    // Daily report after sunset
    checkDailyReport(d);
}

// Daily solar report (after sunset)
let notifDailyReportSent = localStorage.getItem('dailyReportDate') || '';

function checkDailyReport(d) {
    if (!notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (!window._sunset) return;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    // Already sent today?
    if (notifDailyReportSent === today) return;
    // 15 min after sunset
    const triggerTime = new Date(window._sunset.getTime() + 15 * 60000);
    if (now < triggerTime) return;
    // Only if solar data was recorded today
    const kwh = d.daily_kwh || 0;
    if (kwh <= 0) return;
    const peak = d.daily_peak_watts || 0;
    const hours = d.solar_hours || 0;
    const eur = fmtEur.format(kwh * EUR_PER_KWH);
    const body = t('dailyReportBody')
        .replace('{kwh}', fmt2.format(kwh))
        .replace('{peak}', fmt.format(peak))
        .replace('{hours}', fmt.format(hours))
        .replace('{eur}', eur);
    new Notification(t('dailyReport'), { body, icon: '/static/icon-192.png' });
    notifDailyReportSent = today;
    localStorage.setItem('dailyReportDate', today);
}

// Storm warning check (called from weather/forecast)
function checkStormNotification(windKmh) {
    if (!notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (windKmh >= 60 && !notifStormSent) {
        new Notification(t('stormWarning'), { body: t('stormBody').replace('{v}', Math.round(windKmh)), icon: '/static/icon-192.png' });
        notifStormSent = true;
    }
    if (windKmh < 40) notifStormSent = false;
}

// === Offline detection ===
let isOffline = false;
function updateOfflineBanner(offline) {
    isOffline = offline;
    const banner = $('offlineBanner');
    if (banner) banner.style.display = offline ? '' : 'none';
}
window.addEventListener('online', () => updateOfflineBanner(false));
window.addEventListener('offline', () => updateOfflineBanner(true));
if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', e => {
        if (e.data && e.data.type === 'offline') updateOfflineBanner(true);
        if (e.data && e.data.type === 'online') updateOfflineBanner(false);
    });
}

// All metrics to chart
const metrics = [
    { key: 'solar_watts', color: '#f59e0b', log: true },
    { key: 'battery_soc', color: '#22c55e', log: false, max: 100, skipZero: true },
    { key: 'temperature', color: '#3b82f6', log: false, skipZero: true },
    { key: 'total_output_watts', color: '#c084fc', log: true },
    { key: 'ac_output_watts', color: '#a78bfa', log: true },
    { key: 'usbc_1_watts', color: '#f472b6', log: true },
    { key: 'usbc_2_watts', color: '#fb923c', log: true },
    { key: 'usbc_3_watts', color: '#34d399', log: true },
    { key: 'usba_1_watts', color: '#60a5fa', log: true },
    { key: 'dc_12v_watts', color: '#fbbf24', log: true },
    { key: 'ac_input_watts', color: '#38bdf8', log: true },
];

let currentPeriod = 'day';
const periodHours = { day: 24, week: 168, month: 720, year: 8760 };

function chartGridColor() {
    return document.body.classList.contains('light-mode') ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
}

function makeChart(m) {
    const gridColor = chartGridColor();
    const yScale = m.log ? {
        type: 'logarithmic', min: 0.5,
        grid: { color: gridColor },
        border: { display: false },
        ticks: {
            callback: v => v < 1 ? '' : (v >= 1000 ? (v/1000) + 'k' : v),
            maxTicksLimit: 5
        },
        afterBuildTicks: axis => { axis.ticks = axis.ticks.filter(t => t.value >= 1); }
    } : {
        type: 'linear', beginAtZero: true, max: m.max,
        grid: { color: gridColor },
        border: { display: false },
        ticks: { maxTicksLimit: 5 }
    };

    return new Chart($('chart_' + m.key), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: m.color, backgroundColor: m.color + '20', fill: true, pointRadius: 0, pointHitRadius: 10 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false, spanGaps: true,
            plugins: { legend: { display: false } },
            scales: {
                y: yScale,
                x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 6, maxRotation: 0 } }
            },
            elements: { line: { tension: 0.3, borderWidth: 2, cubicInterpolationMode: 'monotone', borderCapStyle: 'round', borderJoinStyle: 'round' } },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

function initCharts() {
    for (const m of metrics) {
        charts[m.key] = makeChart(m);
    }
}

function formatLabel(ts, period) {
    const d = new Date(ts);
    const days = t('dayNames');
    const months = t('monthNames');
    if (period === 'day') return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
    if (period === 'week') return days[d.getDay()] + ' ' + d.getHours() + ':00';
    if (period === 'month') return d.getDate() + '. ' + d.getHours() + ':00';
    return d.getDate() + '. ' + months[d.getMonth()];
}

async function loadAllCharts() {
    try {
        const hours = periodHours[currentPeriod];
        const res = await fetch(`/api/readings?hours=${hours}`);
        const rows = await res.json();
        const step = Math.max(1, Math.floor(rows.length / 600));
        const thinned = rows.filter((_, i) => i % step === 0);
        const labels = thinned.map(r => formatLabel(r.timestamp, currentPeriod));

        const gridColor = chartGridColor();
        for (const m of metrics) {
            const chart = charts[m.key];
            chart.data.labels = labels;
            chart.data.datasets[0].data = thinned.map(r => {
                const v = r[m.key] || 0;
                // Filter 0-spikes for battery/temperature (invalid MQTT data)
                if (m.skipZero && v === 0) return null;
                return m.log ? (v > 0 ? v : null) : v;
            });
            // Update grid colors for theme changes
            if (chart.options.scales.y) chart.options.scales.y.grid.color = gridColor;
            chart.update('none');
        }
    } catch (e) {
        console.warn('Chart load error:', e);
    }
}

// Tab switching
document.querySelectorAll('.tab[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab[data-period]').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = btn.dataset.period;
        loadAllCharts();
    });
});

// WebSocket (server pushes every 3s, no polling needed)
let lastTimestamp = '';

function connect() {
    // Load fresh data on connect (refresh=true forces MQTT cache read)
    fetch('/api/live?refresh=true').then(r => r.json()).then(d => {
        if (d && d.timestamp) { lastTimestamp = d.timestamp; updateUI(d); dot.classList.add('connected'); }
    }).catch(() => {});

    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(proto + '//' + location.host + '/ws');

    ws.onmessage = (e) => {
        try {
            const d = JSON.parse(e.data);
            if (!d) return;
            dot.classList.add('connected');
            // Always update ticker/heartbeat (shows system is alive)
            addTicker(d);
            // Only full UI update when data actually changed
            if (d.timestamp && d.timestamp !== lastTimestamp) {
                lastTimestamp = d.timestamp;
                updateUI(d);
            }
        } catch (err) {}
    };

    ws.onclose = () => {
        dot.classList.remove('connected');
        setTimeout(connect, 3000); // Reconnect after 3s
    };

    ws.onerror = () => { ws.close(); };
}

// Dynamic favicon with battery %
function updateFavicon(soc) {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.roundRect(0, 0, 64, 64, 12); ctx.fill();
    // Battery outline
    ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(10, 18, 44, 32, 5); ctx.stroke();
    // Battery terminal
    ctx.fillStyle = '#666';
    ctx.fillRect(54, 28, 4, 12);
    // Fill based on SOC
    const fillW = Math.max(0, Math.min(40, soc / 100 * 40));
    ctx.fillStyle = soc < 20 ? '#ef4444' : soc < 50 ? '#f59e0b' : '#22c55e';
    ctx.beginPath(); ctx.roundRect(12, 20, fillW, 28, 3); ctx.fill();
    // SOC text
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    ctx.fillText(soc + '%', 32, 40);
    // Set favicon
    let link = document.querySelector("link[rel='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = canvas.toDataURL('image/png');
    // Also update page title
    document.title = soc + '% | Anker Solix';
}

function updateUI(d) {
    $('solarWatts').textContent = fmt.format(d.solar_watts);
    $('batterySoc').textContent = d.battery_soc;
    updateFavicon(d.battery_soc);
    $('temperature').textContent = fmt.format(d.temperature);
    // Temperature visual (0-50°C range)
    const temp = d.temperature || 0;
    const tempPct = Math.min(100, Math.max(0, temp / 50 * 100));
    const tempBar = $('tempBar');
    const tempBulb = $('tempBulb');
    const tempVal = $('temperature')?.parentElement;
    const tempColor = temp < 15 ? 'var(--blue)' : temp < 35 ? 'var(--green)' : 'var(--red)';
    if (tempBar) { tempBar.style.height = tempPct + '%'; tempBar.style.background = tempColor; }
    if (tempBulb) tempBulb.style.background = tempColor;
    if (tempVal) tempVal.style.color = tempColor;

    $('totalOutput').textContent = fmt.format(d.total_output_watts);
    // Output bar visual (max 3000W peak)
    const outPct = Math.min(100, (d.total_output_watts || 0) / 3000 * 100);
    const outBar = $('outputBar');
    if (outBar) outBar.style.width = outPct + '%';
    const outPctEl = $('outputPct');
    if (outPctEl && d.total_output_watts > 0) outPctEl.textContent = Math.round(outPct) + '% von 3000W';

    // Solar panel visual (max 400W for 2×200W panels)
    const solarPct = Math.min(100, (d.solar_watts || 0) / 400 * 100);
    const solarBar = $('solarBar');
    if (solarBar) solarBar.style.height = solarPct + '%';
    const sunEl = $('solarSun');
    if (sunEl) sunEl.className = 'solar-sun' + (d.solar_watts > 0 ? ' active' : '');
    const solarPctEl = $('solarPct');
    if (solarPctEl && d.solar_watts > 0) solarPctEl.textContent = Math.round(solarPct) + '% von 400W';

    const bar = $('batteryBar');
    bar.style.height = d.battery_soc + '%';
    bar.className = 'bat-fill' + (d.battery_soc < 20 ? ' low' : d.battery_soc < 50 ? ' mid' : '');

    $('eToday').textContent = fmtWh(d.daily_kwh || 0);
    $('eOutToday').textContent = fmtWh(d.daily_output_kwh || 0);
    $('sToday').textContent = fmtEur.format(d.daily_savings_eur || 0) + ' \u20ac';

    const solar = d.solar_watts || 0;
    const output = d.total_output_watts || 0;
    const scEl = $('selfConsumption');
    if (scEl) {
        if (solar > 0) {
            const sc = Math.min(solar, output) / solar * 100;
            scEl.textContent = 'SV ' + Math.round(sc) + '%';
        } else {
            scEl.textContent = '--';
        }
    }

    if (currentPeriod === 'day') {
        const now = new Date();
        const label = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        for (const m of metrics) {
            const chart = charts[m.key];
            const v = d[m.key] || 0;
            chart.data.labels.push(label);
            chart.data.datasets[0].data.push(m.log ? (v > 0 ? v : null) : v);
            if (chart.data.labels.length > 300) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            chart.update('none');
        }
    }
}

async function loadEnergySummary() {
    try {
        const res = await fetch('/api/energy');
        const data = await res.json();
        for (const [period, ids] of [
            ['week', ['eWeek', 'eOutWeek', 'sWeek']],
            ['month', ['eMonth', 'eOutMonth', 'sMonth']],
            ['total', ['eTotal', 'eOutTotal', 'sTotal']],
        ]) {
            const d = data[period] || {};
            const el0 = $(ids[0]), el1 = $(ids[1]), el2 = $(ids[2]);
            if (el0) el0.textContent = fmtWh(d.solar_kwh || 0);
            if (el1) el1.textContent = fmtWh(d.output_kwh || 0);
            if (el2) el2.textContent = fmtEur.format(d.savings_eur || 0) + ' \u20ac';
        }
        updateAmortisation(data);
        updateCO2Table(data);
        updateWeekComparison(data);
        updateDashTotals(data);
    } catch (e) {
        console.warn('Energy summary error:', e);
    }
}

function formatCO2(kwh) {
    const kg = kwh * CO2_KG_PER_KWH;
    if (kg >= 1) return fmt.format(kg) + ' kg';
    return Math.round(kg * 1000) + ' g';
}

function updateCO2Table(energyData) {
    const todayKwh = accumulator_dailyKwh || 0;
    const el = $('co2Today');
    if (el) el.textContent = formatCO2(todayKwh);
    for (const [period, id] of [['week', 'co2Week'], ['month', 'co2Month'], ['total', 'co2Total']]) {
        const d = energyData[period] || {};
        const e = $(id);
        if (e) e.textContent = formatCO2(d.solar_kwh || 0);
    }
}

function updateDashTotals(energyData) {
    const total = energyData.total || {};
    const totalKwh = total.solar_kwh || 0;
    const totalEur = totalKwh * EUR_PER_KWH;
    const totalCo2 = totalKwh * CO2_KG_PER_KWH;
    const totalCafes = Math.floor(totalEur / CAFE_PRICE_EUR);

    const tickerEl = $('savingsTickerValue');
    if (tickerEl) tickerEl.textContent = fmtEur.format(totalEur) + ' \u20ac';
    const co2El = $('co2TodayValue');
    if (co2El) co2El.textContent = fmt.format(totalCo2) + ' kg';
    const cafeEl = $('cafeSavingsValue');
    if (cafeEl) cafeEl.textContent = totalCafes.toLocaleString(locale);
}

let tickerCount = 0;
const LOG_ROWS = [];
const LOG_PER_PAGE = 10;
let logPage = 0;
let _lastLogFingerprint = '';
let _historicLoaded = false;

function makeLogRow(num, time, solar, bat, temp, out, acIn) {
    return `<td>${num}</td>`
        + `<td>${time}</td>`
        + `<td class="${solar > 0 ? 'val-solar' : ''}">${fmt.format(solar)} W</td>`
        + `<td class="val-bat">${bat}%</td>`
        + `<td class="val-temp">${fmt.format(temp)}\u00b0</td>`
        + `<td class="${out > 0 ? 'val-active' : ''}">${fmt.format(out)} W</td>`
        + `<td class="${acIn > 0 ? 'val-active' : ''}">${fmt.format(acIn)} W</td>`;
}

function renderLogPage() {
    const logBody = $('mqttLogBody');
    logBody.innerHTML = '';
    const start = logPage * LOG_PER_PAGE;
    const end = Math.min(start + LOG_PER_PAGE, LOG_ROWS.length);
    for (let i = start; i < end; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = LOG_ROWS[i];
        logBody.appendChild(tr);
    }
    const totalPages = Math.ceil(LOG_ROWS.length / LOG_PER_PAGE);
    const info = $('logPageInfo');
    if (info) info.textContent = `${t('page')} ${logPage + 1} / ${totalPages} (${LOG_ROWS.length} ${t('entries')})`;
    const prevBtn = $('logPrev');
    const nextBtn = $('logNext');
    if (prevBtn) prevBtn.disabled = logPage <= 0;
    if (nextBtn) nextBtn.disabled = logPage >= totalPages - 1;
}

window.logPrevPage = function() { if (logPage > 0) { logPage--; renderLogPage(); } };
window.logNextPage = function() {
    const totalPages = Math.ceil(LOG_ROWS.length / LOG_PER_PAGE);
    if (logPage < totalPages - 1) { logPage++; renderLogPage(); }
};

function addTicker(d) {
    const ticker = $('ticker');
    tickerCount++;
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
    const dateStr = String(now.getDate()).padStart(2, '0') + '.' + String(now.getMonth() + 1).padStart(2, '0') + '.';
    const dateTime = dateStr + ' ' + time;

    const parts = [];
    if (d.solar_watts > 0) parts.push(`<span class="t-solar">Solar ${fmt.format(d.solar_watts)}W</span>`);
    parts.push(`<span class="t-bat">Bat ${d.battery_soc}%</span>`);
    if (d.total_output_watts > 0) parts.push(`<span class="t-out">Out ${fmt.format(d.total_output_watts)}W</span>`);
    if (d.ac_input_watts > 0) parts.push(`AC In ${fmt.format(d.ac_input_watts)}W`);
    parts.push(`${fmt.format(d.temperature)}C`);

    const msg = document.createElement('div');
    msg.className = 'ticker-msg';
    msg.innerHTML = `<span class="t-time">${time}</span> #${tickerCount} ${parts.join(' | ')}`;
    ticker.prepend(msg);
    while (ticker.children.length > 3) ticker.lastChild.remove();

    // Update heartbeat (always — shows system is alive)
    const hbTime = $('mqttHbTime');
    const hbDot = document.querySelector('.hb-dot');
    if (hbTime) hbTime.textContent = time;
    if (hbDot) { hbDot.classList.remove('inactive'); hbDot.style.animation = 'none'; void hbDot.offsetWidth; hbDot.style.animation = ''; }

    // MQTT Live-Log: always show latest live data as first row, add new row on value change
    const solar = d.solar_watts || 0;
    const out = d.total_output_watts || 0;
    const acIn = d.ac_input_watts || 0;
    const fp = `${solar}|${d.battery_soc}|${d.temperature}|${out}|${acIn}`;

    if (fp !== _lastLogFingerprint) {
        // Values changed → add new row
        LOG_ROWS.unshift(makeLogRow(tickerCount, dateTime, solar, d.battery_soc, d.temperature, out, acIn));
        _lastLogFingerprint = fp;
    } else if (_historicLoaded && LOG_ROWS.length > 0) {
        // Same values → update time on first row to show system is alive
        LOG_ROWS[0] = makeLogRow(tickerCount, dateTime, solar, d.battery_soc, d.temperature, out, acIn);
    }
    if (logPage === 0) renderLogPage();
}

async function loadHistoricLog() {
    try {
        const res = await fetch('/api/readings?hours=24');
        const rows = await res.json();
        // Clear any early live entries
        LOG_ROWS.length = 0;
        // Show only changes (dedup) + filter 0-spikes
        let lastFp = '';
        let num = 0;
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            const solar = r.solar_watts || 0;
            const bat = r.battery_soc || 0;
            const temp = r.temperature || 0;
            const out = r.total_output_watts || 0;
            const acIn = r.ac_input_watts || 0;
            // Skip 0-spike rows (invalid MQTT data)
            if (bat === 0 && temp === 0) continue;
            const fp = `${solar}|${bat}|${temp}|${out}|${acIn}`;
            if (fp === lastFp) continue; // Skip duplicates
            lastFp = fp;
            num++;
            const d = new Date(r.timestamp);
            const dateStr = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
            const time = dateStr + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
            LOG_ROWS.push(makeLogRow(num, time, solar, bat, temp, out, acIn));
        }
        // Reverse so newest is first
        LOG_ROWS.reverse();
        tickerCount = num;
        _lastLogFingerprint = lastFp;
        _historicLoaded = true;
        renderLogPage();
    } catch (e) {
        console.warn('Historic log error:', e);
    }
}

initCharts();
connect();
loadAllCharts();
loadEnergySummary();
loadHistoricLog();
setInterval(loadEnergySummary, 60000);
setInterval(() => { if (currentPeriod !== 'day') loadAllCharts(); }, 300000);

// === PWA Service Worker ===
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js').catch(() => {});
}

// === Weather ===
async function loadWeather() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.1928&longitude=21.0103&current=temperature_2m,weather_code,cloud_cover,direct_radiation,diffuse_radiation&daily=sunrise,sunset&hourly=uv_index&timezone=Europe%2FWarsaw&forecast_days=1&forecast_hours=1');
        const data = await res.json();
        const c = data.current;
        const weatherIcons = {
            0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫',
            51: '🌦', 53: '🌦', 55: '🌧', 61: '🌧', 63: '🌧', 65: '🌧',
            71: '🌨', 73: '🌨', 75: '❄️', 80: '🌦', 81: '🌧', 82: '⛈', 95: '⛈', 96: '⛈',
        };
        const wDesc = t('weatherCodes');
        const icon = weatherIcons[c.weather_code] || '🌡';
        const desc = wDesc[c.weather_code] || '?';
        $('weatherIcon').textContent = icon;
        $('weatherTemp').textContent = fmt.format(c.temperature_2m) + '°C';
        $('weatherDesc').textContent = desc;
        $('weatherClouds').textContent = c.cloud_cover + '% ' + t('clouds');
        const uv = data.hourly && data.hourly.uv_index ? data.hourly.uv_index[0] : null;
        const uvEl = $('weatherUV');
        if (uv != null) {
            const uvVal = Math.round(uv * 10) / 10;
            uvEl.textContent = 'UV ' + uvVal;
            uvEl.className = 'weather-uv uv-' + (uv >= 8 ? 'extreme' : uv >= 6 ? 'high' : uv >= 3 ? 'mid' : 'low');
        } else {
            uvEl.textContent = 'UV --';
            uvEl.className = 'weather-uv';
        }
        // Sunrise/Sunset
        if (data.daily && data.daily.sunrise && data.daily.sunset) {
            const rise = new Date(data.daily.sunrise[0]);
            const set = new Date(data.daily.sunset[0]);
            const riseStr = rise.getHours() + ':' + String(rise.getMinutes()).padStart(2, '0');
            const setStr = set.getHours() + ':' + String(set.getMinutes()).padStart(2, '0');
            const riseEl = $('sunRise');
            const setEl = $('sunSet');
            if (riseEl) riseEl.textContent = '🌅 ' + riseStr;
            if (setEl) setEl.textContent = '🌇 ' + setStr;
            window._sunrise = rise;
            window._sunset = set;
            // Trigger auto-theme now that we have sunrise/sunset
            checkAutoTheme();
        }
    } catch (e) {
        console.warn('Weather error:', e);
    }
}

loadWeather();
setInterval(loadWeather, 3600000); // 1h (Open-Meteo updates hourly)

// === Solar Forecast ===
const PANEL_KWP = 0.40;
const PANEL_EFFICIENCY = 0.85;

const CURVE_STRIPS = [
    { tilt: 56, weight: 2/5 },
    { tilt: 70, weight: 2/5 },
    { tilt: 75, weight: 1/5 },
];
const AZIMUTH = 60;

async function fetchGTI(tilt) {
    const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=52.1928&longitude=21.0103'
        + '&hourly=global_tilted_irradiance'
        + '&tilt=' + tilt + '&azimuth=' + AZIMUTH
        + '&timezone=Europe%2FWarsaw&forecast_days=7'
    );
    const data = await res.json();
    return data.hourly;
}

async function loadForecast() {
    try {
        const [dailyRes, ...stripResults] = await Promise.all([
            fetch('https://api.open-meteo.com/v1/forecast?latitude=52.1928&longitude=21.0103'
                + '&daily=sunshine_duration,weather_code,cloud_cover_mean,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max'
                + '&hourly=direct_radiation,diffuse_radiation'
                + '&timezone=Europe%2FWarsaw&forecast_days=7').then(r => r.json()),
            ...CURVE_STRIPS.map(s => fetchGTI(s.tilt))
        ]);

        const d = dailyRes.daily;
        const hBase = dailyRes.hourly;
        if (!d || !d.time || !hBase || !hBase.time) return;

        const dailyGTI = {};
        const dailyDirect = {};
        const dailyDiffuse = {};

        for (let i = 0; i < hBase.time.length; i++) {
            const day = hBase.time[i].slice(0, 10);
            if (!dailyGTI[day]) { dailyGTI[day] = 0; dailyDirect[day] = 0; dailyDiffuse[day] = 0; }
            let weightedGTI = 0;
            for (let s = 0; s < CURVE_STRIPS.length; s++) {
                const gti = stripResults[s].global_tilted_irradiance[i] || 0;
                weightedGTI += gti * CURVE_STRIPS[s].weight;
            }
            dailyGTI[day] += weightedGTI;
            dailyDirect[day] += (hBase.direct_radiation[i] || 0);
            dailyDiffuse[day] += (hBase.diffuse_radiation[i] || 0);
        }

        const days = t('dayNames');
        const weatherIcons = {
            0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫',
            51: '🌦', 53: '🌦', 55: '🌧', 61: '🌧', 63: '🌧', 65: '🌧',
            71: '🌨', 73: '🌨', 75: '❄️', 80: '🌦', 81: '🌧', 82: '⛈', 95: '⛈', 96: '⛈',
        };
        const todayStr = new Date().toISOString().slice(0, 10);
        const grid = $('forecastGrid');
        grid.innerHTML = '';

        let maxKwh = 0;
        let weekTotal = 0;
        let weekSunH = 0;
        for (let i = 0; i < d.time.length; i++) {
            const gti = dailyGTI[d.time[i]] || 0;
            const kwh = gti / 1000 * PANEL_KWP * PANEL_EFFICIENCY;
            weekTotal += kwh;
            weekSunH += (d.sunshine_duration[i] || 0) / 3600;
            if (kwh > maxKwh) maxKwh = kwh;
        }

        for (let i = 0; i < d.time.length; i++) {
            const dt = new Date(d.time[i]);
            const dayName = days[dt.getDay()];
            const sunH = Math.round((d.sunshine_duration[i] || 0) / 3600 * 10) / 10;
            const uv = Math.round((d.uv_index_max[i] || 0) * 10) / 10;
            const icon = weatherIcons[d.weather_code[i]] || '🌡';
            const isToday = d.time[i] === todayStr;

            const gti = dailyGTI[d.time[i]] || 0;
            const estKwh = Math.round(gti / 1000 * PANEL_KWP * PANEL_EFFICIENCY * 100) / 100;
            const barPct = maxKwh > 0 ? Math.round((estKwh / maxKwh) * 100) : 0;

            const direct = dailyDirect[d.time[i]] || 0;
            const diffuse = dailyDiffuse[d.time[i]] || 0;
            const totalRad = direct + diffuse;
            const directPct = totalRad > 0 ? Math.round(direct / totalRad * 100) : 0;

            const uvClass = uv >= 8 ? 'uv-extreme' : uv >= 6 ? 'uv-high' : uv >= 3 ? 'uv-mid' : 'uv-low';

            // Wind data
            const windSpeed = Math.round(d.wind_speed_10m_max ? d.wind_speed_10m_max[i] || 0 : 0);
            const windGusts = Math.round(d.wind_gusts_10m_max ? d.wind_gusts_10m_max[i] || 0 : 0);
            const windDanger = windGusts >= 60 ? ' fc-wind-danger' : windGusts >= 40 ? ' fc-wind-warn' : '';
            // Date string (e.g. "14.4.")
            const dateStr = dt.getDate() + '.' + (dt.getMonth() + 1) + '.';

            // Check storm notification for today/tomorrow
            if (i <= 1 && windGusts >= 60) checkStormNotification(windGusts);

            const div = document.createElement('div');
            div.className = 'fc-day' + (isToday ? ' fc-today' : '');
            div.innerHTML = `<div class="fc-name">${isToday ? t('today') : dayName}</div>`
                + `<div class="fc-date">${dateStr}</div>`
                + `<div class="fc-icon">${icon}</div>`
                + `<div class="fc-kwh">${estKwh}</div>`
                + `<div class="fc-kwh-label">kWh</div>`
                + `<div class="fc-bar"><div class="fc-bar-fill" style="height:${barPct}%"></div></div>`
                + `<div class="fc-sun">${sunH}h</div>`
                + `<div class="fc-wind${windDanger}" title="${t('wind')} ${windSpeed} km/h (${LANG === 'de' ? 'Böen' : 'gusts'} ${windGusts} km/h)">💨 ${windSpeed}<small>km/h</small></div>`
                + `<div class="fc-ratio" title="Direct ${directPct}% / Diffuse ${100 - directPct}%">`
                + `<div class="fc-ratio-icons"><span class="fc-ri-direct">☀</span><span class="fc-ri-diffuse">☁</span></div>`
                + `<div class="fc-ratio-bar"><div class="fc-ratio-direct" style="width:${directPct}%"></div><div class="fc-ratio-diffuse" style="width:${100 - directPct}%"></div></div>`
                + `<div class="fc-ratio-labels"><span class="fc-rl-direct">${directPct}%</span><span class="fc-rl-divider"></span><span class="fc-rl-diffuse">${100 - directPct}%</span></div></div>`
                + `<div class="fc-uv ${uvClass}">UV ${uv}</div>`;
            grid.appendChild(div);
        }

        let summary = $('forecastSummary');
        if (!summary) {
            summary = document.createElement('div');
            summary.id = 'forecastSummary';
            summary.className = 'fc-summary';
            grid.parentNode.insertBefore(summary, grid.nextSibling);
        }
        const avgKwh = Math.round(weekTotal / d.time.length * 100) / 100;
        const IPHONE_WH = 17.3;
        const MACBOOK_WH = 52.6;
        const weekChargesPhone = Math.floor(weekTotal * 1000 / IPHONE_WH);
        const dayChargesPhone = Math.floor(avgKwh * 1000 / IPHONE_WH);
        const weekChargesMac = Math.floor(weekTotal * 1000 / MACBOOK_WH * 10) / 10;
        const dayChargesMac = Math.floor(avgKwh * 1000 / MACBOOK_WH * 10) / 10;
        summary.innerHTML = `<div class="fc-sum-row">`
            + `<div class="fc-sum-item"><span class="fc-sum-value">${Math.round(weekTotal * 100) / 100}</span><span class="fc-sum-label">${t('kwhWeek')}</span></div>`
            + `<div class="fc-sum-item"><span class="fc-sum-value">${avgKwh}</span><span class="fc-sum-label">${t('avgKwhDay')}</span></div>`
            + `<div class="fc-sum-item"><span class="fc-sum-value">${Math.round(weekSunH)}</span><span class="fc-sum-label">${t('sunHours')}</span></div>`
            + `</div>`
            + `</div>`;

        // Update separate charge equivalents section
        const ceEl = $('chargeEquivContent');
        if (ceEl) {
            ceEl.innerHTML = `<div class="fc-devices">`
                + `<div class="fc-device"><div class="fc-dev-icon">📱</div><div class="fc-dev-name">iPhone 15 Pro Max</div><div class="fc-dev-line"><span class="fc-dev-num">${weekChargesPhone}×</span> ${t('perWeek')}</div><div class="fc-dev-line"><span class="fc-dev-num">${dayChargesPhone}×</span> ${t('perDay')}</div></div>`
                + `<div class="fc-device"><div class="fc-dev-icon">💻</div><div class="fc-dev-name">MacBook Air M4 13"</div><div class="fc-dev-line"><span class="fc-dev-num">${weekChargesMac}×</span> ${t('perWeek')}</div><div class="fc-dev-line"><span class="fc-dev-num">${dayChargesMac}×</span> ${t('perDay')}</div></div>`
                + `</div>`;
        }

        window._forecastKwh = {};
        for (let i = 0; i < d.time.length; i++) {
            const gti = dailyGTI[d.time[i]] || 0;
            window._forecastKwh[d.time[i]] = Math.round(gti / 1000 * PANEL_KWP * PANEL_EFFICIENCY * 100) / 100;
        }
        updateExpectedSolar();

        $('forecastBox').style.display = '';

        if (typeof loadForecastVsReal === 'function') loadForecastVsReal();
    } catch (e) {
        console.warn('Forecast error:', e);
    }
}

function updateExpectedSolar() {}

loadForecast();
setInterval(loadForecast, 3600000);

// === Power Flow Update ===
function updatePowerFlow(d) {
    const solar = d.solar_watts || 0;
    const acIn = d.ac_input_watts || 0;
    const acOut = d.ac_output_watts || 0;
    const usbc1 = d.usbc_1_watts || 0;
    const usbc2 = d.usbc_2_watts || 0;
    const usbc3 = d.usbc_3_watts || 0;
    const usba1 = d.usba_1_watts || 0;
    const dc12v = d.dc_12v_watts || 0;
    const totalIn = solar + acIn;
    const totalOut = acOut + usbc1 + usbc2 + usbc3 + usba1 + dc12v;

    $('flowSolarVal').textContent = fmt.format(solar) + ' W';
    $('flowAcInVal').textContent = fmt.format(acIn) + ' W';
    $('flowAcOutVal').textContent = fmt.format(acOut) + ' W';
    $('flowUsbc1Val').textContent = fmt.format(usbc1) + ' W';
    $('flowUsbc2Val').textContent = fmt.format(usbc2) + ' W';
    $('flowUsbc3Val').textContent = fmt.format(usbc3) + ' W';
    $('flowUsba1Val').textContent = fmt.format(usba1) + ' W';
    $('flowDc12vVal').textContent = fmt.format(dc12v) + ' W';
    $('flowBatSoc').textContent = d.battery_soc + '%';

    const batFill = $('flowBatFill');
    if (batFill) batFill.style.height = d.battery_soc + '%';

    $('flowSolar').classList.toggle('active', solar > 0);
    $('flowAcIn').classList.toggle('active', acIn > 0);
    $('flowAcOut').classList.toggle('active', acOut > 0);
    $('flowUsbc1').classList.toggle('active', usbc1 > 0);
    $('flowUsbc2').classList.toggle('active', usbc2 > 0);
    $('flowUsbc3').classList.toggle('active', usbc3 > 0);
    $('flowUsba1').classList.toggle('active', usba1 > 0);
    $('flowDc12v').classList.toggle('active', dc12v > 0);
    $('flowArrowIn').classList.toggle('active', totalIn > 0);
    $('flowArrowOut').classList.toggle('active', totalOut > 0);
}

// === Battery Time ===
function updateBatteryTime(d) {
    const el = $('batteryTime');
    if (d.battery_time_hours != null && d.battery_time_hours > 0) {
        const totalMin = Math.round(d.battery_time_hours * 60);
        const days = Math.floor(totalMin / 1440);
        const hrs = Math.floor((totalMin % 1440) / 60);
        const mins = totalMin % 60;
        let timeStr = '';
        if (days > 0) timeStr += days + 'd ';
        if (hrs > 0) timeStr += hrs + 'h ';
        timeStr += mins + 'min';
        el.textContent = d.battery_charging ? t('fullIn') + timeStr : t('emptyIn') + timeStr;
        el.style.color = d.battery_charging ? '#3b82f6' : '#ef4444';
    } else {
        if (d.battery_soc >= 100) {
            el.textContent = t('fullyCharged');
            el.style.color = '#22c55e';
        } else {
            el.textContent = 'Standby · ' + d.battery_soc + '%';
            el.style.color = '#888';
        }
    }
}

// === Daily Bar Chart ===
async function loadDailyBars() {
    try {
        const res = await fetch('/api/daily?days=30');
        const data = await res.json();
        const labels = data.map(d => {
            const dt = new Date(d.date);
            return dt.getDate() + '.' + (dt.getMonth() + 1) + '.';
        });
        const solarData = data.map(d => d.solar_kwh || 0);
        const outputData = data.map(d => d.total_output_kwh || 0);

        if (dailyBarChart) dailyBarChart.destroy();
        dailyBarChart = new Chart($('chart_daily_bars'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: t('solarKwh'), data: solarData,
                        borderColor: '#f59e0b', backgroundColor: '#f59e0b1a', fill: true,
                        tension: 0.45, borderWidth: 2.5, cubicInterpolationMode: 'monotone',
                        borderCapStyle: 'round', borderJoinStyle: 'round',
                        pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: '#f59e0b',
                    },
                    {
                        label: t('consumptionKwh'), data: outputData,
                        borderColor: '#22c55e', backgroundColor: '#22c55e1a', fill: true,
                        tension: 0.45, borderWidth: 2.5, cubicInterpolationMode: 'monotone',
                        borderCapStyle: 'round', borderJoinStyle: 'round',
                        pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: '#22c55e',
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: chartGridColor() }, ticks: { maxTicksLimit: 5 } },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 10, maxRotation: 45, font: { size: 9 } } }
                }
            }
        });
    } catch (e) { console.warn('Daily bars error:', e); }
}

loadDailyBars();

// === SOH Trend Chart ===
async function loadSohChart() {
    try {
        const res = await fetch('/api/soh');
        const data = await res.json();
        if (!data.length) return;

        const labels = data.map(d => {
            const dt = new Date(d.date);
            return dt.getDate() + '.' + (dt.getMonth() + 1) + '.';
        });
        const sohData = data.map(d => d.soh);

        if (sohChart) sohChart.destroy();
        sohChart = new Chart($('chart_soh'), {
            type: 'line',
            data: { labels: labels, datasets: [{ data: sohData, borderColor: '#22c55e', backgroundColor: '#22c55e1a', fill: true }] },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 80, max: 100, grid: { color: chartGridColor() }, ticks: { maxTicksLimit: 5, callback: v => v + '%' } },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0, font: { size: 9 } } }
                },
                elements: { point: { radius: 3, hitRadius: 10, backgroundColor: '#22c55e' }, line: { tension: 0.45, borderWidth: 2.5, cubicInterpolationMode: 'monotone', borderCapStyle: 'round', borderJoinStyle: 'round' } }
            }
        });
    } catch (e) { console.warn('SOH chart error:', e); }
}

loadSohChart();

// === Combined MQTT Overview Chart ===
let combinedPeriod = 'day';

async function loadCombinedChart(hours) {
    if (!hours) hours = periodHours[combinedPeriod] || 24;
    try {
        const res = await fetch('/api/readings?hours=' + hours);
        const rows = await res.json();
        if (!rows.length) return;

        const step = Math.max(1, Math.floor(rows.length / 800));
        const data = rows.filter((_, i) => i % step === 0);
        const labels = data.map(r => formatLabel(r.timestamp, combinedPeriod));

        const mkDs = (label, key, color, yAxis, dash, logNull) => ({
            label, data: data.map(r => { const v = r[key] || 0; return logNull && v <= 0 ? null : v; }),
            borderColor: color, backgroundColor: color + '1a', fill: false,
            tension: 0.45, borderWidth: 2, cubicInterpolationMode: 'monotone', borderCapStyle: 'round',
            pointRadius: 0, pointHitRadius: 8, yAxisID: yAxis, borderDash: dash || [], spanGaps: true,
        });

        const datasets = [
            mkDs('☀ Solar', 'solar_watts', '#f59e0b', 'yW', [], true),
            mkDs('⚡ Out', 'total_output_watts', '#a78bfa', 'yW', [], true),
            mkDs('🔌 AC In', 'ac_input_watts', '#38bdf8', 'yW', [], true),
            mkDs('🔋 Bat%', 'battery_soc', '#22c55e', 'yPct'),
            mkDs('🌡 Temp', 'temperature', '#3b82f6', 'yTemp', [4, 2]),
        ];

        if (combinedChart) combinedChart.destroy();
        combinedChart = new Chart($('chart_combined'), {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: true, position: 'top', labels: { boxWidth: 8, boxHeight: 8, font: { size: 8 }, padding: 6, usePointStyle: true, pointStyle: 'line' } },
                    tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt.format(ctx.parsed.y) } }
                },
                scales: {
                    yW: { type: 'logarithmic', position: 'left', min: 0.5, grid: { color: chartGridColor() },
                        ticks: { maxTicksLimit: 6, font: { size: 9 }, callback: v => v < 1 ? '' : (v >= 1000 ? (v/1000)+'kW' : v+'W') },
                        afterBuildTicks: axis => { axis.ticks = axis.ticks.filter(t => t.value >= 1); } },
                    yPct: { type: 'linear', position: 'right', min: 0, max: 100, grid: { display: false },
                        ticks: { maxTicksLimit: 5, font: { size: 9 }, callback: v => v + '%' } },
                    yTemp: { type: 'linear', position: 'right', display: false, beginAtZero: true },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0, font: { size: 9 } } }
                },
                elements: { line: { tension: 0.45, cubicInterpolationMode: 'monotone', borderCapStyle: 'round', borderJoinStyle: 'round' } }
            }
        });
    } catch (e) { console.warn('Combined chart error:', e); }
}

loadCombinedChart();

// === Daily Stats ===
async function loadDailyStats(days) {
    if (days === undefined) days = 1;
    document.querySelectorAll('.stats-tabs .tab').forEach(t => {
        t.classList.toggle('active', parseInt(t.dataset.stats) === days);
    });
    try {
        const res = await fetch('/api/daily-stats?days=' + days);
        const data = await res.json();
        if (!data.length) {
            $('statPeakSolar').textContent = '--';
            $('statAvgSolar').textContent = '--';
            $('statAvgTemp').textContent = '--';
            $('statPeakOutput').textContent = '--';
            $('statMinSoc').textContent = '--';
            $('statMaxSoc').textContent = '--';
            return;
        }
        let peakSolar = 0, sumSolar = 0, sumTemp = 0, peakOutput = 0, minSoc = 100, maxSoc = 0;
        for (const d of data) {
            if (d.peak_solar > peakSolar) peakSolar = d.peak_solar;
            sumSolar += d.avg_solar || 0;
            sumTemp += d.avg_temp || 0;
            if (d.peak_output > peakOutput) peakOutput = d.peak_output;
            if (d.min_soc < minSoc) minSoc = d.min_soc;
            if (d.max_soc > maxSoc) maxSoc = d.max_soc;
        }
        $('statPeakSolar').textContent = fmt.format(peakSolar);
        $('statAvgSolar').textContent = fmt.format(sumSolar / data.length);
        $('statAvgTemp').textContent = fmt.format(sumTemp / data.length);
        $('statPeakOutput').textContent = fmt.format(peakOutput);
        $('statMinSoc').textContent = minSoc;
        $('statMaxSoc').textContent = maxSoc;
    } catch (e) { console.warn('Stats error:', e); }
}

loadDailyStats(1);

// === CSV Export ===
function downloadCSV(hours) { window.location.href = '/api/csv?hours=' + hours; }

// === Hook new features into updateUI ===
const _origUpdateUI = updateUI;
updateUI = function(d) {
    _origUpdateUI(d);
    updatePowerFlow(d);
    updateBatteryTime(d);
    checkNotifications(d);
};

// === Combined Chart Period Picker ===
document.querySelectorAll('.combined-tabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.combined-tabs .tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        combinedPeriod = btn.dataset.combined;
        loadCombinedChart(periodHours[combinedPeriod]);
    });
});

// === Forecast vs. Reality Chart ===
let forecastVsRealChart = null;

async function loadForecastVsReal() {
    try {
        if (!window._forecastKwh) return;
        const res = await fetch('/api/daily?days=7');
        const dailyData = await res.json();
        if (!dailyData.length) return;

        const forecastDates = Object.keys(window._forecastKwh).sort();
        const allDates = [...new Set([...forecastDates, ...dailyData.map(d => d.date)])].sort();
        const dates = allDates.filter(d => forecastDates.includes(d));
        if (!dates.length) return;

        const dailyMap = {};
        for (const d of dailyData) dailyMap[d.date] = d.solar_kwh || 0;

        const days = t('dayNames');
        const labels = dates.map(d => {
            const dt = new Date(d);
            return days[dt.getDay()] + ' ' + dt.getDate() + '.';
        });

        const forecastData = dates.map(d => window._forecastKwh[d] || 0);
        const actualData = dates.map(d => dailyMap[d] || 0);

        // Calculate per-day accuracy
        const accuracyData = dates.map((d, i) => {
            const f = forecastData[i], a = actualData[i];
            if (f > 0 && a > 0) return Math.max(0, Math.round((1 - Math.abs(f - a) / f) * 100));
            return null;
        });

        if (forecastVsRealChart) forecastVsRealChart.destroy();
        forecastVsRealChart = new Chart($('chart_forecast_vs_real'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: t('forecast'), data: forecastData, backgroundColor: 'rgba(245, 158, 11, 0.35)', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 4 },
                    { label: t('actual'), data: actualData, backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 4 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: { callbacks: { label: ctx => {
                        let tip = ctx.dataset.label + ': ' + fmt2.format(ctx.parsed.y) + ' kWh';
                        if (ctx.datasetIndex === 1 && accuracyData[ctx.dataIndex] != null) tip += ' (' + accuracyData[ctx.dataIndex] + '%)';
                        return tip;
                    } } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: chartGridColor() }, ticks: { maxTicksLimit: 5, callback: v => v + ' kWh' } },
                    x: { grid: { display: false } }
                }
            },
            plugins: [{
                id: 'accuracyLabels',
                afterDatasetsDraw(chart) {
                    const ctx2 = chart.ctx;
                    const meta = chart.getDatasetMeta(1);
                    ctx2.font = 'bold 9px system-ui';
                    ctx2.textAlign = 'center';
                    meta.data.forEach((bar, i) => {
                        const acc = accuracyData[i];
                        if (acc == null) return;
                        ctx2.fillStyle = acc >= 80 ? '#22c55e' : acc >= 60 ? '#eab308' : '#ef4444';
                        ctx2.fillText(acc + '%', bar.x, bar.y - 4);
                    });
                }
            }]
        });

        $('forecastVsRealBox').style.display = '';

        // Calculate forecast accuracy (MAPE)
        updateForecastAccuracy(forecastData, actualData);
    } catch (e) { console.warn('Forecast vs Real error:', e); }
}

setTimeout(loadForecastVsReal, 5000);

// === Payback Calculator ===
function updateAmortisation(energyData) {
    try {
        const total = energyData.total || {};
        const totalSavedEur = (total.solar_kwh || 0) * EUR_PER_KWH;
        const remaining = Math.max(0, SYSTEM_COST_EUR - totalSavedEur);
        const pct = Math.min(100, totalSavedEur / SYSTEM_COST_EUR * 100);

        $('amortSaved').textContent = Math.round(totalSavedEur).toLocaleString(locale) + ' €';
        $('amortProgressLabel').textContent = Math.round(pct) + '%';
        // SVG ring progress
        const ringFill = $('amortRingFill');
        if (ringFill) {
            const circ = 326.73;
            ringFill.setAttribute('stroke-dashoffset', (circ - circ * pct / 100).toFixed(1));
        }

        const month = energyData.month || {};
        const monthSavedEur = (month.solar_kwh || 0) * EUR_PER_KWH;
        if (monthSavedEur > 0 && remaining > 0) {
            const monthsRemaining = remaining / monthSavedEur;
            const payoffDate = new Date();
            payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(monthsRemaining));
            const months = t('monthNames');
            $('amortPayoff').textContent = t('expectedPayback') + ' ' + months[payoffDate.getMonth()] + ' ' + payoffDate.getFullYear();
            // ROI Countdown
            const daysRemaining = Math.ceil(monthsRemaining * 30.44);
            const roiEl = $('roiDays');
            if (roiEl) roiEl.textContent = daysRemaining.toLocaleString(locale);
        } else if (remaining <= 0) {
            $('amortPayoff').textContent = t('paidOff');
            $('amortPayoff').style.color = '#22c55e';
            const roiEl = $('roiDays');
            if (roiEl) { roiEl.textContent = t('roiDone'); roiEl.style.fontSize = '1rem'; }
            const roiLabel = $('roiCountdown')?.querySelector('.roi-label');
            if (roiLabel) roiLabel.style.display = 'none';
        } else {
            $('amortPayoff').textContent = t('noMonthlyData');
        }
        // CO₂ total in amort section
        const co2Total = (total.solar_kwh || 0) * CO2_KG_PER_KWH;
        const co2TotalEl = $('co2TotalValue');
        if (co2TotalEl) co2TotalEl.textContent = fmt.format(co2Total);
        // Total kWh produced
        const totalKwhEl = $('totalKwhValue');
        if (totalKwhEl) totalKwhEl.textContent = fmt.format(total.solar_kwh || 0);
    } catch (e) { console.warn('Amort error:', e); }
}

// === Pull-to-Refresh ===
(function initPullToRefresh() {
    let startY = 0;
    let pulling = false;
    const threshold = 80;

    document.addEventListener('touchstart', e => {
        if (window.scrollY === 0) { startY = e.touches[0].clientY; pulling = true; }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (!pulling) return;
        const dy = e.touches[0].clientY - startY;
        if (dy > threshold / 2 && window.scrollY === 0) $('ptrIndicator').classList.add('visible');
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!pulling) return;
        pulling = false;
        const indicator = $('ptrIndicator');
        if (indicator.classList.contains('visible')) {
            Promise.all([loadAllCharts(), loadEnergySummary(), loadWeather(), loadForecast()])
                .finally(() => { setTimeout(() => indicator.classList.remove('visible'), 600); });
        }
    }, { passive: true });
})();

// === Data Backup ===
function downloadFullBackup() {
    localStorage.setItem('lastBackup', new Date().toISOString());
    window.location.href = '/api/backup';
    setTimeout(checkBackupReminder, 500);
}

function checkBackupReminder() {
    const lastBackup = localStorage.getItem('lastBackup');
    const hintEl = $('backupHint');
    if (!hintEl) return;
    if (!lastBackup) {
        hintEl.textContent = t('noBackup');
        return;
    }
    const daysSince = Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000);
    if (daysSince > 7) {
        hintEl.textContent = t('backupOld').replace('{d}', daysSince);
        hintEl.style.color = '#ef4444';
    } else {
        hintEl.textContent = t('backupRecent').replace('{date}', new Date(lastBackup).toLocaleDateString(locale)).replace('{d}', daysSince);
        hintEl.style.color = '';
    }
}

checkBackupReminder();

// === Solar Score Widget ===
function updateSolarScore() {
    const todayKwh = accumulator_dailyKwh || 0;
    const forecastKwh = window._forecastKwh ? window._forecastKwh[new Date().toISOString().slice(0, 10)] || 0 : 0;
    const scorePct = forecastKwh > 0 ? Math.min(100, Math.round(todayKwh / forecastKwh * 100)) : 0;

    const arc = $('scoreArc');
    if (arc) {
        const circumference = 163.36; // 2 * PI * 26
        arc.setAttribute('stroke-dashoffset', circumference - (circumference * scorePct / 100));
    }
    const pctEl = $('scorePct');
    if (pctEl) pctEl.textContent = scorePct + '%';

    const producedEl = $('scoreProduced');
    const potentialEl = $('scorePotential');
    if (producedEl) producedEl.textContent = fmtWh(todayKwh);
    if (potentialEl) potentialEl.textContent = fmtWh(forecastKwh);
}

let accumulator_dailyKwh = 0;

// === Device Status Bar + Extended MQTT fields ===
function updateDeviceStatus(d) {
    // AC/DC switch dots
    const acDot = $('acSwitchDot');
    const dcDot = $('dcSwitchDot');
    if (acDot) acDot.className = 'ds-dot' + (d.ac_switch ? ' on' : '');
    if (dcDot) dcDot.className = 'ds-dot' + (d.dc_switch ? ' on' : '');
    // SOC limits
    const limEl = $('socLimitsValue');
    if (limEl && d.min_soc != null && d.max_soc != null) {
        limEl.textContent = d.min_soc + '–' + d.max_soc + '%';
    }
    // AC input limit
    const acLimEl = $('acLimitValue');
    if (acLimEl && d.ac_input_limit) acLimEl.textContent = d.ac_input_limit + ' W';
    // Port status badges in power flow
    const portStatusMap = { 0: '', 1: 'discharging', 2: 'charging' };
    const portStatusText = { 0: '', 1: t('portDischarging'), 2: t('portCharging') };
    for (const [field, nodeId] of [
        ['usbc_1_status', 'flowUsbc1'], ['usbc_2_status', 'flowUsbc2'],
        ['usbc_3_status', 'flowUsbc3'], ['usba_1_status', 'flowUsba1']
    ]) {
        const status = d[field] || 0;
        const node = $(nodeId);
        if (node) {
            let badge = node.querySelector('.port-status');
            if (status > 0) {
                if (!badge) { badge = document.createElement('span'); badge.className = 'port-status'; node.appendChild(badge); }
                badge.textContent = portStatusText[status];
                badge.className = 'port-status ' + portStatusMap[status];
            } else if (badge) {
                badge.remove();
            }
        }
    }
    // Device info section
    const clEl = $('diChargeLimits');
    if (clEl) clEl.textContent = (d.min_soc || 0) + '% – ' + (d.max_soc || 100) + '%';
    const alEl = $('diAcLimit');
    if (alEl) alEl.textContent = d.ac_input_limit ? d.ac_input_limit + ' W' : '--';
    const dispEl = $('diDisplay');
    if (dispEl) {
        const modes = ['Aus', 'Low', 'Mid', 'High'];
        dispEl.textContent = d.display_switch ? (modes[d.display_mode] || 'An') : 'Aus';
    }
}

// Hook into updateUI to track daily kwh for score + savings ticker + CO₂
const _origUpdateUI2 = updateUI;
updateUI = function(d) {
    _origUpdateUI2(d);
    updateDeviceStatus(d);
    accumulator_dailyKwh = d.daily_kwh || 0;
    updateSolarScore();
};

// === Share Button ===
const shareBtn = $('shareBtn');
if (shareBtn) shareBtn.addEventListener('click', async () => {
    const kwh = accumulator_dailyKwh || 0;
    const forecastKwh = window._forecastKwh ? window._forecastKwh[new Date().toISOString().slice(0, 10)] || 0 : 0;
    const score = forecastKwh > 0 ? Math.min(100, Math.round(kwh / forecastKwh * 100)) : 0;
    const text = t('shareText').replace('{kwh}', fmt2.format(kwh)).replace('{score}', score);

    if (navigator.share) {
        try {
            await navigator.share({ title: t('shareTitle'), text: text });
        } catch (e) { /* user cancelled */ }
    } else {
        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(text);
            shareBtn.innerHTML = '&#x2705;';
            setTimeout(() => { shareBtn.innerHTML = '&#x1F4E4;'; }, 2000);
        } catch (e) { /* ignore */ }
    }
});

// === Heatmap Calendar (GitHub-style) ===
async function loadHeatmap() {
    try {
        const res = await fetch('/api/daily?days=365');
        const data = await res.json();
        if (!data.length) return;

        const dailyMap = {};
        let maxKwh = 0;
        for (const d of data) {
            dailyMap[d.date] = d.solar_kwh || 0;
            if (d.solar_kwh > maxKwh) maxKwh = d.solar_kwh;
        }

        // Build legend
        const legendEl = $('heatmapLegend');
        if (legendEl) {
            const levels = [0, maxKwh * 0.1, maxKwh * 0.25, maxKwh * 0.5, maxKwh * 0.75, maxKwh];
            legendEl.innerHTML = `<span>${t('less')}</span>`
                + '<div class="heatmap-legend-cell" style="background:var(--card-border)"></div>'
                + '<div class="heatmap-legend-cell h-1"></div>'
                + '<div class="heatmap-legend-cell h-2"></div>'
                + '<div class="heatmap-legend-cell h-3"></div>'
                + '<div class="heatmap-legend-cell h-4"></div>'
                + '<div class="heatmap-legend-cell h-5"></div>'
                + `<span>${t('more')}</span>`;
        }

        // Build grid - last 365 days
        const wrap = $('heatmapWrap');
        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364);
        // Align to start of week (Monday)
        while (startDate.getDay() !== 1) startDate.setDate(startDate.getDate() - 1);

        const cursor = new Date(startDate);
        while (cursor <= today) {
            const dateStr = cursor.toISOString().slice(0, 10);
            const kwh = dailyMap[dateStr] || 0;
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            if (kwh > 0 && maxKwh > 0) {
                const ratio = kwh / maxKwh;
                const level = ratio >= 0.75 ? 'h-5' : ratio >= 0.5 ? 'h-4' : ratio >= 0.25 ? 'h-3' : ratio >= 0.1 ? 'h-2' : 'h-1';
                cell.classList.add(level);
            }
            cell.setAttribute('data-date', cursor.getDate() + '.' + (cursor.getMonth() + 1) + '.');
            cell.setAttribute('data-kwh', fmt2.format(kwh));
            grid.appendChild(cell);
            cursor.setDate(cursor.getDate() + 1);
        }

        wrap.innerHTML = '';
        wrap.appendChild(grid);
    } catch (e) { console.warn('Heatmap error:', e); }
}

loadHeatmap();

// === Forecast Accuracy (MAPE) ===
function updateForecastAccuracy(forecastData, actualData) {
    if (!forecastData.length || !actualData.length) return;
    let sumApe = 0;
    let count = 0;
    for (let i = 0; i < forecastData.length; i++) {
        const f = forecastData[i];
        const a = actualData[i];
        if (f > 0 && a > 0) {
            sumApe += Math.abs(f - a) / f;
            count++;
        }
    }
    if (count === 0) return;
    const mape = sumApe / count * 100;
    const accuracy = Math.max(0, Math.round(100 - mape));
    const badge = $('forecastAccuracy');
    if (badge) {
        badge.textContent = t('forecastAccuracyLabel') + ': ' + accuracy + '%';
        badge.style.color = accuracy >= 80 ? 'var(--green)' : accuracy >= 60 ? 'var(--yellow)' : 'var(--red)';
    }
}

// === Battery Cycle Tracker ===
// Reads pre-computed cycle stats from the server (RAM-tracked every 3s,
// persisted in data/battery_cycles.json). Replaces the old client-side
// computation that fetched a full year of /api/readings on each page load.
async function loadBatteryCycles() {
    try {
        const res = await fetch('/api/battery-cycles');
        if (!res.ok) return;
        const s = await res.json();

        const totalCycles = Math.round((s.total_cycles || 0) * 10) / 10;
        const todayCycles = Math.round((s.today_cycles || 0) * 100) / 100;
        const remaining = Math.max(0, Math.round(3000 - totalCycles));
        const pct = Math.min(100, totalCycles / 3000 * 100);

        $('cycleTotalCount').textContent = fmt.format(totalCycles);
        $('cycleTodayCount').textContent = fmt2.format(todayCycles);
        $('cycleRemaining').textContent = remaining.toLocaleString(locale);
        $('cycleProgressFill').style.width = pct + '%';
        $('cycleProgressLabel').textContent = fmt.format(pct) + '%';

        const cyclesPerDay = s.cycles_per_day || 0;
        const hint = $('cycleHint');
        if (hint && cyclesPerDay > 0) {
            const yearsLeft = remaining / cyclesPerDay / 365;
            hint.textContent = t('cycleEstimate')
                .replace('{rate}', fmt2.format(cyclesPerDay))
                .replace('{years}', fmt.format(yearsLeft));
        }
    } catch (e) { console.warn('Battery cycles error:', e); }
}

loadBatteryCycles();

// === Usage Pattern Detection ===
async function loadUsagePatterns() {
    try {
        const res = await fetch('/api/readings?hours=168'); // 7 days
        const rows = await res.json();
        if (rows.length < 100) {
            const el = $('usagePatternsContent');
            if (el) el.innerHTML = `<div class="usage-empty">${t('noPatterns')}</div>`;
            return;
        }

        // Aggregate output watts by hour across days
        const hourBuckets = {};
        for (let h = 0; h < 24; h++) hourBuckets[h] = [];

        for (const r of rows) {
            const d = new Date(r.timestamp);
            const hour = d.getHours();
            const out = r.total_output_watts || 0;
            if (out > 5) hourBuckets[hour].push(out);
        }

        // Find hours with consistent high usage (>50% of readings have output)
        const patterns = [];
        for (let h = 0; h < 24; h++) {
            const bucket = hourBuckets[h];
            const totalReadingsPerHour = rows.filter(r => new Date(r.timestamp).getHours() === h).length;
            if (bucket.length > totalReadingsPerHour * 0.3 && bucket.length >= 10) {
                const avg = bucket.reduce((a, b) => a + b, 0) / bucket.length;
                if (avg > 10) {
                    // Determine likely device
                    let icon = '🔌';
                    let desc = t('regularUsage');
                    if (avg > 200) { icon = '🖥️'; desc = LANG === 'de' ? 'Schwerer Verbraucher' : 'Heavy consumer'; }
                    else if (avg > 60) { icon = '💻'; desc = LANG === 'de' ? 'Laptop/Monitor' : 'Laptop/Monitor'; }
                    else if (avg > 20) { icon = '📱'; desc = LANG === 'de' ? 'Laden/Kleingerät' : 'Charging/Small device'; }
                    else { icon = '💡'; desc = LANG === 'de' ? 'Standby/LED' : 'Standby/LED'; }

                    patterns.push({ hour: h, avg: Math.round(avg), icon, desc, freq: Math.round(bucket.length / totalReadingsPerHour * 100) });
                }
            }
        }

        // Merge adjacent hours
        const merged = [];
        for (let i = 0; i < patterns.length; i++) {
            if (merged.length > 0 && patterns[i].hour === merged[merged.length - 1].endHour + 1 &&
                Math.abs(patterns[i].avg - merged[merged.length - 1].avg) < merged[merged.length - 1].avg * 0.5) {
                merged[merged.length - 1].endHour = patterns[i].hour;
                merged[merged.length - 1].avg = Math.round((merged[merged.length - 1].avg + patterns[i].avg) / 2);
            } else {
                merged.push({ ...patterns[i], endHour: patterns[i].hour });
            }
        }

        const el = $('usagePatternsContent');
        if (!el) return;
        if (merged.length === 0) {
            el.innerHTML = `<div class="usage-empty">${t('noPatterns')}</div>`;
            return;
        }

        el.innerHTML = merged.slice(0, 6).map(p => {
            const timeStr = p.hour + ':00 – ' + (p.endHour + 1) + ':00';
            return `<div class="usage-pattern">`
                + `<div class="usage-icon">${p.icon}</div>`
                + `<div class="usage-info"><div class="usage-time">${timeStr}</div><div class="usage-desc">${p.desc} · ${p.freq}%</div></div>`
                + `<div class="usage-watts">⌀ ${fmt.format(p.avg)} W</div>`
                + `</div>`;
        }).join('');
    } catch (e) { console.warn('Usage patterns error:', e); }
}

loadUsagePatterns();

// === Week Comparison ===
async function updateWeekComparison(energyData) {
    try {
        const res = await fetch('/api/daily?days=14');
        const data = await res.json();
        if (data.length < 2) return;

        const today = new Date();
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
        thisWeekStart.setHours(0, 0, 0, 0);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        let thisWeekKwh = 0, lastWeekKwh = 0;
        for (const d of data) {
            const dt = new Date(d.date + 'T00:00:00');
            if (dt >= thisWeekStart) thisWeekKwh += d.solar_kwh || 0;
            else if (dt >= lastWeekStart) lastWeekKwh += d.solar_kwh || 0;
        }

        const maxKwh = Math.max(thisWeekKwh, lastWeekKwh, 0.01);
        $('wcBarLast').style.height = (lastWeekKwh / maxKwh * 100) + '%';
        $('wcBarThis').style.height = (thisWeekKwh / maxKwh * 100) + '%';
        $('wcLastValue').textContent = fmt2.format(lastWeekKwh) + ' kWh';
        $('wcThisValue').textContent = fmt2.format(thisWeekKwh) + ' kWh';

        const deltaEl = $('wcDelta');
        if (lastWeekKwh > 0) {
            const pct = Math.round((thisWeekKwh - lastWeekKwh) / lastWeekKwh * 100);
            if (pct > 0) {
                deltaEl.textContent = t('weekBetter').replace('{pct}', pct);
                deltaEl.className = 'wc-delta positive';
            } else if (pct < 0) {
                deltaEl.textContent = t('weekWorse').replace('{pct}', Math.abs(pct));
                deltaEl.className = 'wc-delta negative';
            } else {
                deltaEl.textContent = t('weekSame');
                deltaEl.className = 'wc-delta neutral';
            }
        } else {
            deltaEl.textContent = '';
            deltaEl.className = 'wc-delta neutral';
        }

        $('weekCompare').style.display = '';
    } catch (e) { console.warn('Week comparison error:', e); }
}

// === Auto Theme (sunrise/sunset) ===
setInterval(checkAutoTheme, 60000); // Check every minute

// === Weekly Report Push (Monday) ===
function checkWeeklyReport() {
    if (!notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    if (now.getDay() !== 1) return; // Only Monday
    if (now.getHours() !== 8) return; // Only at 8:00

    const lastReport = localStorage.getItem('lastWeeklyReport');
    const todayStr = now.toISOString().slice(0, 10);
    if (lastReport === todayStr) return; // Already sent today

    // Fetch last week's data
    fetch('/api/daily?days=7').then(r => r.json()).then(data => {
        let totalKwh = 0;
        for (const d of data) totalKwh += d.solar_kwh || 0;
        const savedEur = totalKwh * EUR_PER_KWH;
        const co2 = totalKwh * CO2_KG_PER_KWH;

        new Notification(t('weeklyReport'), {
            body: t('weeklyReportBody')
                .replace('{kwh}', fmt2.format(totalKwh))
                .replace('{eur}', fmtEur.format(savedEur))
                .replace('{co2}', fmt.format(co2)),
            icon: '/static/icon-192.png'
        });
        localStorage.setItem('lastWeeklyReport', todayStr);
    }).catch(() => {});
}

// Check weekly report every 30 minutes
setInterval(checkWeeklyReport, 1800000);
checkWeeklyReport();
