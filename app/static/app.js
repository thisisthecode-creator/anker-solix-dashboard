// === i18n: Auto-detect browser language ===
const LANG = navigator.language.startsWith('de') ? 'de' : 'en';
document.documentElement.lang = LANG;

const I18N = {
    de: {
        refreshing: 'Aktualisieren...', offline: 'Offline - Daten aus Cache',
        connecting: 'Verbinde...', connected: 'Verbunden', disconnected: 'Getrennt',
        notifications: 'Benachrichtigungen',
        forecastTitle: 'Solar-Prognose', forecastSource: 'Warschau · 240° SW · 60°–90° Kurve · Open-Meteo',
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
        dataBackup: 'Daten-Backup', downloadDb: 'DB-Export herunterladen', mqttLog: 'MQTT Log',
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
        standbyMode: 'Standby-Modus', standbyBody: 'Kein Solar-Eingang. System im Standby bei {v}% Akku.',
        solarActive: 'Solar aktiv', solarActiveBody: 'Solar-Eingang erkannt: {v} W. System wieder aktiv.',
        dailyReport: 'Solar-Tagesreport', dailyReportBody: '☀️ {kwh} kWh | Peak {peak} W | {hours}h Sonne | 💰 {eur} €',
        notifNotSupported: 'Benachrichtigungen werden auf diesem Gerät nicht unterstützt. Auf iOS: App zum Homescreen hinzufügen.',
        kwhWeek: 'kWh gesamt', avgKwhDay: '⌀ kWh / Tag', sunHours: 'h Sonne',
        perWeek: '/ Woche', perDay: '/ Tag', wind: 'Wind',
        chargeEquiv: 'Ladezyklen-Äquivalent',
        techSpecs: 'Technische Daten', specInput: 'Eingang', specOutput: 'Ausgang',
        specBattery: 'Batterie', specPhysical: 'Gehäuse', specAcCharge: 'AC Laden',
        specChargeTime: 'Ladezeit', specCapacity: 'Kapazität', specCycles: 'Zyklen',
        specDimensions: 'Maße', specWeight: 'Gewicht', specExpandable: 'Erweiterbar', specNo: 'Nein',
        solarScore: 'Solar-Score', todayVsYesterday: 'Heute vs. Gestern (Solar W)',
        heatmapTitle: 'Solar-Kalender', less: 'Weniger', more: 'Mehr',
        batteryCycles: 'Batterie-Zyklen', totalCycles: 'Zyklen Gesamt',
        cycleHealth: 'Verbleibend', cycles: 'Zyklen',
        cycleLifetimeUsed: 'Lebensdauer verbraucht',
        cycleEstimate: 'Ø {kwh} kWh/Tag durch die Batterie · ~{years} Jahre Lebensdauer',
        cycleEstimateNoData: 'Noch zu wenig Daten',
        cycleInfoTitle: 'Wie funktionieren Batterie-Zyklen?',
        cycleInfoBody:
            '<p>Ein <strong>voller Zyklus</strong> ist ein komplettes Entladen plus komplettes Aufladen — ' +
            'also 100 % raus und 100 % wieder rein. Das sind zusammen <strong>200 Prozentpunkte SOC-Bewegung</strong>.</p>' +
            '<p>Der Tracker addiert jede Änderung des Ladezustands (State of Charge) auf, die Anker alle 3 Sekunden ' +
            'per MQTT schickt. Laden und Entladen zählen beide gleich:</p>' +
            '<span class="cycle-formula">Zyklen = Σ |ΔSOC| ÷ 200</span>' +
            '<p>Beispiel: 80 % → 60 % → 90 % sind |20| + |30| = 50 %, also <strong>0,25 Zyklen</strong>. ' +
            'Auch Teilentladungen zählen anteilig.</p>' +
            '<p>Die Anker Solix C1000 Gen 2 hat LiFePO4-Zellen mit einer Herstellergarantie von ' +
            '<strong>3000 vollen Zyklen</strong> bis die Kapazität auf 80 % gesunken ist. Die Lebensdauer-Schätzung ' +
            'nimmt den durchschnittlichen Batterie-Durchsatz pro Tag (in kWh) und rechnet hoch, wann die 3000 ' +
            'Zyklen erreicht wären.</p>' +
            '<p>Sprünge über 30 % werden als Datenlücken verworfen (z. B. wenn der Server kurz offline war). ' +
            'Die Berechnung läuft live im RAM, der Gesamtzähler wird in <code>data/battery_cycles.json</code> ' +
            'auf dem persistenten Volume gespeichert.</p>',
        usagePatterns: 'Verbrauchsmuster', usagePatternsHint: 'Ø Verbrauch pro Stunde (letzte 7 Tage)', noPatterns: 'Noch nicht genug Daten für Muster.',
        avgWatts: '⌀ {w} W', regularUsage: 'Regelmäßiger Verbrauch',
        shareTitle: 'Mein Solar-Tag', shareText: 'Solar: {kwh} kWh ☀️ | Score: {score}%',
        yesterday: 'Gestern', todayLabel: 'Heute',
        savedTotal: 'Gespart gesamt:', thisWeek: 'Diese Woche', lastWeek: 'Letzte Woche',
        weekBetter: '{pct}% mehr als letzte Woche ↑', weekWorse: '{pct}% weniger als letzte Woche ↓',
        weekSame: 'Gleich wie letzte Woche', daysUntilRoi: 'Tage bis Amortisation',
        avoided: 'vermieden', totalProduced: 'erzeugt', roiDone: 'Amortisiert! 🎉',
        weeklyReport: 'Wochen-Report', weeklyReportBody: 'Solar: {kwh} kWh | Gespart: {eur} €',
        autoTheme: 'Auto-Theme aktiv', cafes: 'Cafés',
        chargingIdle: 'Idle', chargingDischarge: 'Entladen', chargingCharge: 'Laden',
        acSwitch: 'AC', dcSwitch: 'DC', switchOn: 'An', switchOff: 'Aus',
        overloadWarning: 'Überlast!', overloadBody: 'Überlast am Ausgang erkannt! Geräte prüfen.',
        chargeLimits: 'Ladegrenzen', firmware: 'Firmware', batteryAh: 'Ah',
        acLimit: 'AC Limit', portCharging: 'Laden', portDischarging: 'Entladen', portIdle: 'Idle',
        deviceInfo: 'Geräte-Info', displayOn: 'Display An', displayOff: 'Display Aus',
        ledMode: 'LED', expansionPacks: 'Erweiterungen',
        weatherCodes: { 0: 'Klar', 1: 'Heiter', 2: 'Teilw. bewölkt', 3: 'Bewölkt', 45: 'Nebel', 48: 'Nebel', 51: 'Niesel', 53: 'Niesel', 55: 'Regen', 61: 'Regen', 63: 'Regen', 65: 'Starkregen', 71: 'Schnee', 73: 'Schnee', 75: 'Schnee', 80: 'Schauer', 81: 'Schauer', 82: 'Gewitter', 95: 'Gewitter', 96: 'Hagel' },
        // Phase 1 chart additions
        powerFlowTitle: 'Energiefluss Live',
        pfSolar: 'Solar', pfBattery: 'Akku', pfLoad: 'Verbraucher', pfGrid: 'Netz',
        energyBalanceTitle: 'Energie-Bilanz',
        sankeyLoss: 'Verluste',
        sankeyDirect: 'Direkt', sankeyStore: 'Gespeichert',
        hourlyHeatmapTitle: 'Tages-Heatmap (Stunde \u00d7 Tag)',
        hourlyHeatmapHint: 'Durchschnittliche Solar-Leistung pro Stunde',
        hhHour: 'Uhrzeit',
        cumulativeTitle: 'Kumulative Gesamterzeugung',
        cumulativeMilestone: 'Meilenstein',
        cumulativeTotal: 'Gesamt',
        cumulativeNoData: 'Noch keine Daten',
        distributionTitle: 'Monats-Verteilung (kWh pro Tag)',
        distributionLegend: 'Min \u2013 Q1 \u2013 Median \u2013 Q3 \u2013 Max',
        distributionNoData: 'Ben\u00f6tigt mindestens einen Monat Daten',

        // Phase 2-4 additions
        energyFlowTitle: 'Energie-Fluss (heute)',
        directUseKwh: 'Direkt verbraucht', batteryInKwh: 'In Akku', batteryOutKwh: 'Aus Akku',
        directUsePctLabel: 'Direkt-Eigenverbrauch', autarkiePctLabel: 'Autarkie-Grad',
        rtePctLabel: 'Round-Trip Efficiency', rteHint: 'Mindestens 10 Wh Akku-Umsatz nötig',
        efInfoTitle: 'Was bedeuten diese Kennzahlen?',
        efInfoBody:
            '<p><strong>Direkt-Eigenverbrauch</strong> ist der Anteil der Solarerzeugung, der sofort vom Verbraucher ' +
            'genutzt wird — Rest geht in den Akku oder wird verworfen. Formel: <code>min(Solar, Last) / Solar</code>.</p>' +
            '<p><strong>Autarkie-Grad</strong> ist der Anteil deines Verbrauchs, der nicht aus dem Netz kommt. ' +
            'Formel: <code>(Last − AC-Eingang) / Last</code>. 100 % heißt: keine Kilowattstunde aus der Steckdose.</p>' +
            '<p><strong>Round-Trip Efficiency (RTE)</strong> vergleicht, wie viel Energie aus dem Akku herauskommt mit dem, ' +
            'was reingegangen ist. LiFePO4 liegt typischerweise bei <strong>92–98 %</strong>. Fallen unter 90 % über mehrere Tage ' +
            'ist ein früherer Indikator für Zelldegradation als die SOH-Anzeige.</p>' +
            '<p>Alle drei Werte werden aus der Energie-Erhaltungsgleichung berechnet: ' +
            '<code>Solar + Netz = Last + Akku</code>. Vorzeichen von <code>Akku</code> entscheidet Laden vs. Entladen.</p>',

        breakEvenTitle: 'Break-Even Live',
        breakEvenAmortised: 'Amortisiert', breakEvenRemaining: 'Verbleibend',
        breakEvenSaved: 'Gespart gesamt', breakEvenProjection: 'Break-Even voraussichtlich',
        breakEvenAvgDay: 'Ø {kwh} kWh/Tag (letzte 30 Tage)',
        breakEvenPaidOff: 'System ist amortisiert! 🎉',

        anomalyTitle: 'Verbrauchs-Anomalie',
        anomalyNormal: 'Verbrauch im Normalbereich',
        anomalyHigh: 'Verbrauch höher als gewöhnlich',
        anomalyLow: 'Verbrauch niedriger als gewöhnlich',
        anomalyNoData: 'Noch nicht genug Baseline-Daten',
        anomalyDetail: '{current} W · Baseline {mean} W ± {sigma} W · z={z}',

        forecastCompareTitle: 'Prognose-Vergleich (morgen)',
        forecastOpenMeteo: 'Open-Meteo', forecastLocal: 'Eigenes Modell',

        dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    },
    en: {
        refreshing: 'Refreshing...', offline: 'Offline - Cached data',
        connecting: 'Connecting...', connected: 'Connected', disconnected: 'Disconnected',
        notifications: 'Notifications',
        forecastTitle: 'Solar Forecast', forecastSource: 'Warsaw · 240° SW · 60°–90° curve · Open-Meteo',
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
        standbyMode: 'Standby Mode', standbyBody: 'No solar input. System in standby at {v}% battery.',
        solarActive: 'Solar Active', solarActiveBody: 'Solar input detected: {v} W. System active again.',
        dailyReport: 'Solar Daily Report', dailyReportBody: '☀️ {kwh} kWh | Peak {peak} W | {hours}h Sun | 💰 {eur} €',
        notifNotSupported: 'Notifications not supported on this device. On iOS: add app to home screen first.',
        kwhWeek: 'kWh total', avgKwhDay: 'Avg kWh / Day', sunHours: 'h Sun',
        perWeek: '/ Week', perDay: '/ Day', wind: 'Wind',
        chargeEquiv: 'Charge Equivalents',
        solarScore: 'Solar Score', todayVsYesterday: 'Today vs. Yesterday (Solar W)',
        heatmapTitle: 'Solar Calendar', less: 'Less', more: 'More',
        batteryCycles: 'Battery Cycles', totalCycles: 'Total Cycles',
        cycleHealth: 'Remaining', cycles: 'Cycles',
        cycleLifetimeUsed: 'Lifetime used',
        cycleEstimate: 'Avg {kwh} kWh/day through the battery · ~{years} years lifespan',
        cycleEstimateNoData: 'Not enough data yet',
        cycleInfoTitle: 'How do battery cycles work?',
        cycleInfoBody:
            '<p>One <strong>full cycle</strong> is a complete discharge plus a complete recharge — ' +
            '100 % out and 100 % back in. That adds up to <strong>200 percentage points of SOC movement</strong>.</p>' +
            '<p>The tracker sums every change in state-of-charge that Anker reports via MQTT every 3 seconds. ' +
            'Charging and discharging both count equally:</p>' +
            '<span class="cycle-formula">cycles = Σ |ΔSOC| ÷ 200</span>' +
            '<p>Example: 80 % → 60 % → 90 % is |20| + |30| = 50 %, which equals <strong>0.25 cycles</strong>. ' +
            'Partial discharges count proportionally.</p>' +
            '<p>The Anker Solix C1000 Gen 2 uses LiFePO4 cells rated for <strong>3000 full cycles</strong> ' +
            'until capacity drops to 80 %. The lifespan estimate takes the average daily battery throughput ' +
            '(in kWh) and extrapolates when the 3000-cycle limit would be reached.</p>' +
            '<p>Jumps larger than 30 % are rejected as data gaps (for example if the server was briefly offline). ' +
            'The calculation runs live in RAM; the lifetime counter is persisted in ' +
            '<code>data/battery_cycles.json</code> on the persistent volume.</p>',
        usagePatterns: 'Usage Patterns', usagePatternsHint: 'Avg consumption per hour (last 7 days)', noPatterns: 'Not enough data for patterns yet.',
        avgWatts: 'Avg {w} W', regularUsage: 'Regular usage',
        shareTitle: 'My Solar Day', shareText: 'Solar: {kwh} kWh ☀️ | Score: {score}%',
        yesterday: 'Yesterday', todayLabel: 'Today',
        savedTotal: 'Total saved:', thisWeek: 'This Week', lastWeek: 'Last Week',
        weekBetter: '{pct}% more than last week ↑', weekWorse: '{pct}% less than last week ↓',
        weekSame: 'Same as last week', daysUntilRoi: 'Days until ROI',
        avoided: 'avoided', totalProduced: 'produced', roiDone: 'Paid off! 🎉',
        weeklyReport: 'Weekly Report', weeklyReportBody: 'Solar: {kwh} kWh | Saved: {eur} €',
        autoTheme: 'Auto-theme active', cafes: 'Cafés',
        chargingIdle: 'Idle', chargingDischarge: 'Discharging', chargingCharge: 'Charging',
        acSwitch: 'AC', dcSwitch: 'DC', switchOn: 'On', switchOff: 'Off',
        overloadWarning: 'Overload!', overloadBody: 'Output overload detected! Check devices.',
        chargeLimits: 'Charge Limits', firmware: 'Firmware', batteryAh: 'Ah',
        acLimit: 'AC Limit', portCharging: 'Charging', portDischarging: 'Discharging', portIdle: 'Idle',
        deviceInfo: 'Device Info', displayOn: 'Display On', displayOff: 'Display Off',
        ledMode: 'LED', expansionPacks: 'Expansions',
        weatherCodes: { 0: 'Clear', 1: 'Fair', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Rain', 61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Snow', 73: 'Snow', 75: 'Snow', 80: 'Showers', 81: 'Showers', 82: 'Thunderstorm', 95: 'Thunderstorm', 96: 'Hail' },
        // Phase 1 chart additions
        powerFlowTitle: 'Live Power Flow',
        pfSolar: 'Solar', pfBattery: 'Battery', pfLoad: 'Load', pfGrid: 'Grid',
        energyBalanceTitle: 'Energy Balance',
        sankeyLoss: 'Losses',
        sankeyDirect: 'Direct', sankeyStore: 'Stored',
        hourlyHeatmapTitle: 'Hourly Heatmap (hour \u00d7 day)',
        hourlyHeatmapHint: 'Average solar power per hour',
        hhHour: 'Hour',
        cumulativeTitle: 'Cumulative Total Production',
        cumulativeMilestone: 'Milestone',
        cumulativeTotal: 'Total',
        cumulativeNoData: 'No data yet',
        distributionTitle: 'Monthly Distribution (kWh per day)',
        distributionLegend: 'Min \u2013 Q1 \u2013 Median \u2013 Q3 \u2013 Max',
        distributionNoData: 'Needs at least one month of data',

        // Phase 2-4 additions
        energyFlowTitle: 'Energy Flow (today)',
        directUseKwh: 'Direct used', batteryInKwh: 'Into battery', batteryOutKwh: 'From battery',
        directUsePctLabel: 'Direct self-consumption', autarkiePctLabel: 'Autarky',
        rtePctLabel: 'Round-trip efficiency', rteHint: 'Needs at least 10 Wh battery cycling',
        efInfoTitle: 'What do these metrics mean?',
        efInfoBody:
            '<p><strong>Direct self-consumption</strong> is the share of solar generation used by the load immediately — ' +
            'the rest goes into the battery or is wasted. Formula: <code>min(solar, load) / solar</code>.</p>' +
            '<p><strong>Autarky</strong> is the share of your consumption that did not come from the grid. ' +
            'Formula: <code>(load − AC input) / load</code>. 100 % means no kilowatt-hour came from the wall outlet.</p>' +
            '<p><strong>Round-trip efficiency (RTE)</strong> compares energy out of the battery vs energy in. ' +
            'LiFePO4 cells typically hover at <strong>92–98 %</strong>. Dropping below 90 % over several days is an ' +
            'earlier indicator of cell degradation than the SOH reading.</p>' +
            '<p>All three metrics derive from energy conservation: <code>solar + grid = load + battery</code>. ' +
            'The sign of <code>battery</code> determines charging vs discharging.</p>',

        breakEvenTitle: 'Break-Even Live',
        breakEvenAmortised: 'Amortised', breakEvenRemaining: 'Remaining',
        breakEvenSaved: 'Saved so far', breakEvenProjection: 'Projected break-even',
        breakEvenAvgDay: 'Avg {kwh} kWh/day (last 30 days)',
        breakEvenPaidOff: 'System is paid off! 🎉',

        anomalyTitle: 'Consumption Anomaly',
        anomalyNormal: 'Consumption in normal range',
        anomalyHigh: 'Consumption higher than usual',
        anomalyLow: 'Consumption lower than usual',
        anomalyNoData: 'Not enough baseline data yet',
        anomalyDetail: '{current} W · baseline {mean} W ± {sigma} W · z={z}',

        forecastCompareTitle: 'Forecast Comparison (tomorrow)',
        forecastOpenMeteo: 'Open-Meteo', forecastLocal: 'Local model',

        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }
};

function t(key) { return I18N[LANG][key] || I18N.de[key] || key; }

// Apply translations to HTML elements with data-i18n / data-i18n-html attribute
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = t(key);
        if (val) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.dataset.i18nHtml;
        const val = t(key);
        if (val) el.innerHTML = val;
    });
}

// === Number formatting (locale-aware) ===
const locale = LANG === 'de' ? 'de-DE' : 'en-US';
const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
const fmt2 = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
const fmtKwh = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEur = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const EUR_PER_KWH = 0.25; // Poland household electricity price
const SYSTEM_COST_EUR = 997; // Amortisation: nur C1000 (598,07) + BP1000 (399) = 2 kWh Batterie
const CAFE_PRICE_EUR = 3.70; // Price of a café in Warsaw

// === Warsaw timezone helpers ===
// All date logic must use Warsaw time, not browser-local or UTC
const WARSAW_TZ = 'Europe/Warsaw';
function warsawNow() {
    // Return a Date-like object with Warsaw hours/day/month/year
    // by formatting to parts and reconstructing
    const parts = {};
    new Intl.DateTimeFormat('en-CA', {
        timeZone: WARSAW_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).formatToParts(new Date()).forEach(p => { parts[p.type] = p.value; });
    return {
        year: +parts.year, month: +parts.month - 1, day: +parts.day,
        hours: +parts.hour, minutes: +parts.minute, seconds: +parts.second,
        getFullYear() { return this.year; },
        getMonth() { return this.month; },
        getDate() { return this.day; },
        getDay() { return new Date(this.year, this.month, this.day).getDay(); },
        getHours() { return this.hours; },
        getMinutes() { return this.minutes; },
        getSeconds() { return this.seconds; }
    };
}
function warsawToday() {
    const w = warsawNow();
    return w.year + '-' + String(w.month + 1).padStart(2, '0') + '-' + String(w.day).padStart(2, '0');
}

function fmtWh(kwh) {
    const wh = kwh * 1000;
    if (wh >= 1000) return fmtKwh.format(kwh) + ' kWh';
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
        const h = warsawNow().getHours();
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
let notifStandbySent = false;
let notifActiveSent = false;
let lastKnownSolarWatts = -1; // -1 = no data yet

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
    // Standby / Active state transition
    if (lastKnownSolarWatts >= 0) { // skip first reading
        if (solar === 0 && lastKnownSolarWatts > 0 && !notifStandbySent) {
            new Notification(t('standbyMode'), { body: t('standbyBody').replace('{v}', d.battery_soc), icon: '/static/icon-192.png' });
            notifStandbySent = true;
            notifActiveSent = false;
        }
        if (solar > 0 && lastKnownSolarWatts === 0 && !notifActiveSent) {
            new Notification(t('solarActive'), { body: t('solarActiveBody').replace('{v}', fmt.format(solar)), icon: '/static/icon-192.png' });
            notifActiveSent = true;
            notifStandbySent = false;
        }
    }
    lastKnownSolarWatts = solar;
    // Daily report after sunset
    checkDailyReport(d);
}

// Daily solar report (after sunset)
let notifDailyReportSent = localStorage.getItem('dailyReportDate') || '';

function checkDailyReport(d) {
    if (!notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (!window._sunset) return;
    const now = new Date();
    const today = warsawToday();
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
        .replace('{kwh}', fmtKwh.format(kwh))
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
        // Skip metrics whose canvas was removed from the DOM
        if (!$('chart_' + m.key)) continue;
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
            if (!chart) continue;  // canvas was removed
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
            // Out-of-band events: server notifies when self-learning was retrained
            // so the UI reflects the fresh calibration immediately.
            if (d.type === 'recalibrated') {
                _refreshCalibration().then(() => {
                    try { buildAccuracyTrend(); } catch (_) {}
                    try { buildMlStatsAndCalibration(); } catch (_) {}
                    try { buildAuxInsights(); } catch (_) {}
                });
                return;
            }
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
    // Dynamic battery capacity: update when BP1000 expansion detected
    if (d.total_capacity_wh && d.total_capacity_wh > 0) {
        BATTERY_CAPACITY_KWH = d.total_capacity_wh / 1000;
        const specCap = $('specCapacityVal');
        const exp = d.expansion_packs || 0;
        if (specCap) {
            specCap.textContent = exp > 0
                ? `${d.total_capacity_wh} Wh (C1000 + ${exp}x BP1000)`
                : `${d.total_capacity_wh} Wh`;
        }
        const expRow = $('expPackRow');
        const expInfo = $('expPackInfo');
        if (expRow && expInfo) {
            if (exp > 0) {
                const typ = d.exp_1_type || 'BP1000';
                const soc = d.exp_1_soc || 0;
                const soh = d.exp_1_soh || 0;
                const temp = d.exp_1_temperature || 0;
                expInfo.textContent = `${exp}x ${typ} · SOC ${soc}% · SOH ${soh}% · ${temp.toFixed(1)}°C`;
                expRow.style.display = '';
            } else {
                expRow.style.display = 'none';
            }
        }
    }
    $('solarWatts').textContent = fmt.format(d.solar_watts);
    // Combined SOC when BP1000 expansion is connected (weighted by capacity)
    const expPacksMain = d.expansion_packs || 0;
    let combinedSoc = d.battery_soc || 0;
    if (expPacksMain > 0 && d.main_battery_soc > 0 && d.exp_1_soc > 0) {
        const mainWh = 1024;
        const expWh = 1056 * expPacksMain;
        combinedSoc = Math.round((d.main_battery_soc * mainWh + d.exp_1_soc * expWh) / (mainWh + expWh));
    }
    $('batterySoc').textContent = combinedSoc;
    updateFavicon(combinedSoc);
    // Capacity hint below battery
    const capEl = $('batteryCapacity');
    if (capEl) {
        const totalWh = d.total_capacity_wh || 1024;
        const kwh = totalWh / 1000;
        if (expPacksMain > 0) {
            capEl.textContent = `${kwh.toFixed(2)} kWh (C1000 + ${expPacksMain}x BP1000)`;
        } else {
            capEl.textContent = `${kwh.toFixed(2)} kWh`;
        }
    }
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
    const solarPeakEl = $('solarPeak');
    if (solarPeakEl) {
        const peak = d.daily_peak_watts || 0;
        solarPeakEl.textContent = peak > 0 ? ('Peak ' + Math.round(peak) + ' W') : '';
    }

    const bar = $('batteryBar');
    // Use combined SOC (already computed above) for fill visual
    const socForBar = (typeof combinedSoc !== 'undefined' ? combinedSoc : d.battery_soc) || 0;
    bar.style.height = socForBar + '%';
    bar.className = 'bat-fill' + (socForBar < 20 ? ' low' : socForBar < 50 ? ' mid' : '');

    $('eToday').textContent = fmtWh(d.daily_kwh || 0);
    $('eOutToday').textContent = fmtWh(d.daily_output_kwh || 0);
    $('sToday').textContent = fmtEur.format(d.daily_savings_eur || 0) + ' \u20ac';

    // Energy-Flow section (direct-use / autarky / RTE) updates live from WS
    try { updateEnergyFlowFromLatest(d); } catch (e) {}
    // === Triple-ring update in dash overview ===
    const RING_CIRC = 144.51; // 2 * π * 23

    // Ring 1: Solar W (0-400 W range for 2x200W panels)
    const solarW = d.solar_watts || 0;
    const solarWEl = $('solarWattRingVal');
    if (solarWEl) solarWEl.textContent = Math.round(solarW);
    const solarWArc = $('solarWattArc');
    if (solarWArc) {
        const pct = Math.min(100, solarW / 400 * 100);
        solarWArc.setAttribute('stroke-dashoffset', (RING_CIRC - RING_CIRC * pct / 100).toFixed(1));
    }

    // Ring 2: Autarkie %
    const aut = d.autarkie_pct || 0;
    const autPct = $('autarkiePct');
    if (autPct) autPct.textContent = fmt.format(aut) + '%';
    const autArc = $('autarkieArc');
    if (autArc) {
        autArc.setAttribute('stroke-dashoffset', (RING_CIRC - RING_CIRC * Math.min(100, aut) / 100).toFixed(1));
    }

    // Ring 3: Today's Solar kWh (0-3 kWh range, generous for 2x200W)
    const solarKwh = d.daily_kwh || 0;
    const solarKwhEl = $('solarKwhRingVal');
    if (solarKwhEl) solarKwhEl.textContent = fmtKwh.format(solarKwh);
    const solarKwhArc = $('solarKwhArc');
    if (solarKwhArc) {
        const pct = Math.min(100, solarKwh / 3 * 100);
        solarKwhArc.setAttribute('stroke-dashoffset', (RING_CIRC - RING_CIRC * pct / 100).toFixed(1));
    }

    // Ring 4: Today's Sunshine Hours from forecast (0-16h range)
    const todaySunH = window._forecastSunshine && window._forecastSunshine[warsawToday()];
    const sunRingEl = $('sunHoursRingVal');
    if (sunRingEl && todaySunH != null) {
        sunRingEl.textContent = fmt.format(todaySunH) + 'h';
        const sunArc = $('sunHoursArc');
        if (sunArc) {
            const pct = Math.min(100, todaySunH / 16 * 100);
            sunArc.setAttribute('stroke-dashoffset', (RING_CIRC - RING_CIRC * pct / 100).toFixed(1));
        }
    }
    // Live power-flow animation (Solar / Battery / Load / Grid icons + particles)
    try { if (typeof updatePowerFlow === 'function') updatePowerFlow(d); } catch (e) {}

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
        const now = warsawNow();
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
        // CO2 table removed
        updateWeekComparison(data);
        updateDashTotals(data);
    } catch (e) {
        console.warn('Energy summary error:', e);
    }
}

// CO2 table / CO2 ticker / formatCO2 removed — user requested full CO2 cleanup.

function updateDashTotals(energyData) {
    const total = energyData.total || {};
    const totalKwh = total.solar_kwh || 0;
    const totalEur = totalKwh * EUR_PER_KWH;
    const totalCafes = Math.floor(totalEur / CAFE_PRICE_EUR);

    const tickerEl = $('savingsTickerValue');
    if (tickerEl) tickerEl.textContent = fmtEur.format(totalEur) + ' \u20ac';
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
    const now = warsawNow();
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

    // MQTT Live-Log: dedup over the same 24 fields the archive uses, so a
    // change in ac_switch / display_mode / port status appends a new row too.
    const solar = d.solar_watts || 0;
    const out = d.total_output_watts || 0;
    const acIn = d.ac_input_watts || 0;
    const fp = _logFingerprint(d);

    if (fp !== _lastLogFingerprint) {
        LOG_ROWS.unshift(makeLogRow(tickerCount, dateTime, solar, d.battery_soc, d.temperature, out, acIn));
        _lastLogFingerprint = fp;
    } else if (_historicLoaded && LOG_ROWS.length > 0) {
        // No change → just refresh the timestamp so the heartbeat stays visible
        LOG_ROWS[0] = makeLogRow(tickerCount, dateTime, solar, d.battery_soc, d.temperature, out, acIn);
    }
    if (logPage === 0) renderLogPage();
}

// Load EVERY historical change from the archive (up to 10 years).
// Dedup uses the full 24-field fingerprint when available so the log captures
// not just power/SOC/temp changes but also config changes (ac_switch, dc_switch,
// charge limits, AC input limit, display mode, port statuses).
const LOG_FP_FIELDS = [
    'solar_watts', 'battery_soc', 'battery_soh',
    'ac_output_watts', 'dc_output_watts', 'dc_12v_watts',
    'usbc_1_watts', 'usbc_2_watts', 'usbc_3_watts', 'usba_1_watts',
    'total_output_watts', 'ac_input_watts', 'temperature',
    'ac_switch', 'dc_switch',
    'max_soc', 'min_soc', 'ac_input_limit',
    'display_switch', 'display_mode',
    'usbc_1_status', 'usbc_2_status', 'usbc_3_status', 'usba_1_status',
];

function _logFingerprint(r) {
    return LOG_FP_FIELDS.map(k => (k in r ? r[k] : '')).join('|');
}

async function loadHistoricLog() {
    try {
        const res = await fetch('/api/readings?hours=87600');
        const rows = await res.json();
        LOG_ROWS.length = 0;
        let lastFp = '';
        let num = 0;
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            const bat = r.battery_soc || 0;
            const temp = r.temperature || 0;
            // Filter 0-spike rows (invalid MQTT data at session start)
            if (bat === 0 && temp === 0) continue;
            const fp = _logFingerprint(r);
            if (fp === lastFp) continue;
            lastFp = fp;
            num++;
            const d = new Date(r.timestamp);
            const dateStr = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
            const time = dateStr + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
            const solar = r.solar_watts || 0;
            const out = r.total_output_watts || 0;
            const acIn = r.ac_input_watts || 0;
            LOG_ROWS.push(makeLogRow(num, time, solar, bat, temp, out, acIn));
        }
        // Reverse so newest entries land at the top
        LOG_ROWS.reverse();
        tickerCount = num;
        _lastLogFingerprint = lastFp;
        _historicLoaded = true;
        renderLogPage();
        if (LOG_ROWS.length === 0) {
            const logBody = $('mqttLogBody');
            if (logBody) logBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:20px">Keine aufgezeichneten Daten vorhanden.</td></tr>';
        }
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
            if (uvEl) {
                uvEl.textContent = 'UV ' + uvVal;
                uvEl.className = 'weather-uv uv-' + (uv >= 8 ? 'extreme' : uv >= 6 ? 'high' : uv >= 3 ? 'mid' : 'low');
            }
        } else if (uvEl) {
            uvEl.textContent = 'UV --';
            uvEl.className = 'weather-uv';
        }
        // --- Update Ring 5: Temperature °C (range -20 to +40 → 0-100%) ---
        const tempRingEl = $('tempRingVal');
        const tempArc = $('tempArc');
        const tempC = c.temperature_2m;
        if (tempRingEl) tempRingEl.textContent = Math.round(tempC) + '°';
        if (tempArc) {
            const RING_C = 144.51;
            const tempPct = Math.max(0, Math.min(100, (tempC + 20) / 60 * 100));
            tempArc.setAttribute('stroke-dashoffset', (RING_C - RING_C * tempPct / 100).toFixed(1));
        }
        // --- Update Ring 6: UV Index (range 0-11+) ---
        const uvRingEl = $('uvRingVal');
        const uvArcEl = $('uvArc');
        if (uv != null) {
            if (uvRingEl) uvRingEl.textContent = Math.round(uv * 10) / 10;
            if (uvArcEl) {
                const RING_C = 144.51;
                const uvPct = Math.min(100, uv / 11 * 100);
                uvArcEl.setAttribute('stroke-dashoffset', (RING_C - RING_C * uvPct / 100).toFixed(1));
            }
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

// === Shared daily data cache (avoids 4x identical /api/daily?days=365 fetches) ===
let _dailyCache = null;
let _dailyCachePromise = null;
function getDailyData() {
    if (_dailyCache) return Promise.resolve(_dailyCache);
    if (!_dailyCachePromise) {
        _dailyCachePromise = fetch('/api/daily?days=365').then(r => r.json()).then(d => {
            _dailyCache = d;
            return d;
        });
    }
    return _dailyCachePromise;
}

// === Solar Forecast ===
const PANEL_KWP = 0.40;        // 2 × 200 W flexible panels
const PANEL_EFFICIENCY = 0.85;

// Top vertical on railing (90°), bottom pulled out by 30° bracket (60°),
// middle sags between. Each strip = 20% of panel area.
const CURVE_STRIPS = [
    { tilt: 60, weight: 1/5 },
    { tilt: 68, weight: 1/5 },
    { tilt: 75, weight: 1/5 },
    { tilt: 83, weight: 1/5 },
    { tilt: 90, weight: 1/5 },
];
// Open-Meteo azimuth convention: 0=south, -90=east, +90=west, ±180=north
// Panel compass heading is 240° (SW) → Open-Meteo = 240 - 180 = 60
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

function renderForecast(fc) {
    const d = fc.daily;
    const dailyGTI = fc.dailyGTI;
    const dailyDirect = fc.dailyDirect;
    const dailyDiffuse = fc.dailyDiffuse;

    const days = t('dayNames');
    const weatherIcons = {
        0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫',
        51: '🌦', 53: '🌦', 55: '🌧', 61: '🌧', 63: '🌧', 65: '🌧',
        71: '🌨', 73: '🌨', 75: '❄️', 80: '🌦', 81: '🌧', 82: '⛈', 95: '⛈', 96: '⛈',
    };
    const todayStr = warsawToday();
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

        const uvClass = uv >= 8 ? 'uv-extreme' : uv >= 6 ? 'uv-high' : uv >= 3 ? 'uv-mid' : 'uv-low';

        const cloudCover = Math.round(d.cloud_cover_mean ? d.cloud_cover_mean[i] || 0 : 0);
        const windSpeed = Math.round(d.wind_speed_10m_max ? d.wind_speed_10m_max[i] || 0 : 0);
        const windGusts = Math.round(d.wind_gusts_10m_max ? d.wind_gusts_10m_max[i] || 0 : 0);
        const windDanger = windGusts >= 60 ? ' fc-wind-danger' : windGusts >= 40 ? ' fc-wind-warn' : '';
        const dateStr = dt.getDate() + '.' + (dt.getMonth() + 1) + '.';

        if (i <= 1 && windGusts >= 60) checkStormNotification(windGusts);

        const tMax = d.temperature_2m_max ? Math.round(d.temperature_2m_max[i] || 0) : null;
        const tMin = d.temperature_2m_min ? Math.round(d.temperature_2m_min[i] || 0) : null;
        const tempHtml = (tMax != null && tMin != null)
            ? `<div class="fc-temp"><span class="fc-temp-max" title="${LANG === 'de' ? 'Tag' : 'Day'}">☀${tMax}°</span><span class="fc-temp-min" title="${LANG === 'de' ? 'Nacht' : 'Night'}">☾${tMin}°</span></div>`
            : '';

        const div = document.createElement('div');
        div.className = 'fc-day' + (isToday ? ' fc-today' : '');
        div.innerHTML = `<div class="fc-name">${isToday ? t('today') : dayName}</div>`
            + `<div class="fc-date">${dateStr}</div>`
            + `<div class="fc-icon">${icon}</div>`
            + `<div class="fc-kwh">${estKwh}</div>`
            + tempHtml
            + `<div class="fc-sun">🔆 ${sunH}h</div>`
            + `<div class="fc-clouds">☁ ${cloudCover}%</div>`
            + `<div class="fc-wind${windDanger}" title="${t('wind')} ${windSpeed} km/h (${LANG === 'de' ? 'Böen' : 'gusts'} ${windGusts} km/h)">💨 ${windSpeed}</div>`
            + `<div class="fc-uv ${uvClass}">🔆 ${uv}</div>`;
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
        + `<div class="fc-sum-item"><span class="fc-sum-value">${fmtKwh.format(weekTotal)}</span><span class="fc-sum-label">${t('kwhWeek')}</span></div>`
        + `<div class="fc-sum-item"><span class="fc-sum-value">${fmtKwh.format(avgKwh)}</span><span class="fc-sum-label">${t('avgKwhDay')}</span></div>`
        + `<div class="fc-sum-item"><span class="fc-sum-value">${Math.round(weekSunH)}</span><span class="fc-sum-label">${t('sunHours')}</span></div>`
        + `</div>`
        + `</div>`;

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

    window._forecastSunshine = {};
    for (let i = 0; i < d.time.length; i++) {
        window._forecastSunshine[d.time[i]] = Math.round((d.sunshine_duration[i] || 0) / 3600 * 10) / 10;
    }

    if (fc.hourlyTimes) {
        window._forecastHourly = {};
        for (let i = 0; i < fc.hourlyTimes.length; i++) {
            window._forecastHourly[fc.hourlyTimes[i]] = fc.hourlyKwh[i] || 0;
        }
    }
}

// Self-learning calibration cache (fetched once, refreshed periodically).
// Shape: { available: bool, hour_factors: {"0": {factor, confidence, samples}}, overall_factor, ... }
window._solarCalibration = null;
async function _refreshCalibration() {
    try {
        const r = await fetch('/api/solar-calibration');
        if (r.ok) window._solarCalibration = await r.json();
    } catch (_) {}
}
_refreshCalibration();
setInterval(_refreshCalibration, 900000);  // every 15 min

// Apply calibration: overall system bias + per-hour residual.
// Always apply the overall_factor (if enough samples) since the base system
// efficiency is a property of the install, not the hour. Per-hour residuals
// just add nuance.
function applyHourCalibration(rawKwh, hourOfDay) {
    const cal = window._solarCalibration;
    if (!cal || !cal.available) return rawKwh;

    // Base correction: overall system efficiency (learned from all data).
    // Confidence now uses SEM (shrinks with 1/sqrt(n)) so it naturally
    // improves with every new data point - true self-learning.
    const overallF = cal.overall_factor || 1.0;
    const overallConf = cal.overall_confidence || 0;
    const overallSamples = cal.overall_samples || 0;
    const base = overallSamples >= 10
        ? 1 + (overallF - 1) * Math.max(0.7, overallConf)
        : 1.0;

    // Per-hour residual (on top of overall baseline)
    let residual = 1.0;
    if (cal.hour_factors) {
        const hf = cal.hour_factors[String(hourOfDay)];
        if (hf && hf.samples >= 3) {
            const r = (hf.residual != null) ? hf.residual : (hf.factor / overallF);
            residual = 1 + (r - 1) * (hf.confidence || 0);
        }
    }

    return rawKwh * base * residual;
}

function processForecastData(dailyRes, stripResults) {
    const d = dailyRes.daily;
    const hBase = dailyRes.hourly;
    if (!d || !d.time || !hBase || !hBase.time) return null;

    const dailyGTI = {};
    const dailyDirect = {};
    const dailyDiffuse = {};

    for (let i = 0; i < hBase.time.length; i++) {
        const day = hBase.time[i].slice(0, 10);
        if (!dailyGTI[day]) { dailyGTI[day] = 0; dailyDirect[day] = 0; dailyDiffuse[day] = 0; }
        let weightedGTI = 0;
        for (let s = 0; s < CURVE_STRIPS.length; s++) {
            weightedGTI += (stripResults[s].global_tilted_irradiance[i] || 0) * CURVE_STRIPS[s].weight;
        }
        // Apply calibration (self-learned) so daily totals reflect the corrected forecast
        const h = parseInt(hBase.time[i].slice(11, 13), 10);
        const rawKwh = weightedGTI / 1000 * PANEL_KWP * PANEL_EFFICIENCY;
        const calibratedKwh = applyHourCalibration(rawKwh, h);
        // Back-convert to GTI equivalent so dailyGTI keeps consistent units
        const calFactor = rawKwh > 0.001 ? calibratedKwh / rawKwh : 1.0;
        dailyGTI[day] += weightedGTI * calFactor;
        dailyDirect[day] += (hBase.direct_radiation[i] || 0);
        dailyDiffuse[day] += (hBase.diffuse_radiation[i] || 0);
    }

    const hourlyTimes = hBase.time;
    const hourlyKwh = [];
    for (let i = 0; i < hBase.time.length; i++) {
        let weightedGTI = 0;
        for (let s = 0; s < CURVE_STRIPS.length; s++) {
            weightedGTI += (stripResults[s].global_tilted_irradiance[i] || 0) * CURVE_STRIPS[s].weight;
        }
        const rawKwh = weightedGTI / 1000 * PANEL_KWP * PANEL_EFFICIENCY;
        const h = parseInt(hBase.time[i].slice(11, 13), 10);
        const calibrated = applyHourCalibration(rawKwh, h);
        hourlyKwh.push(Math.round(calibrated * 1000) / 1000);
    }

    return { daily: d, dailyGTI, dailyDirect, dailyDiffuse, hourlyTimes, hourlyKwh };
}

async function loadForecast() {
    // 1. Load cached forecast instantly
    try {
        const cacheRes = await fetch('/api/forecast-cache');
        if (cacheRes.ok) {
            const cached = await cacheRes.json();
            if (cached.daily && cached.daily.time && cached.daily.time.length) {
                renderForecast(cached);
                await buildHourlyForecastToday();
            }
        }
    } catch (e) { /* cache miss is fine */ }

    // 2. Fetch fresh data from Open-Meteo
    try {
        const [dailyRes, ...stripResults] = await Promise.all([
            fetch('https://api.open-meteo.com/v1/forecast?latitude=52.1928&longitude=21.0103'
                + '&daily=sunshine_duration,weather_code,cloud_cover_mean,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,temperature_2m_max,temperature_2m_min'
                + '&hourly=direct_radiation,diffuse_radiation'
                + '&timezone=Europe%2FWarsaw&forecast_days=7').then(r => r.json()),
            ...CURVE_STRIPS.map(s => fetchGTI(s.tilt))
        ]);

        const fc = processForecastData(dailyRes, stripResults);
        if (!fc) return;

        renderForecast(fc);
        await buildHourlyForecastToday();
        updateExpectedSolar();

        // 3. Save to server cache
        fetch('/api/forecast-cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fc),
        }).catch(() => {});

    } catch (e) {
        console.warn('Forecast error:', e);
        // Only show error if no cached data was rendered
        if (!window._forecastKwh || !Object.keys(window._forecastKwh).length) {
            const grid = $('forecastGrid');
            if (grid) grid.innerHTML = '<div style="text-align:center;color:var(--text-dim);padding:20px;font-size:0.8rem">Prognose konnte nicht geladen werden.</div>';
        }
    }
}

function updateExpectedSolar() {}


// === Hourly Forecast vs Actual (today) ===
let _hourlyTodayChart = null;

// Fetch hourly Open-Meteo GTI forecast for a specific date (uses archive API
// for past dates, regular forecast API for today/future). Applies our curve
// strip model to get predicted kWh per hour.
async function fetchHourlyForecastForDate(dateStr) {
    const today = warsawToday();
    const isPast = dateStr < today;
    const baseUrl = isPast
        ? 'https://archive-api.open-meteo.com/v1/archive'
        : 'https://api.open-meteo.com/v1/forecast';

    const strips = await Promise.all(CURVE_STRIPS.map(s =>
        fetch(baseUrl + '?latitude=52.1928&longitude=21.0103'
            + '&hourly=global_tilted_irradiance'
            + '&tilt=' + s.tilt + '&azimuth=' + AZIMUTH
            + '&timezone=Europe%2FWarsaw'
            + (isPast
                ? ('&start_date=' + dateStr + '&end_date=' + dateStr)
                : '&forecast_days=1')
        ).then(r => r.json()).then(d => d.hourly)
    ));

    if (!strips[0] || !strips[0].time) return null;

    const byHour = {};
    for (let i = 0; i < strips[0].time.length; i++) {
        const ts = strips[0].time[i];
        if (!ts.startsWith(dateStr)) continue;
        let wgti = 0;
        for (let s = 0; s < CURVE_STRIPS.length; s++) {
            wgti += (strips[s].global_tilted_irradiance[i] || 0) * CURVE_STRIPS[s].weight;
        }
        const h = parseInt(ts.slice(11, 13), 10);
        byHour[h] = wgti / 1000 * PANEL_KWP * PANEL_EFFICIENCY;  // kWh
    }
    return byHour;
}

// Current selected date (yyyy-mm-dd). Default: today
let _hfcSelectedDate = null;

async function buildHourlyForecastToday(dateStr) {
    const today = warsawToday();
    if (!dateStr) dateStr = _hfcSelectedDate || today;
    _hfcSelectedDate = dateStr;

    // Update date input
    const dateInput = $('hfcDate');
    if (dateInput) dateInput.value = dateStr;

    // Collect forecast by hour — use cache for today, Open-Meteo for any other day
    let forecastByHour = {};
    if (dateStr === today && window._forecastHourly) {
        for (const [ts, kwh] of Object.entries(window._forecastHourly)) {
            if (ts.startsWith(today)) {
                const h = parseInt(ts.slice(11, 13), 10);
                forecastByHour[h] = kwh;
            }
        }
    } else {
        try {
            const fc = await fetchHourlyForecastForDate(dateStr);
            if (fc) forecastByHour = fc;
        } catch (e) { console.warn('Hourly forecast fetch failed:', e); }
    }

    // Fetch actual hourly production from server (CSV archive)
    let actualByHour = {};
    try {
        const res = await fetch('/api/hourly-solar?date=' + dateStr);
        if (res.ok) {
            const data = await res.json();
            if (data.hourly_wh) {
                for (let h = 0; h < 24; h++) {
                    actualByHour[h] = (data.hourly_wh[h] || 0) / 1000;  // Wh -> kWh
                }
            }
        }
    } catch (e) { console.warn('Hourly actual fetch failed:', e); }

    const currentHour = (dateStr === today) ? warsawNow().getHours() : 23;

    // Save for accuracy trend
    if (dateStr === today) window._todayActualByHour = actualByHour;

    try {
        // Find active solar range
        const activeHours = Object.keys(actualByHour)
            .map(Number)
            .filter(h => actualByHour[h] > 0.001)
            .sort((a, b) => a - b);
        const startHour = activeHours.length ? activeHours[0] : null;
        const endHour = activeHours.length ? Math.min(activeHours[activeHours.length - 1], currentHour) : null;

        // Build chart data
        const hours = [];
        const fcData = [];
        const actData = [];
        for (let h = 0; h < 24; h++) {
            const fc = forecastByHour[h] || 0;
            const showAct = (dateStr === today) ? (h <= currentHour) : true;
            const act = showAct ? (actualByHour[h] || 0) : null;
            if (fc > 0 || (act != null && act > 0)) {
                hours.push(String(h).padStart(2, '0') + ':00');
                fcData.push(Math.round(fc * 1000) / 1000);
                actData.push(act != null ? Math.round(act * 1000) / 1000 : null);
            }
        }

        // Display totals: always sum full day (for today: what's expected,
        // for past days: the actual full day). Keeps the summary informative
        // even pre-sunrise when currentHour is still 0-5.
        let totalFc = 0, totalAct = 0;
        for (let h = 0; h < 24; h++) {
            totalFc += forecastByHour[h] || 0;
            totalAct += actualByHour[h] || 0;
        }
        // Progressive sums for the accuracy badge — fair partial-day comparison
        // for today (forecast capped at current hour vs. actual so far).
        const isTodayView = (dateStr === today);
        let accFc = 0, accAct = 0;
        const accEndH = isTodayView ? currentHour : 23;
        for (let h = 0; h <= accEndH; h++) {
            accFc += forecastByHour[h] || 0;
            accAct += actualByHour[h] || 0;
        }
        console.log('[hourlyFC]', dateStr, 'fcDay=' + totalFc.toFixed(3), 'actDay=' + totalAct.toFixed(3),
                    'accFc=' + accFc.toFixed(3), 'accAct=' + accAct.toFixed(3),
                    'fcHours=' + Object.keys(forecastByHour).length,
                    'actHours=' + Object.keys(actualByHour).filter(h => actualByHour[h] > 0).length);

        const section = $('hourlyForecastTodaySection');
        if (!section) return;

        // Title: "Stundliche Prognose - Mo 15.4."
        const [yy, mm, dd] = dateStr.split('-').map(Number);
        const d = new Date(yy, mm - 1, dd);
        const dayName = t('dayNames')[d.getDay()];
        const h2 = section.querySelector('h2');
        if (h2) h2.textContent = (LANG === 'de' ? 'Stündliche Prognose' : 'Hourly Forecast')
            + ' - ' + dayName + ' ' + dd + '.' + mm + '.';

        // Summary with accuracy. For today: always show. For past days: only if solar was connected.
        const sumEl = $('hourlyFcTodaySummary');
        if (sumEl) {
            const activeRange = startHour != null
                ? (String(startHour).padStart(2, '0') + ':00 - ' + String(endHour).padStart(2, '0') + ':00')
                : '--';
            const isToday = (dateStr === today);
            const hadSolar = totalAct >= 0.1;
            // Accuracy uses the progressive (fair) sums, not the full-day display.
            const showAccuracy = (isToday || hadSolar) && accFc > 0.01 && accAct > 0.01;
            const accuracy = showAccuracy
                ? Math.round((1 - Math.abs(accFc - accAct) / Math.max(accFc, accAct)) * 100)
                : null;
            const accBadge = accuracy != null
                ? '<span style="color:' + (accuracy >= 80 ? 'var(--green)' : accuracy >= 60 ? 'var(--solar)' : 'var(--red)') + '">'
                    + '🎯 ' + accuracy + '%' + (isToday && !hadSolar ? ' (bisher)' : '') + '</span>'
                : (totalFc > 0.1 && !hadSolar && !isToday
                    ? '<span style="color:var(--text-dim)">kein Solar-Eingang</span>'
                    : '');
            sumEl.innerHTML = '<span>' + (LANG === 'de' ? 'Prognose' : 'Forecast') + ': ' + fmtKwh.format(totalFc) + ' kWh</span>'
                + '<span>' + (LANG === 'de' ? 'Real' : 'Actual') + ': ' + fmtKwh.format(totalAct) + ' kWh</span>'
                + '<span>' + (LANG === 'de' ? 'Aktiv' : 'Active') + ': ' + activeRange + '</span>'
                + accBadge;
        }

        // Update nav button states
        const prevBtn = $('hfcPrev');
        const nextBtn = $('hfcNext');
        if (nextBtn) nextBtn.disabled = (dateStr >= today);

        // Past days without solar input: hide chart, show clear message
        const canvas = $('chart_hourly_forecast_today');
        const hadRealSolar = totalAct >= 0.1;
        if (!isTodayView && !hadRealSolar) {
            if (_hourlyTodayChart) { _hourlyTodayChart.destroy(); _hourlyTodayChart = null; }
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-dim').trim() || '#888';
                ctx.font = '13px -apple-system, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Kein Solar-Eingang an diesem Tag', canvas.width / 2, canvas.height / 2);
            }
            return;
        }

        if (!hours.length) {
            if (_hourlyTodayChart) { _hourlyTodayChart.destroy(); _hourlyTodayChart = null; }
            return;
        }

        if (_hourlyTodayChart) _hourlyTodayChart.destroy();
        _hourlyTodayChart = new Chart($('chart_hourly_forecast_today'), {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [
                    {
                        label: t('forecast'),
                        data: fcData,
                        backgroundColor: 'rgba(245,158,11,0.25)',
                        borderColor: '#f59e0b',
                        borderWidth: 1,
                        borderRadius: 3
                    },
                    {
                        label: t('actual'),
                        data: actData,
                        backgroundColor: '#f59e0b',
                        borderColor: '#f59e0b',
                        borderWidth: 1,
                        borderRadius: 3
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: true, position: 'top', labels: { boxWidth: 10, font: { size: 9 } } },
                    tooltip: { callbacks: { label: ctx => {
                        if (ctx.parsed.y == null) return null;
                        return ctx.dataset.label + ': ' + Math.round(ctx.parsed.y * 1000) + ' Wh';
                    } } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: chartGridColor() }, ticks: { maxTicksLimit: 5, callback: v => Math.round(v * 1000) + ' Wh' } },
                    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
                }
            }
        });
    } catch (e) { console.warn('Hourly forecast today error:', e); }
}

// === Forecast Accuracy Trend (all days with archived solar data) ===
let _hfcAccuracyChart = null;

async function buildAccuracyTrend() {
    try {
        const datesRes = await fetch('/api/solar-dates');
        const { dates } = await datesRes.json();
        if (!dates || !dates.length) return;
        const today = warsawToday();
        const currentHour = warsawNow().getHours();
        // Include today + past days (cap at 60)
        const allDates = dates.filter(d => d <= today).slice(0, 60);
        if (!allDates.length) {
            const sumEl = $('hfcAccuracySummary');
            if (sumEl) sumEl.textContent = 'Noch keine Daten vorhanden.';
            return;
        }

        // Batch-fetch archive GTI for past days (not today - archive lags)
        const pastOnly = allDates.filter(d => d < today);
        const fcByDay = {};

        if (pastOnly.length) {
            const startDate = pastOnly[pastOnly.length - 1];
            const endDate = pastOnly[0];
            const strips = await Promise.all(CURVE_STRIPS.map(s =>
                fetch('https://archive-api.open-meteo.com/v1/archive?latitude=52.1928&longitude=21.0103'
                    + '&hourly=global_tilted_irradiance'
                    + '&tilt=' + s.tilt + '&azimuth=' + AZIMUTH
                    + '&timezone=Europe%2FWarsaw'
                    + '&start_date=' + startDate + '&end_date=' + endDate
                ).then(r => r.json()).then(d => d.hourly)
            ));
            if (strips[0] && strips[0].time) {
                for (let i = 0; i < strips[0].time.length; i++) {
                    const ts = strips[0].time[i];
                    const day = ts.slice(0, 10);
                    const hour = parseInt(ts.slice(11, 13), 10);
                    let wgti = 0;
                    for (let s = 0; s < CURVE_STRIPS.length; s++) {
                        wgti += (strips[s].global_tilted_irradiance[i] || 0) * CURVE_STRIPS[s].weight;
                    }
                    const rawKwh = wgti / 1000 * PANEL_KWP * PANEL_EFFICIENCY;
                    // Apply current calibration so historical accuracy reflects
                    // the live self-learning state (auto-"retroactive recalibrate").
                    fcByDay[day] = (fcByDay[day] || 0) + applyHourCalibration(rawKwh, hour);
                }
            }
        }

        // For today: use cached hourly forecast but only sum hours 0..currentHour
        // (fair comparison vs partial actual production so far)
        if (allDates.includes(today) && window._forecastHourly) {
            let sumToday = 0;
            for (const [ts, kwh] of Object.entries(window._forecastHourly)) {
                if (!ts.startsWith(today)) continue;
                const h = parseInt(ts.slice(11, 13), 10);
                if (h <= currentHour) sumToday += kwh;
            }
            fcByDay[today] = sumToday;
        }

        // Fetch actual kWh per day
        const actByDay = {};
        await Promise.all(allDates.map(async (date) => {
            try {
                const res = await fetch('/api/hourly-solar?date=' + date);
                if (!res.ok) return;
                const d = await res.json();
                actByDay[date] = d.total_kwh || 0;
            } catch (_) {}
        }));

        // Build chart: oldest -> newest
        // Only include days with actual solar input (filter out days where system
        // was unplugged - otherwise 0 actual vs positive forecast distorts the accuracy).
        const sorted = allDates.slice().sort();
        const MIN_KWH = 0.1;  // below this: treat as "not connected" / skip
        const labels = [];
        const fcData = [];
        const actData = [];
        const accData = [];
        let sumFc = 0, sumAct = 0, nDays = 0;
        let skippedNoInput = 0;
        const isTodayFlags = [];
        for (const d of sorted) {
            const fc = fcByDay[d] || 0;
            const act = actByDay[d] || 0;
            // Skip days with no real solar input (system unplugged / broken)
            if (act < MIN_KWH) { skippedNoInput++; continue; }
            // Also skip days with no forecast (data missing)
            if (fc < 0.01) continue;
            const [yy, mm, dd] = d.split('-');
            const isToday = (d === today);
            labels.push(dd + '.' + mm + '.' + (isToday ? ' (heute)' : ''));
            fcData.push(Math.round(fc * 100) / 100);
            actData.push(Math.round(act * 100) / 100);
            const acc = Math.round((1 - Math.abs(fc - act) / Math.max(fc, act)) * 100);
            accData.push(acc);
            isTodayFlags.push(isToday);
            sumFc += fc;
            sumAct += act;
            nDays++;
        }

        // Overall summary
        const sumEl = $('hfcAccuracySummary');
        if (sumEl) {
            if (nDays === 0) {
                sumEl.innerHTML = '<span>Keine Tage mit Solar-Eingang vorhanden.</span>';
            } else {
                const overallAcc = sumFc > 0.01
                    ? Math.round((1 - Math.abs(sumFc - sumAct) / Math.max(sumFc, sumAct)) * 100)
                    : 0;
                const bias = sumFc > 0 ? Math.round((sumAct / sumFc - 1) * 100) : 0;
                const biasStr = bias > 0 ? '+' + bias + '%' : bias + '%';
                const biasLbl = bias > 5 ? 'Prognose zu niedrig' : bias < -5 ? 'Prognose zu hoch' : 'ausgeglichen';
                const skippedInfo = skippedNoInput > 0
                    ? '<span style="color:var(--text-dim)">(' + skippedNoInput + ' Tage ohne Eingang ausgeblendet)</span>'
                    : '';
                sumEl.innerHTML = '<span>📊 ' + nDays + ' Tage mit Solar</span>'
                    + '<span style="color:var(--solar)">Ø Prognose: ' + fmtKwh.format(sumFc / nDays) + ' kWh</span>'
                    + '<span>Ø Real: ' + fmtKwh.format(sumAct / nDays) + ' kWh</span>'
                    + '<span style="color:' + (overallAcc >= 80 ? 'var(--green)' : overallAcc >= 60 ? 'var(--solar)' : 'var(--red)') + '">🎯 ' + overallAcc + '% Ø</span>'
                    + '<span>Bias: ' + biasStr + ' (' + biasLbl + ')</span>'
                    + skippedInfo;
            }
        }

        if (_hfcAccuracyChart) _hfcAccuracyChart.destroy();
        _hfcAccuracyChart = new Chart($('chart_forecast_accuracy_trend'), {
            data: {
                labels,
                datasets: [
                    { type: 'bar', label: 'Prognose', data: fcData,
                      backgroundColor: 'rgba(245,158,11,0.25)', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 2, yAxisID: 'y' },
                    { type: 'bar', label: 'Real', data: actData,
                      backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 2, yAxisID: 'y' },
                    { type: 'line', label: 'Genauigkeit %', data: accData,
                      borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 2,
                      pointRadius: 2, pointHoverRadius: 5, tension: 0.3, yAxisID: 'y2', spanGaps: true }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: true, position: 'top', labels: { boxWidth: 8, font: { size: 9 } } },
                    tooltip: { callbacks: { label: ctx => {
                        if (ctx.dataset.label === 'Genauigkeit %') return 'Accuracy: ' + (ctx.parsed.y != null ? ctx.parsed.y + '%' : '-');
                        return ctx.dataset.label + ': ' + fmtKwh.format(ctx.parsed.y) + ' kWh';
                    } } }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 }, maxTicksLimit: 12, maxRotation: 0 } },
                    y: { position: 'left', beginAtZero: true, grid: { color: chartGridColor() },
                         ticks: { maxTicksLimit: 4, font: { size: 9 }, callback: v => v + ' kWh' } },
                    y2: { position: 'right', beginAtZero: true, max: 100, grid: { display: false },
                         ticks: { maxTicksLimit: 4, font: { size: 9 }, callback: v => v + '%' } }
                },
                onClick: (e, els) => {
                    if (els && els.length && sorted[els[0].index]) {
                        const [yy, mm, dd] = sorted[els[0].index].split('-').map(Number);
                        const clicked = yy + '-' + String(mm).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
                        buildHourlyForecastToday(clicked);
                        const section = $('hourlyForecastTodaySection');
                        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        });
    } catch (e) { console.warn('Accuracy trend error:', e); }
}

// === Self-Learning ML + Calibration status ===
let _hourCalChart = null;

async function buildMlStatsAndCalibration() {
    try {
        const [mlRes, calRes, pvgisRes] = await Promise.all([
            fetch('/api/ml-stats').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/solar-calibration').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/pvgis-benchmark').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        // ML stats line + diagnosis card
        const mlEl = $('mlStatsRow');
        if (mlEl) {
            const parts = [];
            // Diagnosis card (prominent at top)
            if (calRes && calRes.available && calRes.diagnosis) {
                const diag = calRes.diagnosis;
                const overallFactor = calRes.overall_factor || 1.0;
                const statusColors = {
                    ok: 'var(--green)', good_match: 'var(--green)',
                    moderate_deviation: 'var(--solar)',
                    forecast_too_high: 'var(--red)', forecast_too_low: 'var(--red)',
                    insufficient_data: 'var(--text-dim)',
                };
                const statusIcons = {
                    good_match: '✅', moderate_deviation: '⚙️',
                    forecast_too_high: '⚠️', forecast_too_low: '⚠️',
                    insufficient_data: '⏳',
                };
                const col = statusColors[diag.status] || 'var(--text)';
                const icon = statusIcons[diag.status] || '📊';
                const systemEff = Math.round((1 + diag.deviation_pct / 100) * 100);
                const appliedTo = calRes.overall_samples >= 20 ? 'aktiv angewendet' : 'sammelt noch Daten';
                const diagCard = '<div style="width:100%;padding:10px 12px;background:rgba(128,128,128,0.06);'
                    + 'border-left:3px solid ' + col + ';border-radius:6px;margin-bottom:8px">'
                    + '<div style="font-size:0.75rem;font-weight:600;color:' + col + ';margin-bottom:6px">'
                    + icon + ' ' + (diag.recommendation || '') + '</div>'
                    + '<div style="font-size:0.65rem;color:var(--text-dim);line-height:1.5">'
                    + '<div>Nameplate: <strong>' + (diag.nameplate_w || 400) + ' W</strong> · Config (× ' + Math.round((diag.configured_peak_w || 340) / (diag.nameplate_w || 400) * 100) + '%): <strong>' + diag.configured_peak_w + ' W</strong></div>'
                    + '<div>Max gemessen (MQTT): <strong style="color:var(--solar)">' + (diag.observed_peak_w || 0) + ' W</strong>'
                    + (diag.observed_peak_date ? ' <span style="opacity:0.6">(' + diag.observed_peak_date.slice(8, 10) + '.' + diag.observed_peak_date.slice(5, 7) + '.)</span>' : '')
                    + ' = <strong>' + (diag.observed_efficiency_pct || 0) + '%</strong> vom Nameplate</div>'
                    + '<div style="margin-top:4px">System-Effizienz gelernt: <strong style="color:' + col + '">' + systemEff + '%</strong> '
                    + '<span style="opacity:0.7">(' + appliedTo + ' auf alle Prognosen)</span></div>'
                    + '<div style="opacity:0.7;margin-top:2px">= Prognose × ' + (overallFactor || 1).toFixed(2) + ' automatisch</div>'
                    + '</div></div>';
                // Note: overallFactor must be defined in this scope
                parts.push(diagCard);
            }

            // PVGIS climatological benchmark card
            if (pvgisRes && pvgisRes.yearly) {
                const now = new Date();
                const curMonth = String(now.getMonth() + 1);
                const curMonthData = pvgisRes.monthly && pvgisRes.monthly[curMonth];
                const mo = curMonthData || {};
                const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
                const cfg = pvgisRes.config || {};
                const stripsLine = cfg.curve_strips
                    ? cfg.curve_strips.map(s => s.tilt + '°').join(' + ')
                    : (cfg.tilt_deg || 75) + '°';
                const model = cfg.model === 'curved_5strip' ? '5-Strip Kurven-Modell' : 'Flache Annahme';
                const pvgisCard = '<div style="width:100%;padding:10px 12px;background:rgba(96,165,250,0.08);'
                    + 'border-left:3px solid var(--blue);border-radius:6px;margin-bottom:8px">'
                    + '<div style="font-size:0.72rem;font-weight:600;color:var(--blue);margin-bottom:6px">'
                    + '🛰️ PVGIS Klimatologie-Benchmark (SARAH-2, 15 Jahre Satellit)</div>'
                    + '<div style="font-size:0.65rem;color:var(--text-dim);line-height:1.5">'
                    + '<div>Erwartet ' + monthNames[now.getMonth()] + ': <strong>' + (mo.monthly_kwh || 0) + ' kWh</strong> '
                    + '<span style="opacity:0.7">(Ø ' + (mo.daily_avg_kwh || 0) + ' kWh/Tag)</span></div>'
                    + '<div>Jahresertrag erwartet: <strong>' + pvgisRes.yearly.total_kwh + ' kWh</strong> '
                    + '<span style="opacity:0.7">(Ø ' + pvgisRes.yearly.daily_avg_kwh + ' kWh/Tag)</span></div>'
                    + '<div style="opacity:0.7;margin-top:4px">Setup: ' + model + '</div>'
                    + '<div style="opacity:0.7">Lat ' + cfg.lat + '° · Lon ' + cfg.lon + '° · Aspect ' + cfg.aspect_deg + '° WSW · '
                    + cfg.peakpower_kw + ' kWp · Verluste ' + cfg.loss_pct + '%</div>'
                    + '<div style="opacity:0.7">Panel-Kurve: ' + stripsLine + ' (je 20%)</div>'
                    + '</div></div>';
                parts.push(pvgisCard);
            }

            // Details line
            const details = [];
            if (mlRes && mlRes.available) {
                const m = mlRes.metrics || {};
                const name = mlRes.type === 'sklearn_gbr' ? 'GradientBoosting' : 'LinearRegression';
                details.push('🧠 ML-Tagesprognose aktiv: ' + name + ' (n=' + (mlRes.n_train || 0) + ' Tage)');
                if (m.r2 != null) details.push('R²: ' + m.r2);
                if (m.mae_kwh != null) details.push('Ø Fehler: ±' + fmtKwh.format(m.mae_kwh) + ' kWh');
                if (m.mape_pct != null) details.push('MAPE: ' + m.mape_pct + '%');
            } else {
                const haveN = (mlRes && mlRes.n_available) || 0;
                const needN = (mlRes && mlRes.min_to_train) || 5;
                const gbrN = (mlRes && mlRes.gbr_from) || 20;
                details.push('🧠 ML-Tagesprognose: sammelt Daten (' + haveN + '/' + needN + ' Tage, GBR ab ' + gbrN + ')');
            }
            if (calRes && calRes.available) {
                details.push('📚 Selbstlernende Stunden-Kalibrierung aktiv: aus '
                    + (calRes.sample_days || 0) + ' Tagen / '
                    + (calRes.sample_hours || 0) + ' Stunden gelernt');
            } else {
                details.push('📚 Stunden-Kalibrierung: noch zu wenig Daten');
            }
            parts.push('<span style="width:100%;font-size:0.68rem">'
                + details.map(d => '<span style="margin-right:10px">' + d + '</span>').join('')
                + '</span>');
            mlEl.innerHTML = parts.join('');
        }

        // Per-hour calibration chart
        if (calRes && calRes.available && calRes.hour_factors) {
            const hours = [];
            const factors = [];
            const confidences = [];
            for (let h = 0; h < 24; h++) {
                const hf = calRes.hour_factors[String(h)];
                hours.push(String(h).padStart(2, '0'));
                factors.push(hf ? hf.factor : 1.0);
                confidences.push(hf ? Math.round((hf.confidence || 0) * 100) : 0);
            }
            if (_hourCalChart) _hourCalChart.destroy();
            const canvas = $('chart_hour_calibration');
            if (canvas) {
                _hourCalChart = new Chart(canvas, {
                    data: {
                        labels: hours,
                        datasets: [
                            { type: 'bar', label: 'Faktor (1.0 = Prognose exakt)',
                              data: factors,
                              backgroundColor: factors.map(f => f >= 0.9 && f <= 1.1 ? 'rgba(34,197,94,0.5)' : 'rgba(245,158,11,0.5)'),
                              borderColor: factors.map(f => f >= 0.9 && f <= 1.1 ? '#22c55e' : '#f59e0b'),
                              borderWidth: 1, borderRadius: 2, yAxisID: 'y' },
                            { type: 'line', label: 'Konfidenz %', data: confidences,
                              borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)',
                              borderWidth: 2, tension: 0.3, pointRadius: 2, yAxisID: 'y2' }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, animation: false,
                        interaction: { intersect: false, mode: 'index' },
                        plugins: {
                            legend: { display: true, position: 'top', labels: { boxWidth: 8, font: { size: 9 } } },
                            tooltip: { callbacks: { label: ctx => {
                                if (ctx.dataset.label.startsWith('Faktor')) {
                                    const hf = calRes.hour_factors[String(ctx.dataIndex)] || {};
                                    return 'Faktor: ' + ctx.parsed.y.toFixed(2) + 'x (n=' + (hf.samples || 0) + ')';
                                }
                                return ctx.dataset.label + ': ' + ctx.parsed.y + '%';
                            } } }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { maxTicksLimit: 12, font: { size: 9 } } },
                            y: { position: 'left', beginAtZero: true, suggestedMax: 2,
                                 grid: { color: chartGridColor() },
                                 ticks: { maxTicksLimit: 4, font: { size: 9 }, callback: v => v.toFixed(1) + 'x' } },
                            y2: { position: 'right', beginAtZero: true, max: 100, grid: { display: false },
                                 ticks: { maxTicksLimit: 4, font: { size: 9 }, callback: v => v + '%' } }
                        }
                    }
                });
            }
        } else if (_hourCalChart) {
            _hourCalChart.destroy();
            _hourCalChart = null;
        }
    } catch (e) { console.warn('ML stats error:', e); }
}

setTimeout(buildMlStatsAndCalibration, 8000);
setInterval(buildMlStatsAndCalibration, 1800000);  // every 30 min


// === 🌑 Schattenwurf-Analyse ===
// Interprets the existing hour_factors from calibration: a hour whose
// residual is persistently well below 1.0 with enough samples is likely
// being shaded by something fixed (house across the street, railing, etc).
function buildShadingInsights() {
    const el = $('shadingInsights');
    if (!el) return;
    const cal = window._solarCalibration;
    if (!cal || !cal.available || !cal.hour_factors) {
        el.innerHTML = '<span>Noch zu wenig Daten - benötigt mindestens 3 Samples pro Stunde.</span>';
        return;
    }
    const SHADE_THRESHOLD = 0.75;  // residual below = systematic loss
    const OVERPRODUCE_THRESHOLD = 1.25;  // way above average = reflection / edge
    const MIN_SAMPLES = 3;

    const suspects = [];
    const reflectors = [];
    for (let h = 0; h < 24; h++) {
        const hf = cal.hour_factors[String(h)];
        if (!hf || (hf.samples || 0) < MIN_SAMPLES) continue;
        const residual = hf.residual != null ? hf.residual : hf.factor;
        if (residual < SHADE_THRESHOLD) {
            suspects.push({ hour: h, residual, samples: hf.samples, loss: Math.round((1 - residual) * 100) });
        } else if (residual > OVERPRODUCE_THRESHOLD) {
            reflectors.push({ hour: h, residual, samples: hf.samples, gain: Math.round((residual - 1) * 100) });
        }
    }

    const parts = [];
    if (suspects.length) {
        suspects.sort((a, b) => a.residual - b.residual);
        const list = suspects.map(s =>
            '<span style="color:var(--red)">' + String(s.hour).padStart(2, '0') + ':00 (−' + s.loss + '%, n=' + s.samples + ')</span>'
        ).join(', ');
        parts.push('<div>⚠️ <strong>Verdacht auf Schatten:</strong> ' + list + '</div>');
        parts.push('<div style="opacity:0.7;margin-top:2px">Konstanter Verlust zur gleichen Uhrzeit → fester Schattenwurf (Gebäude, Geländer, Baum).</div>');
    }
    if (reflectors.length) {
        const list = reflectors.map(s =>
            '<span style="color:var(--green)">' + String(s.hour).padStart(2, '0') + ':00 (+' + s.gain + '%, n=' + s.samples + ')</span>'
        ).join(', ');
        parts.push('<div style="margin-top:4px">✨ <strong>Mehr als erwartet:</strong> ' + list + '</div>');
        parts.push('<div style="opacity:0.7;margin-top:2px">Reflexionen von Fassade/Boden oder Modell unterschätzt diese Stunde.</div>');
    }
    if (!suspects.length && !reflectors.length) {
        parts.push('<div>✅ Kein systematischer Schatten erkannt - alle Stunden bewegen sich im Erwartungsbereich (0.75-1.25x).</div>');
    }

    // Bias-by-time-of-day summary
    const morning = [], midday = [], evening = [];
    for (let h = 0; h < 24; h++) {
        const hf = cal.hour_factors[String(h)];
        if (!hf || (hf.samples || 0) < MIN_SAMPLES) continue;
        const residual = hf.residual != null ? hf.residual : hf.factor;
        if (h >= 6 && h <= 10) morning.push(residual);
        else if (h >= 11 && h <= 15) midday.push(residual);
        else if (h >= 16 && h <= 20) evening.push(residual);
    }
    const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    const fmtPct = (v) => v == null ? '–' : ((v - 1) * 100 >= 0 ? '+' : '') + Math.round((v - 1) * 100) + '%';
    parts.push('<div style="margin-top:6px;opacity:0.85">'
        + 'Morgen (6-10): <strong>' + fmtPct(avg(morning)) + '</strong> · '
        + 'Mittag (11-15): <strong>' + fmtPct(avg(midday)) + '</strong> · '
        + 'Abend (16-20): <strong>' + fmtPct(avg(evening)) + '</strong>'
        + '</div>');

    el.innerHTML = parts.join('');
}


// === ☁️ Wetter-konditionierte Accuracy ===
// Uses cloud_factors from calibration (buckets 0-25%, 25-50%, 50-75%, 75-100%).
// Shows how accurate our forecast is under different cloud conditions.
let _weatherAccChart = null;
function buildWeatherAccuracy() {
    const row = $('weatherAccuracyRow');
    const cal = window._solarCalibration;
    if (!cal || !cal.available || !cal.cloud_factors) {
        if (row) row.innerHTML = '<span>Noch keine Cloud-Daten - Kalibrierung braucht mehr Samples.</span>';
        if (_weatherAccChart) { _weatherAccChart.destroy(); _weatherAccChart = null; }
        return;
    }

    const buckets = ['0-25% Wolken', '25-50% Wolken', '50-75% Wolken', '75-100% Wolken'];
    const icons = ['☀️', '⛅', '🌥️', '☁️'];
    const factors = [];
    const samples = [];
    for (let i = 0; i < 4; i++) {
        const cf = cal.cloud_factors[String(i)];
        factors.push(cf ? cf.factor : 1.0);
        samples.push(cf ? (cf.samples || 0) : 0);
    }

    if (row) {
        const parts = [];
        for (let i = 0; i < 4; i++) {
            const f = factors[i];
            const dev = Math.round((f - 1) * 100);
            const devStr = (dev >= 0 ? '+' : '') + dev + '%';
            const col = Math.abs(dev) <= 15 ? 'var(--green)' : Math.abs(dev) <= 30 ? 'var(--solar)' : 'var(--red)';
            const sampleLabel = samples[i] < 3 ? ' <span style="opacity:0.5">(zu wenig Daten)</span>' : '';
            parts.push('<div style="display:inline-block;margin-right:14px">'
                + icons[i] + ' ' + buckets[i] + ': <strong style="color:' + col + '">' + devStr + '</strong> '
                + '<span style="opacity:0.6">n=' + samples[i] + '</span>'
                + sampleLabel + '</div>');
        }
        row.innerHTML = parts.join('');
    }

    const canvas = $('chart_weather_accuracy');
    if (!canvas) return;
    if (_weatherAccChart) _weatherAccChart.destroy();
    _weatherAccChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: buckets.map((b, i) => icons[i] + ' ' + b),
            datasets: [{
                label: 'Faktor (1.0 = exakte Prognose)',
                data: factors,
                backgroundColor: factors.map(f => Math.abs(f - 1) <= 0.15 ? 'rgba(34,197,94,0.5)'
                    : Math.abs(f - 1) <= 0.3 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'),
                borderColor: factors.map(f => Math.abs(f - 1) <= 0.15 ? '#22c55e'
                    : Math.abs(f - 1) <= 0.3 ? '#f59e0b' : '#ef4444'),
                borderWidth: 1, borderRadius: 2,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => {
                    const s = samples[ctx.dataIndex];
                    return 'Faktor: ' + ctx.parsed.y.toFixed(2) + 'x (n=' + s + ')';
                } } }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                y: { beginAtZero: true, suggestedMax: 1.5, grid: { color: chartGridColor() },
                     ticks: { maxTicksLimit: 4, font: { size: 9 }, callback: v => v.toFixed(1) + 'x' } }
            }
        }
    });
}


// Render the insight cards together. Called after calibration refresh
// so they use the fresh data.
function buildAuxInsights() {
    buildShadingInsights();
    buildWeatherAccuracy();
}

setTimeout(buildAuxInsights, 9500);
setInterval(buildAuxInsights, 1800000);  // every 30 min

// Date picker wiring - prev/next skip days without solar input (past days only).
// List of days WITH solar input cached globally after /api/solar-dates fetch.
window._solarDaysWithInput = null;

async function _getSolarDaysWithInput() {
    if (window._solarDaysWithInput) return window._solarDaysWithInput;
    try {
        const res = await fetch('/api/solar-dates');
        const { dates } = await res.json();
        if (!dates) return [];
        // Fetch actual kWh for each and keep only days with >= 0.1 kWh
        const results = await Promise.all(dates.map(async (d) => {
            try {
                const r = await fetch('/api/hourly-solar?date=' + d);
                if (!r.ok) return null;
                const data = await r.json();
                return (data.total_kwh || 0) >= 0.1 ? d : null;
            } catch { return null; }
        }));
        window._solarDaysWithInput = results.filter(Boolean).sort();
        return window._solarDaysWithInput;
    } catch { return []; }
}

(function initHfcDatePicker() {
    const dateInput = $('hfcDate');
    const prevBtn = $('hfcPrev');
    const nextBtn = $('hfcNext');
    const todayBtn = $('hfcToday');
    const today = warsawToday();
    if (dateInput) {
        dateInput.max = today;
        dateInput.value = today;
        dateInput.addEventListener('change', () => buildHourlyForecastToday(dateInput.value));
    }
    const shift = async (direction) => {
        const cur = _hfcSelectedDate || today;
        const validDays = await _getSolarDaysWithInput();
        // Build sorted list: [valid past days..., today]
        const candidates = validDays.filter(d => d !== today).concat([today]);
        const idx = candidates.indexOf(cur);
        let targetIdx;
        if (idx === -1) {
            // Current date not in list - snap to nearest valid
            targetIdx = candidates.findIndex(d => d > cur);
            if (direction > 0 && targetIdx === -1) return;
            if (direction < 0) targetIdx = targetIdx === -1 ? candidates.length - 1 : Math.max(0, targetIdx - 1);
        } else {
            targetIdx = idx + direction;
        }
        if (targetIdx < 0 || targetIdx >= candidates.length) return;
        buildHourlyForecastToday(candidates[targetIdx]);
    };
    if (prevBtn) prevBtn.addEventListener('click', () => shift(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => shift(1));
    if (todayBtn) todayBtn.addEventListener('click', () => buildHourlyForecastToday(today));
})();

loadForecast();
setInterval(loadForecast, 3600000);
// Build today chart after forecast loads (needs _forecastHourly)
setTimeout(() => buildHourlyForecastToday(), 4000);
setInterval(() => { if ((_hfcSelectedDate || warsawToday()) === warsawToday()) buildHourlyForecastToday(); }, 300000);
// Build accuracy trend once after page load, then every 30 min
setTimeout(buildAccuracyTrend, 6000);
setInterval(buildAccuracyTrend, 1800000);

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

// === Autarkie-Trend ===
let _autarkieChart = null;
async function loadAutarkieTrend(days) {
    try {
        const _autarkieData = await getDailyData();
        const data = _autarkieData.slice(0, days).slice().reverse();
        if (!data.length) return;

        const labels = data.map(d => {
            const dt = new Date(d.date);
            return dt.getDate() + '.' + (dt.getMonth() + 1) + '.';
        });
        const autarkieValues = data.map(d => d.autarkie_pct || 0);
        const eigenverbrauchValues = data.map(d => d.direct_use_pct || 0);

        // KPI cards
        const validAut = autarkieValues.filter(v => v > 0);
        const validEigen = eigenverbrauchValues.filter(v => v > 0);
        const avgAut = validAut.length ? Math.round(validAut.reduce((s, v) => s + v, 0) / validAut.length) : 0;
        const avgEigen = validEigen.length ? Math.round(validEigen.reduce((s, v) => s + v, 0) / validEigen.length) : 0;
        const maxAut = validAut.length ? Math.round(Math.max(...validAut)) : 0;
        const daysAbove80 = validAut.filter(v => v >= 80).length;

        const kpiEl = $('autarkieKpis');
        if (kpiEl) {
            kpiEl.innerHTML =
                '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? 'Autarkie' : 'Self-sufficiency') + '</div>'
                    + '<div class="mfc-kpi-value green">' + avgAut + '%</div>'
                    + '<div class="mfc-kpi-sub">\u00D8 ' + validAut.length + (LANG === 'de' ? ' Tage' : ' days') + '</div>'
                + '</div>'
                + '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? 'Eigenverbrauch' : 'Self-consumption') + '</div>'
                    + '<div class="mfc-kpi-value amber">' + avgEigen + '%</div>'
                    + '<div class="mfc-kpi-sub">\u00D8 ' + validEigen.length + (LANG === 'de' ? ' Tage' : ' days') + '</div>'
                + '</div>'
                + '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? 'Tage \u226580%' : 'Days \u226580%') + '</div>'
                    + '<div class="mfc-kpi-value dim">' + daysAbove80 + '</div>'
                    + '<div class="mfc-kpi-sub">Max ' + maxAut + '%</div>'
                + '</div>';
        }

        if (_autarkieChart) _autarkieChart.destroy();
        _autarkieChart = new Chart($('chart_autarkie_trend'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: LANG === 'de' ? 'Autarkie %' : 'Self-sufficiency %',
                        data: autarkieValues,
                        borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',
                        fill: true, tension: 0.35, borderWidth: 2,
                        pointRadius: days > 90 ? 0 : 2, pointHoverRadius: 4,
                        pointBackgroundColor: '#22c55e'
                    },
                    {
                        label: LANG === 'de' ? 'Eigenverbrauch %' : 'Self-consumption %',
                        data: eigenverbrauchValues,
                        borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)',
                        fill: true, tension: 0.35, borderWidth: 2,
                        pointRadius: days > 90 ? 0 : 2, pointHoverRadius: 4,
                        pointBackgroundColor: '#f59e0b'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: true, position: 'top', labels: { boxWidth: 10, font: { size: 9 } } },
                    tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + Math.round(ctx.parsed.y) + '%' } }
                },
                scales: {
                    y: { min: 0, max: 100, grid: { color: chartGridColor() }, ticks: { maxTicksLimit: 5, callback: v => v + '%' } },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: days > 90 ? 8 : 10, maxRotation: 45, font: { size: 9 } } }
                }
            }
        });
        $('autarkieTrendSection').style.display = '';
    } catch (e) { console.warn('Autarkie trend error:', e); }
}

loadAutarkieTrend(30);

// Tab switching for Autarkie
document.querySelectorAll('#autarkieTabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#autarkieTabs .tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadAutarkieTrend(parseInt(btn.dataset.autdays));
    });
});

// === Wetter-Korrelation ===
let _weatherCorrChart = null;

async function loadWeatherCorrelation() {
    try {
        const dailyData = await getDailyData();
        if (dailyData.length < 7) return;

        // Determine date range from daily data
        const dates = dailyData.map(d => d.date).sort();
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];

        // Fetch historical weather codes from Open-Meteo archive
        const weatherRes = await fetch(
            'https://archive-api.open-meteo.com/v1/archive?latitude=52.1928&longitude=21.0103'
            + '&daily=weather_code,sunshine_duration,cloud_cover_mean'
            + '&timezone=Europe%2FWarsaw'
            + '&start_date=' + startDate + '&end_date=' + endDate
        );
        const weatherData = await weatherRes.json();
        if (!weatherData.daily || !weatherData.daily.time) return;

        // Build weather lookup by date
        const weatherByDate = {};
        for (let i = 0; i < weatherData.daily.time.length; i++) {
            weatherByDate[weatherData.daily.time[i]] = {
                code: weatherData.daily.weather_code[i],
                sunshine: weatherData.daily.sunshine_duration[i] || 0,
                cloud: weatherData.daily.cloud_cover_mean[i] || 0
            };
        }

        // Categorize WMO weather codes into groups
        function weatherCategory(code) {
            if (code <= 1) return 'sunny';
            if (code <= 2) return 'partly';
            if (code <= 3) return 'cloudy';
            if (code >= 51) return 'rain';
            return 'fog'; // 45, 48
        }

        const catConfig = {
            sunny:  { label: LANG === 'de' ? 'Sonnig' : 'Sunny',         icon: '\u2600\uFE0F', color: '#f59e0b' },
            partly: { label: LANG === 'de' ? 'Teilw. bew.' : 'Partly cl.', icon: '\u26C5',      color: '#fbbf24' },
            cloudy: { label: LANG === 'de' ? 'Bew\u00F6lkt' : 'Overcast',  icon: '\u2601\uFE0F', color: '#94a3b8' },
            rain:   { label: LANG === 'de' ? 'Regen' : 'Rain',           icon: '\uD83C\uDF27\uFE0F', color: '#60a5fa' },
            fog:    { label: LANG === 'de' ? 'Nebel' : 'Fog',            icon: '\uD83C\uDF2B\uFE0F', color: '#cbd5e1' }
        };

        // Aggregate production per category
        const catData = {};
        for (const cat of Object.keys(catConfig)) catData[cat] = { total: 0, count: 0, values: [] };

        for (const d of dailyData) {
            const w = weatherByDate[d.date];
            if (!w || d.solar_kwh == null) continue;
            const cat = weatherCategory(w.code);
            catData[cat].total += d.solar_kwh;
            catData[cat].count++;
            catData[cat].values.push(d.solar_kwh);
        }

        // Build chart data - only categories with data
        const cats = Object.keys(catConfig).filter(c => catData[c].count > 0);
        const sunnyAvg = catData.sunny.count > 0 ? catData.sunny.total / catData.sunny.count : 1;

        // Summary chips
        const summaryEl = $('weatherCorrelationSummary');
        if (summaryEl) {
            summaryEl.innerHTML = cats.map(c => {
                const avg = catData[c].total / catData[c].count;
                const pct = sunnyAvg > 0 ? Math.round(avg / sunnyAvg * 100) : 0;
                return '<div class="wc-chip">'
                    + '<span class="wc-chip-icon">' + catConfig[c].icon + '</span>'
                    + '<span>' + catConfig[c].label + '</span>'
                    + '<span class="wc-chip-value">' + fmtKwh.format(avg) + ' kWh</span>'
                    + (c !== 'sunny' ? '<span class="wc-chip-pct">(' + pct + '% ' + (LANG === 'de' ? 'v. Sonne' : 'of sunny') + ')</span>' : '')
                    + '</div>';
            }).join('');
        }

        const labels = cats.map(c => catConfig[c].label);
        const avgValues = cats.map(c => Math.round(catData[c].total / catData[c].count * 100) / 100);
        const colors = cats.map(c => catConfig[c].color);
        const counts = cats.map(c => catData[c].count);

        // Box plot-style: show min, avg, max per category
        const minValues = cats.map(c => Math.round(Math.min(...catData[c].values) * 100) / 100);
        const maxValues = cats.map(c => Math.round(Math.max(...catData[c].values) * 100) / 100);

        if (_weatherCorrChart) _weatherCorrChart.destroy();
        _weatherCorrChart = new Chart($('chart_weather_correlation'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: LANG === 'de' ? '\u00D8 Ertrag' : '\u00D8 Yield',
                        data: avgValues,
                        backgroundColor: colors.map(c => c + 'cc'),
                        borderColor: colors,
                        borderWidth: 1,
                        borderRadius: 6,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => {
                        const i = ctx.dataIndex;
                        return '\u00D8 ' + fmtKwh.format(avgValues[i]) + ' kWh'
                            + ' (Min ' + fmtKwh.format(minValues[i]) + ', Max ' + fmtKwh.format(maxValues[i]) + ')'
                            + ' - ' + counts[i] + (LANG === 'de' ? ' Tage' : ' days');
                    } } }
                },
                scales: {
                    x: { beginAtZero: true, grid: { color: chartGridColor() }, ticks: { callback: v => v + ' kWh' } },
                    y: { grid: { display: false } }
                }
            },
            plugins: [{
                id: 'barLabels',
                afterDatasetsDraw(chart) {
                    const ctx2 = chart.ctx;
                    const meta = chart.getDatasetMeta(0);
                    ctx2.font = 'bold 10px system-ui';
                    ctx2.textBaseline = 'middle';
                    meta.data.forEach((bar, i) => {
                        const pct = sunnyAvg > 0 ? Math.round(avgValues[i] / sunnyAvg * 100) : 0;
                        ctx2.fillStyle = '#fff';
                        ctx2.textAlign = 'left';
                        ctx2.fillText(fmtKwh.format(avgValues[i]) + ' kWh', bar.x + 6, bar.y);
                        ctx2.font = '9px system-ui';
                        ctx2.fillStyle = '#888';
                        ctx2.fillText('(' + counts[i] + 'd)', bar.x + 6, bar.y + 12);
                        ctx2.font = 'bold 10px system-ui';
                    });
                }
            }]
        });
        $('weatherCorrelationSection').style.display = '';
    } catch (e) { console.warn('Weather correlation error:', e); }
}

loadWeatherCorrelation();

// === Eigenverbrauchs-Optimierung ===
let _selfConsOptChart = null;

async function loadSelfConsumptionOpt() {
    try {
        const res = await fetch('/api/daily?days=90');
        const data = await res.json();
        if (!data.length) return;

        // Filter out future dates
        const todayDate = warsawToday();
        const filtered = data.filter(d => d.date <= todayDate);
        if (!filtered.length) return;

        // Aggregate totals
        let totalSolar = 0, totalDirectUse = 0, totalBatteryIn = 0, totalBatteryOut = 0;
        let totalCharge = 0, totalOutput = 0;
        for (const d of filtered) {
            totalSolar += d.solar_kwh || 0;
            totalDirectUse += d.direct_use_kwh || 0;
            totalBatteryIn += d.battery_in_kwh || 0;
            totalBatteryOut += d.battery_out_kwh || 0;
            totalCharge += d.total_charge_kwh || 0;
            totalOutput += d.total_output_kwh || 0;
        }

        // Solar allocation: where does produced solar go?
        const batteryLoss = Math.max(0, totalBatteryIn - totalBatteryOut);
        const surplus = Math.max(0, totalSolar - totalDirectUse - totalBatteryIn);

        // Self-consumption rate = (directUse + batteryIn) / solar
        const selfConsRate = totalSolar > 0 ? Math.round((totalDirectUse + totalBatteryIn) / totalSolar * 100) : 0;
        // Autarky rate = (directUse + batteryOut) / output
        const autarkyRate = totalOutput > 0 ? Math.round((totalDirectUse + totalBatteryOut) / totalOutput * 100) : 0;
        // Battery efficiency
        const rte = totalBatteryIn > 0 ? Math.round(totalBatteryOut / totalBatteryIn * 100) : 0;

        const kpiEl = $('selfConsOptKpis');
        if (kpiEl) {
            kpiEl.innerHTML =
                '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? 'Eigenverbrauch' : 'Self-consumption') + '</div>'
                    + '<div class="mfc-kpi-value amber">' + selfConsRate + '%</div>'
                    + '<div class="mfc-kpi-sub">' + fmtKwh.format(totalDirectUse + totalBatteryIn) + ' / ' + fmtKwh.format(totalSolar) + ' kWh</div>'
                + '</div>'
                + '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? 'Netz-Anteil' : 'Grid share') + '</div>'
                    + '<div class="mfc-kpi-value dim">' + (totalOutput > 0 ? Math.round(totalCharge / totalOutput * 100) : 0) + '%</div>'
                    + '<div class="mfc-kpi-sub">' + fmtKwh.format(totalCharge) + ' kWh ' + (LANG === 'de' ? 'vom Netz' : 'from grid') + '</div>'
                + '</div>'
                + '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? 'Akku-Durchsatz' : 'Battery throughput') + '</div>'
                    + '<div class="mfc-kpi-value">' + fmtKwh.format(totalBatteryOut) + '</div>'
                    + '<div class="mfc-kpi-sub">' + fmtKwh.format(totalBatteryIn) + ' rein · kWh entnommen</div>'
                + '</div>';
        }

        // Stacked bar: where solar energy goes (per month)
        const monthlyBreakdown = {};
        for (const d of filtered) {
            const mm = d.date.slice(0, 7); // YYYY-MM
            if (!monthlyBreakdown[mm]) monthlyBreakdown[mm] = { direct: 0, battery: 0, grid: 0, surplus: 0 };
            const mb = monthlyBreakdown[mm];
            mb.direct += d.direct_use_kwh || 0;
            mb.battery += d.battery_in_kwh || 0;
            mb.grid += d.total_charge_kwh || 0;
            const daySurplus = Math.max(0, (d.solar_kwh || 0) - (d.direct_use_kwh || 0) - (d.battery_in_kwh || 0));
            mb.surplus += daySurplus;
        }

        const months = Object.keys(monthlyBreakdown).sort();
        const monthLabels = months.map(m => {
            const [y, mm] = m.split('-');
            const names = LANG === 'de'
                ? ['Jan', 'Feb', 'M\u00E4r', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
                : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return names[parseInt(mm) - 1] + " '" + y.slice(2);
        });

        if (_selfConsOptChart) _selfConsOptChart.destroy();
        _selfConsOptChart = new Chart($('chart_self_consumption_opt'), {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        label: LANG === 'de' ? 'Direktverbrauch' : 'Direct use',
                        data: months.map(m => Math.round(monthlyBreakdown[m].direct * 10) / 10),
                        backgroundColor: '#f59e0b',
                        borderRadius: 2
                    },
                    {
                        label: LANG === 'de' ? 'Batterie' : 'Battery',
                        data: months.map(m => Math.round(monthlyBreakdown[m].battery * 10) / 10),
                        backgroundColor: '#22c55e',
                        borderRadius: 2
                    },
                    {
                        label: LANG === 'de' ? 'Netz-Ladung' : 'Grid charge',
                        data: months.map(m => Math.round(monthlyBreakdown[m].grid * 10) / 10),
                        backgroundColor: '#60a5fa',
                        borderRadius: 2
                    },
                    {
                        label: LANG === 'de' ? '\u00DCberschuss' : 'Surplus',
                        data: months.map(m => Math.round(monthlyBreakdown[m].surplus * 10) / 10),
                        backgroundColor: 'rgba(148,163,184,0.3)',
                        borderRadius: 2
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    x: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 } } },
                    y: { stacked: true, beginAtZero: true, grid: { color: chartGridColor() }, ticks: { maxTicksLimit: 5, callback: v => v + ' kWh' } }
                },
                plugins: {
                    legend: { display: true, position: 'top', labels: { boxWidth: 10, font: { size: 9 } } },
                    tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtKwh.format(ctx.parsed.y) + ' kWh' } }
                }
            }
        });
        $('selfConsumptionOptSection').style.display = '';
    } catch (e) { console.warn('Self-consumption opt error:', e); }
}

loadSelfConsumptionOpt();

// === Temperature vs Production (scatter) ===
let _tempVsProdChart = null;

async function loadTempVsProduction() {
    try {
        const data = await getDailyData();
        const points = data.filter(d => d.avg_temp != null && d.solar_kwh > 0).map(d => ({
            x: d.avg_temp,
            y: d.solar_kwh
        }));
        if (points.length < 7) return;

        if (_tempVsProdChart) _tempVsProdChart.destroy();
        _tempVsProdChart = new Chart($('chart_temp_vs_production'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: LANG === 'de' ? 'Tagesproduktion' : 'Daily production',
                    data: points,
                    backgroundColor: 'rgba(245,158,11,0.5)',
                    borderColor: '#f59e0b',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        title: { display: true, text: LANG === 'de' ? 'Temperatur (\u00B0C)' : 'Temperature (\u00B0C)', color: '#aaa' },
                        ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    y: {
                        title: { display: true, text: 'kWh', color: '#aaa' },
                        ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.06)' }
                    }
                }
            }
        });
        $('tempVsProductionSection').style.display = '';
    } catch (e) { console.warn('Temp vs production error:', e); }
}

loadTempVsProduction();

// === SOC Range (min/max per day) ===
let _socRangeChart = null;

async function loadSocRange() {
    try {
        const raw = await getDailyData();
        const data = raw.filter(d => d.min_soc != null && d.max_soc != null).slice(0, 90).slice().reverse();
        if (data.length < 3) return;

        const labels = data.map(d => {
            const dt = new Date(d.date);
            return dt.getDate() + '.' + (dt.getMonth() + 1) + '.';
        });

        if (_socRangeChart) _socRangeChart.destroy();
        _socRangeChart = new Chart($('chart_soc_range'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Min SOC',
                        data: data.map(d => d.min_soc),
                        backgroundColor: 'rgba(255,255,255,0)',
                        borderColor: 'transparent',
                        borderSkipped: false,
                        order: 1
                    },
                    {
                        label: LANG === 'de' ? 'Batterie-Bereich' : 'Battery Range',
                        data: data.map(d => d.max_soc - d.min_soc),
                        backgroundColor: 'rgba(34,197,94,0.5)',
                        borderColor: '#22c55e',
                        borderWidth: 1,
                        borderSkipped: false,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const i = ctx.dataIndex;
                                return 'SOC: ' + data[i].min_soc + '% - ' + data[i].max_soc + '%';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#aaa', maxTicksLimit: 15 },
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        min: 0, max: 100,
                        ticks: { color: '#aaa', callback: v => v + '%' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    }
                }
            }
        });
        $('socRangeSection').style.display = '';
    } catch (e) { console.warn('SOC range error:', e); }
}

loadSocRange();

// === Peak Output Trend ===
let _peakOutputChart = null;

async function loadPeakOutput() {
    try {
        const raw = await getDailyData();
        const data = raw.filter(d => d.peak_output_w > 0).slice(0, 90).slice().reverse();
        if (data.length < 3) return;

        const labels = data.map(d => {
            const dt = new Date(d.date);
            return dt.getDate() + '.' + (dt.getMonth() + 1) + '.';
        });
        const values = data.map(d => d.peak_output_w);
        const avgPeak = Math.round(values.reduce((s, v) => s + v, 0) / values.length);

        if (_peakOutputChart) _peakOutputChart.destroy();
        _peakOutputChart = new Chart($('chart_peak_output'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Peak W',
                        data: values,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    },
                    {
                        label: '\u00D8 Peak',
                        data: Array(values.length).fill(avgPeak),
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderDash: [5, 5],
                        borderWidth: 1,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#aaa', boxWidth: 12 } }
                },
                scales: {
                    x: {
                        ticks: { color: '#aaa', maxTicksLimit: 15 },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: '#aaa', callback: v => v + 'W' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    }
                }
            }
        });
        $('peakOutputSection').style.display = '';
    } catch (e) { console.warn('Peak output error:', e); }
}

loadPeakOutput();

// === Charging Analysis (Serial vs Parallel) ===
let _chargingScatterChart = null;
let _chargingRateBarsChart = null;
let _chargingDurationChart = null;

async function loadChargingAnalysis() {
    try {
        const res = await fetch('/api/charging-sessions?days=90');
        const result = await res.json();
        const sessions = result.sessions || [];
        const stats = result.stats || {};
        if (!sessions.length) return;

        // KPI cards
        const kpiEl = $('chargingKpis');
        if (kpiEl) {
            const estH = Math.floor(stats.est_full_charge_min / 60);
            const estM = stats.est_full_charge_min % 60;
            kpiEl.innerHTML =
                '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? 'Ladegeschwindigkeit' : 'Charge rate') + '</div>'
                    + '<div class="mfc-kpi-value amber">' + stats.avg_rate_pct_h + '%/h</div>'
                    + '<div class="mfc-kpi-sub">Max ' + stats.max_rate_pct_h + '%/h</div>'
                + '</div>'
                + '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? '\u00D8 Ladedauer' : 'Avg duration') + '</div>'
                    + '<div class="mfc-kpi-value green">' + stats.avg_duration_min + ' min</div>'
                    + '<div class="mfc-kpi-sub">\u00D8 +' + stats.avg_soc_gained + '% SOC</div>'
                + '</div>'
                + '<div class="mfc-kpi">'
                    + '<div class="mfc-kpi-label">' + (LANG === 'de' ? '0-100% geschatzt' : '0-100% est.') + '</div>'
                    + '<div class="mfc-kpi-value dim">' + estH + 'h ' + estM + 'min</div>'
                    + '<div class="mfc-kpi-sub">' + stats.total_sessions + ' Sessions</div>'
                + '</div>';
        }

        // 1) Scatter: Solar power vs Charging rate
        const scatterPoints = sessions.map(s => ({
            x: s.avg_solar_w,
            y: s.rate_pct_h
        }));

        if (_chargingScatterChart) _chargingScatterChart.destroy();
        _chargingScatterChart = new Chart($('chart_charging_scatter'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: LANG === 'de' ? 'Solar W vs. Laderate %/h' : 'Solar W vs. Charge rate %/h',
                    data: scatterPoints,
                    backgroundColor: 'rgba(245,158,11,0.5)',
                    borderColor: '#f59e0b',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: LANG === 'de' ? 'Solarleistung vs. Laderate' : 'Solar power vs. Charge rate',
                        color: '#ccc', font: { size: 13 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                return ctx.raw.x + 'W \u2192 ' + ctx.raw.y + '%/h';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Solar (W)', color: '#aaa' },
                        ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    y: {
                        title: { display: true, text: '%/h', color: '#aaa' },
                        ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.06)' }
                    }
                }
            }
        });

        // 2) Bar chart: Charging rate by solar power bracket
        const bp = stats.by_solar_power || {};
        const bracketLabels = ['< 50W', '50-100W', '> 100W'];
        const bracketRates = [
            (bp.low_0_50W || {}).avg_rate || 0,
            (bp.mid_50_100W || {}).avg_rate || 0,
            (bp.high_100W_plus || {}).avg_rate || 0
        ];
        const bracketCounts = [
            (bp.low_0_50W || {}).count || 0,
            (bp.mid_50_100W || {}).count || 0,
            (bp.high_100W_plus || {}).count || 0
        ];

        if (_chargingRateBarsChart) _chargingRateBarsChart.destroy();
        _chargingRateBarsChart = new Chart($('chart_charging_rate_bars'), {
            type: 'bar',
            data: {
                labels: bracketLabels,
                datasets: [{
                    label: LANG === 'de' ? 'Laderate %/h' : 'Charge rate %/h',
                    data: bracketRates,
                    backgroundColor: ['rgba(239,68,68,0.6)', 'rgba(245,158,11,0.6)', 'rgba(34,197,94,0.6)'],
                    borderColor: ['#ef4444', '#f59e0b', '#22c55e'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: LANG === 'de' ? 'Laderate nach Solarleistung' : 'Charge rate by solar power',
                        color: '#ccc', font: { size: 13 }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(ctx) {
                                return bracketCounts[ctx.dataIndex] + ' Sessions';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: '%/h', color: '#aaa' },
                        ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    y: {
                        ticks: { color: '#aaa' }, grid: { display: false }
                    }
                }
            }
        });

        // 3) Timeline: recent charging sessions (duration + SOC gained)
        const recent = sessions.slice(-30);
        const durLabels = recent.map(s => s.date.slice(5) + ' ' + s.start);
        const durValues = recent.map(s => s.duration_min);
        const socValues = recent.map(s => s.soc_gained);

        if (_chargingDurationChart) _chargingDurationChart.destroy();
        _chargingDurationChart = new Chart($('chart_charging_duration'), {
            type: 'bar',
            data: {
                labels: durLabels,
                datasets: [
                    {
                        label: LANG === 'de' ? 'Dauer (min)' : 'Duration (min)',
                        data: durValues,
                        backgroundColor: 'rgba(245,158,11,0.5)',
                        borderColor: '#f59e0b',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: LANG === 'de' ? 'Batterie (%)' : 'Battery (%)',
                        data: socValues,
                        type: 'line',
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#aaa', boxWidth: 12 } },
                    tooltip: {
                        callbacks: {
                            afterBody: function(items) {
                                const i = items[0].dataIndex;
                                const s = recent[i];
                                return s.start_soc + '% \u2192 ' + s.end_soc + '% | ' + s.avg_solar_w + 'W';
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: '#aaa', maxRotation: 45, maxTicksLimit: 15 }, grid: { display: false } },
                    y: {
                        position: 'left',
                        title: { display: true, text: 'min', color: '#aaa' },
                        ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    y1: {
                        position: 'right',
                        title: { display: true, text: '%', color: '#aaa' },
                        ticks: { color: '#aaa' },
                        grid: { display: false }
                    }
                }
            }
        });

        $('chargingAnalysisSection').style.display = '';
    } catch (e) { console.warn('Charging analysis error:', e); }
}

loadChargingAnalysis();

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

// === Combined MQTT Overview Chart with selectable metrics ===
let combinedPeriod = 'day';

// All available metrics for the MQTT overview chart.
// The toggle buttons reference these by key (data-metric attribute).
const MQTT_METRICS = {
    solar_watts:        { label: '☀️ Solar',  color: '#f59e0b', yAxis: 'yW',    dash: [],     logNull: true },
    total_output_watts: { label: '⚡ Out',    color: '#a78bfa', yAxis: 'yW',    dash: [],     logNull: true },
    ac_input_watts:     { label: '🔌 AC In',  color: '#38bdf8', yAxis: 'yW',    dash: [],     logNull: true },
    battery_soc:        { label: '🔋 Bat%',   color: '#22c55e', yAxis: 'yPct',  dash: [],     logNull: false },
    temperature:        { label: '🌡️ Temp',   color: '#3b82f6', yAxis: 'yTemp', dash: [4, 2], logNull: false },
    ac_output_watts:    { label: '🏠 AC',     color: '#c084fc', yAxis: 'yW',    dash: [],     logNull: true },
    dc_output_watts:    { label: '🔋 DC',     color: '#fb923c', yAxis: 'yW',    dash: [],     logNull: true },
    usbc_1_watts:       { label: 'USB-C 1',   color: '#f472b6', yAxis: 'yW',    dash: [],     logNull: true },
    usbc_2_watts:       { label: 'USB-C 2',   color: '#34d399', yAxis: 'yW',    dash: [],     logNull: true },
    usbc_3_watts:       { label: 'USB-C 3',   color: '#fbbf24', yAxis: 'yW',    dash: [],     logNull: true },
    usba_1_watts:       { label: '🔌 A',      color: '#60a5fa', yAxis: 'yW',    dash: [],     logNull: true },
    dc_12v_watts:       { label: '🚗 12V',    color: '#facc15', yAxis: 'yW',    dash: [],     logNull: true },
};

function _getActiveMetrics() {
    const active = [];
    document.querySelectorAll('#mqttMetricToggles .mqtt-toggle.active').forEach(btn => {
        const key = btn.dataset.metric;
        if (MQTT_METRICS[key]) active.push(key);
    });
    return active.length > 0 ? active : ['solar_watts']; // fallback: at least solar
}

async function loadCombinedChart(hours) {
    if (!hours) hours = periodHours[combinedPeriod] || 24;
    try {
        const res = await fetch('/api/readings?hours=' + hours);
        const rows = await res.json();

        // Show data count info
        const infoEl = $('combinedInfo');
        if (infoEl) {
            if (rows.length > 0) {
                const first = new Date(rows[0].timestamp);
                const last = new Date(rows[rows.length - 1].timestamp);
                const fmtD = d => d.getDate() + '.' + (d.getMonth() + 1) + '. ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
                infoEl.textContent = rows.length + ' Datenpunkte · ' + fmtD(first) + ' - ' + fmtD(last);
            } else {
                infoEl.textContent = 'Keine Daten';
            }
        }

        if (!rows.length) {
            if (combinedChart) { combinedChart.destroy(); combinedChart = null; }
            return;
        }

        const step = Math.max(1, Math.floor(rows.length / 800));
        const data = rows.filter((_, i) => i % step === 0);
        const labels = data.map(r => formatLabel(r.timestamp, combinedPeriod));

        const activeKeys = _getActiveMetrics();
        const datasets = activeKeys.map(key => {
            const m = MQTT_METRICS[key];
            return {
                label: m.label,
                data: data.map(r => { const v = r[key] || 0; return m.logNull && v <= 0 ? null : v; }),
                borderColor: m.color, backgroundColor: m.color + '1a', fill: false,
                tension: 0.45, borderWidth: 2, cubicInterpolationMode: 'monotone', borderCapStyle: 'round',
                pointRadius: 0, pointHitRadius: 8, yAxisID: m.yAxis, borderDash: m.dash || [], spanGaps: true,
            };
        });

        // Determine which Y axes are needed based on active metrics
        const needsYW = activeKeys.some(k => MQTT_METRICS[k].yAxis === 'yW');
        const needsYPct = activeKeys.some(k => MQTT_METRICS[k].yAxis === 'yPct');
        const needsYTemp = activeKeys.some(k => MQTT_METRICS[k].yAxis === 'yTemp');

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
                    yW: { display: needsYW, type: 'logarithmic', position: 'left', min: 0.5, grid: { color: chartGridColor() },
                        ticks: { maxTicksLimit: 6, font: { size: 9 }, callback: v => v < 1 ? '' : (v >= 1000 ? (v/1000)+'kW' : v+'W') },
                        afterBuildTicks: axis => { axis.ticks = axis.ticks.filter(t => t.value >= 1); } },
                    yPct: { display: needsYPct, type: 'linear', position: 'right', min: 0, max: 100, grid: { display: false },
                        ticks: { maxTicksLimit: 5, font: { size: 9 }, callback: v => v + '%' } },
                    yTemp: { display: needsYTemp, type: 'linear', position: 'right', beginAtZero: true, grid: { display: false },
                        ticks: { maxTicksLimit: 5, font: { size: 9 }, callback: v => v + '°' } },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0, font: { size: 9 } } }
                },
                elements: { line: { tension: 0.45, cubicInterpolationMode: 'monotone', borderCapStyle: 'round', borderJoinStyle: 'round' } }
            }
        });
    } catch (e) { console.warn('Combined chart error:', e); }
}

// Toggle buttons: click to activate/deactivate a metric, then re-render chart
document.querySelectorAll('#mqttMetricToggles .mqtt-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        loadCombinedChart(periodHours[combinedPeriod]);
    });
});

loadCombinedChart();

// Daily Stats section removed by user request.
// Global function kept as a no-op so existing onclick handlers (in case
// any older cached markup still references them) don't throw.
function loadDailyStats() { /* removed */ }

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


// === Amortisation + Break-Even (merged section with cumulative savings chart) ===
let _amortChart = null;

function updateAmortisation(energyData) {
    try {
        const total = energyData.total || {};
        const totalSavedEur = (total.solar_kwh || 0) * EUR_PER_KWH;
        const remaining = Math.max(0, SYSTEM_COST_EUR - totalSavedEur);
        const pct = Math.min(100, totalSavedEur / SYSTEM_COST_EUR * 100);

        const costEl = $('amortCost');
        if (costEl) costEl.textContent = Math.round(SYSTEM_COST_EUR).toLocaleString(locale) + ' €';
        const savedEl = $('amortSaved');
        if (savedEl) savedEl.textContent = Math.round(totalSavedEur).toLocaleString(locale) + ' €';
        const remEl = $('amortRemaining');
        if (remEl) remEl.textContent = Math.round(remaining).toLocaleString(locale) + ' €';
        const pctEl = $('amortProgressLabel');
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
        const ringFill = $('amortRingFill');
        if (ringFill) {
            const circ = 326.73;
            ringFill.setAttribute('stroke-dashoffset', (circ - circ * pct / 100).toFixed(1));
        }

        // Total kWh produced card
        const totalKwhEl = $('totalKwhValue');
        if (totalKwhEl) totalKwhEl.textContent = fmtKwh.format(total.solar_kwh || 0);
    } catch (e) { console.warn('Amort error:', e); }
}

// Dedicated loader for the merged section: cumulative-savings chart +
// break-even projection + formatted date. Uses /api/break-even (already
// exposed) for the backend-calculated projection.
async function loadAmortChart() {
    try {
        const [beRes, cumRes] = await Promise.all([
            fetch('/api/break-even'),
            fetch('/api/cumulative-production'),
        ]);
        if (!beRes.ok || !cumRes.ok) return;
        const be = await beRes.json();
        const cum = await cumRes.json();

        // Update top-level date card + payoff sub-line
        const dateEl = $('amortBreakEvenDate');
        const payoffEl = $('amortPayoff');
        const avgDaily = be.avg_daily_kwh_last30 || 0;

        if (be.total_savings_eur >= be.system_cost_eur) {
            if (dateEl) dateEl.textContent = '🎉';
            if (payoffEl) { payoffEl.textContent = t('breakEvenPaidOff'); payoffEl.style.color = 'var(--green)'; }
        } else if (avgDaily > 0.01 && be.break_even_date) {
            // Sanity cap: if the extrapolated date is more than 100 years out,
            // the avg is too low to be useful — show a friendly fallback.
            const beDate = new Date(be.break_even_date);
            const yearsOut = (beDate - new Date()) / (365.25 * 24 * 3600 * 1000);
            if (yearsOut > 100) {
                if (dateEl) dateEl.textContent = '—';
                if (payoffEl) payoffEl.textContent = t('cumulativeNoData');
            } else {
                const months = t('monthNames');
                const short = months[beDate.getMonth()] + ' ' + beDate.getFullYear();
                if (dateEl) dateEl.textContent = short;
                if (payoffEl) payoffEl.textContent =
                    t('breakEvenAvgDay').replace('{kwh}', fmtKwh.format(avgDaily));
            }
        } else {
            if (dateEl) dateEl.textContent = '—';
            if (payoffEl) payoffEl.textContent = t('cumulativeNoData');
        }

        // Build the cumulative savings line chart
        const canvas = $('chart_amort_progress');
        if (!canvas) return;
        const series = cum.series || [];
        if (series.length === 0) {
            if (_amortChart) { _amortChart.destroy(); _amortChart = null; }
            canvas.style.display = 'none';
            return;
        }
        canvas.style.display = '';

        const labels = series.map(r => r.date);
        const savings = series.map(r => r.cumulative * EUR_PER_KWH);
        // Horizontal guide line at SYSTEM_COST_EUR
        const goal = labels.map(() => SYSTEM_COST_EUR);

        if (_amortChart) _amortChart.destroy();
        _amortChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: t('savedSoFar'),
                        data: savings,
                        borderColor: 'rgba(34,197,94,1)',
                        backgroundColor: 'rgba(34,197,94,0.18)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 0,
                        borderWidth: 2,
                    },
                    {
                        label: t('systemCost'),
                        data: goal,
                        borderColor: 'rgba(245,158,11,0.7)',
                        borderWidth: 1.5,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(136,136,136,0.8)',
                            callback: v => fmtEur.format(v) + ' €',
                            maxTicksLimit: 4,
                        },
                        grid: { color: 'rgba(128,128,128,0.12)' },
                    },
                },
            },
        });
    } catch (e) { console.warn('Amort chart error:', e); }
}

// Initial + periodic refresh
loadAmortChart();
setInterval(loadAmortChart, 120000);  // every 2 min

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
    const forecastKwh = window._forecastKwh ? window._forecastKwh[warsawToday()] || 0 : 0;
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
    const forecastKwh = window._forecastKwh ? window._forecastKwh[warsawToday()] || 0 : 0;
    const score = forecastKwh > 0 ? Math.min(100, Math.round(kwh / forecastKwh * 100)) : 0;
    const text = t('shareText').replace('{kwh}', fmtKwh.format(kwh)).replace('{score}', score);

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
        const data = await getDailyData();
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

        const _wn = warsawNow();
        const today = new Date(_wn.year, _wn.month, _wn.day);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364);
        // Align to start of week (Monday)
        while (startDate.getDay() !== 1) startDate.setDate(startDate.getDate() - 1);

        const cursor = new Date(startDate);
        while (cursor <= today) {
            const dateStr = cursor.getFullYear() + '-' + String(cursor.getMonth() + 1).padStart(2, '0') + '-' + String(cursor.getDate()).padStart(2, '0');
            const kwh = dailyMap[dateStr] || 0;
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            if (kwh > 0 && maxKwh > 0) {
                const ratio = kwh / maxKwh;
                const level = ratio >= 0.75 ? 'h-5' : ratio >= 0.5 ? 'h-4' : ratio >= 0.25 ? 'h-3' : ratio >= 0.1 ? 'h-2' : 'h-1';
                cell.classList.add(level);
            }
            const cellDate = cursor.getDate() + '.' + (cursor.getMonth() + 1) + '.';
            const tipText = cellDate + ' - ' + fmtKwh.format(kwh) + ' kWh';
            cell.setAttribute('data-date', cellDate);
            cell.setAttribute('data-kwh', fmtKwh.format(kwh));
            cell.setAttribute('data-tip', tipText);
            cell.title = tipText;
            grid.appendChild(cell);
            cursor.setDate(cursor.getDate() + 1);
        }

        wrap.innerHTML = '';
        wrap.appendChild(grid);
    } catch (e) { console.warn('Heatmap error:', e); }
}

loadHeatmap();

// === Forecast Accuracy (totals comparison) ===
// === Battery Cycle Tracker ===
// Reads pre-computed cycle stats from the server (RAM-tracked every 3s,
// persisted in data/battery_cycles.json). Replaces the old client-side
// computation that fetched a full year of /api/readings on each page load.
// Base C1000 Gen 2. Auto-expanded at runtime when BP1000 expansion packs
// are detected via MQTT (total_capacity_wh field from server).
let BATTERY_CAPACITY_KWH = 1.024;

async function loadBatteryCycles() {
    try {
        const res = await fetch('/api/battery-cycles');
        if (!res.ok) return;
        const s = await res.json();

        const totalCycles = s.total_cycles || 0;
        const remaining = Math.max(0, 3000 - totalCycles);
        const pct = Math.min(100, totalCycles / 3000 * 100);

        $('cycleTotalCount').textContent = fmt2.format(totalCycles);
        $('cycleRemaining').textContent = fmt.format(remaining);
        $('cycleProgressFill').style.width = pct + '%';
        $('cycleProgressLabel').textContent = fmt2.format(pct) + '%';

        // Lifespan estimate: based on average daily battery throughput (kWh)
        // avg_daily_kwh = total_cycles × capacity / days_tracked
        //   (one-way throughput — matches how the industry measures cycles)
        // years = remaining_cycles × capacity / avg_daily_kwh / 365
        const hint = $('cycleHint');
        if (!hint) return;
        const avgDailyKwh = s.avg_daily_kwh
            || (s.days_tracked > 0 ? totalCycles * BATTERY_CAPACITY_KWH / s.days_tracked : 0);
        if (avgDailyKwh > 0.0001) {
            const yearsLeft = remaining * BATTERY_CAPACITY_KWH / avgDailyKwh / 365;
            hint.textContent = t('cycleEstimate')
                .replace('{kwh}', fmtKwh.format(avgDailyKwh))
                .replace('{years}', fmt.format(yearsLeft));
        } else {
            hint.textContent = t('cycleEstimateNoData');
        }
    } catch (e) { console.warn('Battery cycles error:', e); }
}

loadBatteryCycles();

// === Energy-Flow: Direct-use / Autarky / RTE ===
// All three come from the live latest_data (WebSocket broadcast) so the
// section refreshes every 3s without an extra fetch.
function updateEnergyFlowFromLatest(d) {
    if (!d) return;
    const $u = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    const $w = (id, pct) => {
        const el = $(id);
        if (!el) return;
        const clipped = Math.max(0, Math.min(100, pct || 0));
        el.style.width = clipped + '%';
    };
    $u('efDirectUse', fmtKwh.format(d.daily_direct_use_kwh || 0));
    $u('efBatteryIn', fmtKwh.format(d.daily_battery_in_kwh || 0));
    $u('efBatteryOut', fmtKwh.format(d.daily_battery_out_kwh || 0));

    const dup = d.direct_use_pct || 0;
    const aut = d.autarkie_pct || 0;
    const rte = d.rte_pct || 0;
    $u('efDirectVal', fmt.format(dup) + '%');
    $u('efAutVal', fmt.format(aut) + '%');
    $u('efRteVal', rte > 0 ? fmt.format(rte) + '%' : '--');
    $w('efDirectFill', dup);
    $w('efAutFill', aut);
    $w('efRteFill', rte);

    const hint = $('efRteHint');
    if (hint) {
        hint.style.display = (rte > 0) ? 'none' : 'block';
    }
}

// === Break-Even Live ===
async function loadBreakEven() {
    try {
        const res = await fetch('/api/break-even');
        if (!res.ok) return;
        const d = await res.json();
        $('beSaved').textContent = fmtEur.format(d.total_savings_eur || 0);
        $('bePct').textContent = fmt2.format(d.percent_amortised || 0);
        const remaining = Math.max(0, (d.system_cost_eur || 0) - (d.total_savings_eur || 0));
        $('beRemaining').textContent = fmtEur.format(remaining);

        const pct = Math.min(100, d.percent_amortised || 0);
        $('beProgressFill').style.width = pct + '%';
        $('beProgressLabel').textContent = fmt2.format(pct) + '%';

        const hint = $('beHint');
        if (hint) {
            if (d.total_savings_eur >= d.system_cost_eur) {
                hint.textContent = t('breakEvenPaidOff');
            } else if (d.break_even_date && d.avg_daily_kwh_last30 > 0) {
                const line1 = t('breakEvenAvgDay').replace('{kwh}', fmtKwh.format(d.avg_daily_kwh_last30));
                const line2 = t('breakEvenProjection') + ': ' + d.break_even_date;
                hint.innerHTML = line1 + ' · ' + line2;
            } else {
                hint.textContent = '\u2014';
            }
        }
    } catch (e) { console.warn('Break-even error:', e); }
}
loadBreakEven();

// === Consumption Anomaly ===
async function loadAnomaly() {
    try {
        const res = await fetch('/api/anomaly');
        if (!res.ok) return;
        const d = await res.json();
        const statusEl = $('anomalyStatus');
        const dot = $('anomalyDot');
        const detail = $('anomalyDetail');
        if (!statusEl || !dot) return;
        // Reset dot classes
        dot.classList.remove('anomaly-normal', 'anomaly-high', 'anomaly-low');
        if (d.status === 'insufficient_data') {
            statusEl.textContent = t('anomalyNoData');
            if (detail) detail.textContent = '';
            return;
        }
        dot.classList.add('anomaly-' + d.status);
        if (d.status === 'high') statusEl.textContent = t('anomalyHigh');
        else if (d.status === 'low') statusEl.textContent = t('anomalyLow');
        else statusEl.textContent = t('anomalyNormal');
        if (detail) {
            detail.textContent = t('anomalyDetail')
                .replace('{current}', fmt.format(d.current_avg_w || 0))
                .replace('{mean}', fmt.format(d.baseline_mean_w || 0))
                .replace('{sigma}', fmt.format(d.baseline_sigma_w || 0))
                .replace('{z}', fmt2.format(d.z_score || 0));
        }
    } catch (e) { console.warn('Anomaly error:', e); }
}
loadAnomaly();

// === Forecast comparison: Open-Meteo vs local ML ===

// ============================================================================
// Phase 1 charts: Power-Flow animation · Sankey · Hourly Heatmap · Cumulative
// Curve · Monthly Box-Plots
// ============================================================================

// === 1b: Power Flow updates (vertical layout, interactive top → bottom) ===
// Single source of truth — replaces the earlier stub. Updates every W value,
// toggles .active on each card/arrow, and glow-animates the battery based
// on whether it's charging or discharging (derived from the conservation
// equation battery_net = solar + grid − load).
function updatePowerFlow(d) {
    if (!d) return;
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

    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set('flowSolarVal', fmt.format(solar) + ' W');
    set('flowAcInVal', fmt.format(acIn) + ' W');
    set('flowAcOutVal', fmt.format(acOut) + ' W');
    set('flowUsbc1Val', fmt.format(usbc1) + ' W');
    set('flowUsbc2Val', fmt.format(usbc2) + ' W');
    set('flowUsbc3Val', fmt.format(usbc3) + ' W');
    set('flowUsba1Val', fmt.format(usba1) + ' W');
    set('flowDc12vVal', fmt.format(dc12v) + ' W');
    // Only show SOC overlay once we have real data — keeps the
    // .pf-bat-pct:empty hide rule happy on first load.
    const socEl = $('flowBatSoc');
    if (socEl) socEl.textContent = d.battery_soc > 0 ? d.battery_soc + '%' : '';

    // "Verbraucher" aggregate header total
    const totalEl = $('flowTotalOutVal');
    if (totalEl) totalEl.textContent = fmt.format(d.total_output_watts || totalOut) + ' W';

    // Battery fill height (0-100%) - main C1000
    const batFill = $('flowBatFill');
    const mainSoc = (d.main_battery_soc > 0 ? d.main_battery_soc : d.battery_soc) || 0;
    if (batFill) batFill.style.height = mainSoc + '%';
    const socMainEl = $('flowBatSoc');
    if (socMainEl) socMainEl.textContent = mainSoc > 0 ? mainSoc + '%' : '';

    // BP1000 expansion battery (show only when connected)
    const expPacks = d.expansion_packs || 0;
    const expWrap = $('flowBatExp');
    if (expWrap) {
        if (expPacks > 0) {
            expWrap.style.display = '';
            const expSoc = d.exp_1_soc || 0;
            const expType = d.exp_1_type || 'BP1000';
            const expFill = $('flowBatExpFill');
            if (expFill) expFill.style.height = expSoc + '%';
            const expSocEl = $('flowBatExpSoc');
            if (expSocEl) expSocEl.textContent = expSoc > 0 ? expSoc + '%' : '';
            const expLabel = $('flowBatExpLabel');
            if (expLabel) expLabel.textContent = expType;
        } else {
            expWrap.style.display = 'none';
        }
    }

    // Light up each source + port card based on its power flow
    const activate = (id, on) => {
        const el = $(id);
        if (el) el.classList.toggle('active', on);
    };
    activate('flowSolar', solar > 1);
    activate('flowAcIn', acIn > 1);
    activate('flowAcOut', acOut > 0.5);
    activate('flowUsbc1', usbc1 > 0.5);
    activate('flowUsbc2', usbc2 > 0.5);
    activate('flowUsbc3', usbc3 > 0.5);
    activate('flowUsba1', usba1 > 0.5);
    activate('flowDc12v', dc12v > 0.5);

    // Animated flow lines: solar/grid → battery (top) + battery → load (bottom) + load → ports
    const arrIn = $('flowArrowIn');
    const arrOut = $('flowArrowOut');
    const arrPorts = $('flowArrowPorts');
    if (arrIn) arrIn.classList.toggle('pf-line-active', totalIn > 1);
    if (arrOut) arrOut.classList.toggle('pf-line-active', totalOut > 1);
    if (arrPorts) arrPorts.classList.toggle('pf-line-active', totalOut > 1);

    // Battery charging/discharging glow — conservation equation
    // battery_net > 0 → charging, < 0 → discharging
    const batNet = solar + acIn - totalOut;
    const batVis = document.querySelector('.pf-bat-visual');
    if (batVis) {
        batVis.classList.toggle('pf-bat-charging', batNet > 1);
        batVis.classList.toggle('pf-bat-discharging', batNet < -1);
    }
}

// Sankey removed — replaced by Energie-Bilanz (Animated Flow, Variant 5).

// === 1e: Cumulative Production Curve ===
let _cumChart = null;

async function loadCumulative() {
    try {
        const res = await fetch('/api/cumulative-production');
        if (!res.ok) return;
        const d = await res.json();
        const series = d.series || [];
        const total = $('cumTotalValue');
        if (total) total.textContent = fmtKwh.format(d.total_kwh || 0);

        if (series.length === 0) {
            const ms = $('cumMilestones');
            if (ms) ms.innerHTML = '<span class="cum-milestone">' + t('cumulativeNoData') + '</span>';
            return;
        }

        const labels = series.map(r => r.date);
        const data = series.map(r => r.cumulative);
        const ctx = document.getElementById('chart_cumulative');
        if (!ctx) return;
        if (_cumChart) _cumChart.destroy();
        _cumChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: t('cumulativeTotal') + ' (kWh)',
                    data,
                    borderColor: 'rgba(245,158,11,1)',
                    backgroundColor: 'rgba(245,158,11,0.2)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { ticks: { color: 'var(--text-dim)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                },
            },
        });

        // Milestones
        const ms = $('cumMilestones');
        if (ms) {
            const items = (d.milestones || []).slice(-6);
            if (items.length === 0) {
                ms.innerHTML = '';
            } else {
                ms.innerHTML = items.map(m =>
                    `<div class="cum-milestone"><strong>${fmtKwh.format(m.threshold_kwh)} kWh</strong>${m.date}</div>`
                ).join('');
            }
        }
    } catch (e) { console.warn('Cumulative error:', e); }
}

loadCumulative();

// === 1d: Hourly Heatmap (24 × N days) ===
async function loadHourlyHeatmap() {
    try {
        const res = await fetch('/api/hourly-heatmap?days=30');
        if (!res.ok) return;
        const d = await res.json();
        const svg = $('hourlyHeatmapSvg');
        if (!svg) return;
        const days = d.days || [];
        const data = d.data || [];
        if (days.length === 0 || data.length === 0) {
            svg.innerHTML = '<text x="280" y="160" text-anchor="middle" fill="var(--text-dim)" font-size="12">Keine Daten</text>';
            return;
        }

        // Layout
        const W = 560, H = 320;
        const PAD_LEFT = 30, PAD_RIGHT = 10, PAD_TOP = 12, PAD_BOT = 20;
        const gridW = W - PAD_LEFT - PAD_RIGHT;
        const gridH = H - PAD_TOP - PAD_BOT;
        const cellW = gridW / days.length;
        const cellH = gridH / 24;
        const maxW = Math.max(...data.map(r => r[2]), 1);

        const parts = [];
        // Draw cells
        for (const [dayIdx, hour, w] of data) {
            const x = PAD_LEFT + dayIdx * cellW;
            const y = PAD_TOP + hour * cellH;
            const intensity = Math.min(1, w / maxW);
            const fillOpacity = 0.05 + intensity * 0.95;
            parts.push(`<rect class="hh-cell" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellW.toFixed(1)}" height="${cellH.toFixed(1)}" fill="var(--solar)" fill-opacity="${fillOpacity.toFixed(2)}"><title>${days[dayIdx]} ${hour}:00 — ${fmt.format(w)} W</title></rect>`);
        }
        // Hour labels on Y axis (every 4 hours)
        for (let h = 0; h < 24; h += 4) {
            const y = PAD_TOP + h * cellH + cellH / 2 + 3;
            parts.push(`<text class="hh-axis-label" x="${PAD_LEFT - 4}" y="${y.toFixed(1)}" text-anchor="end">${h}</text>`);
        }
        // Day labels on X axis (every ~week)
        const dayStep = Math.max(1, Math.floor(days.length / 6));
        for (let i = 0; i < days.length; i += dayStep) {
            const x = PAD_LEFT + i * cellW + cellW / 2;
            const short = days[i].slice(5); // MM-DD
            parts.push(`<text class="hh-axis-label" x="${x.toFixed(1)}" y="${H - 6}" text-anchor="middle">${short}</text>`);
        }
        svg.innerHTML = parts.join('');

        const maxEl = $('hhLegendMax');
        if (maxEl) maxEl.textContent = fmt.format(maxW) + ' W';
    } catch (e) { console.warn('Hourly heatmap error:', e); }
}

loadHourlyHeatmap();

// === 1f: Monthly distribution box-plots ===
async function loadDistribution() {
    try {
        const res = await fetch('/api/monthly-distribution?months=12');
        if (!res.ok) return;
        const months = await res.json();
        const svg = $('distributionSvg');
        if (!svg) return;
        if (!months || months.length === 0) {
            svg.innerHTML = '<text x="280" y="130" text-anchor="middle" fill="var(--text-dim)" font-size="12">' + t('distributionNoData') + '</text>';
            return;
        }

        const W = 560, H = 260;
        const PAD_LEFT = 36, PAD_RIGHT = 12, PAD_TOP = 16, PAD_BOT = 30;
        const plotW = W - PAD_LEFT - PAD_RIGHT;
        const plotH = H - PAD_TOP - PAD_BOT;

        const maxKwh = Math.max(0.01, ...months.map(m => m.max));
        const y = (kwh) => PAD_TOP + plotH - (kwh / maxKwh) * plotH;
        const boxW = Math.max(14, Math.min(40, plotW / months.length * 0.55));

        const parts = [];
        // Gridlines at 5 evenly spaced y values
        for (let i = 0; i <= 4; i++) {
            const kwh = maxKwh * i / 4;
            const yy = y(kwh);
            parts.push(`<line class="dist-grid-line" x1="${PAD_LEFT}" y1="${yy.toFixed(1)}" x2="${W - PAD_RIGHT}" y2="${yy.toFixed(1)}"/>`);
            parts.push(`<text class="dist-axis-label" x="${PAD_LEFT - 4}" y="${(yy + 3).toFixed(1)}" text-anchor="end">${fmtKwh.format(kwh)}</text>`);
        }

        // Box for each month
        months.forEach((m, i) => {
            const cx = PAD_LEFT + (i + 0.5) * (plotW / months.length);
            const x1 = cx - boxW / 2;
            const x2 = cx + boxW / 2;
            // Whiskers
            parts.push(`<line class="dist-whisker" x1="${cx}" y1="${y(m.min).toFixed(1)}" x2="${cx}" y2="${y(m.max).toFixed(1)}"/>`);
            parts.push(`<line class="dist-whisker" x1="${x1 + boxW * 0.3}" y1="${y(m.min).toFixed(1)}" x2="${x2 - boxW * 0.3}" y2="${y(m.min).toFixed(1)}"/>`);
            parts.push(`<line class="dist-whisker" x1="${x1 + boxW * 0.3}" y1="${y(m.max).toFixed(1)}" x2="${x2 - boxW * 0.3}" y2="${y(m.max).toFixed(1)}"/>`);
            // Box
            parts.push(`<rect class="dist-box" x="${x1.toFixed(1)}" y="${y(m.q3).toFixed(1)}" width="${boxW.toFixed(1)}" height="${(y(m.q1) - y(m.q3)).toFixed(1)}"><title>${m.month} · n=${m.n} · median ${fmtKwh.format(m.median)} kWh · Q1 ${fmtKwh.format(m.q1)} – Q3 ${fmtKwh.format(m.q3)} · min ${fmtKwh.format(m.min)} · max ${fmtKwh.format(m.max)}</title></rect>`);
            // Median line
            parts.push(`<line class="dist-median" x1="${x1.toFixed(1)}" y1="${y(m.median).toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y(m.median).toFixed(1)}"/>`);
            // X axis month label
            parts.push(`<text class="dist-axis-label" x="${cx.toFixed(1)}" y="${H - 10}" text-anchor="middle">${m.month.slice(5)}</text>`);
        });
        svg.innerHTML = parts.join('');
    } catch (e) { console.warn('Distribution error:', e); }
}

loadDistribution();

// === Usage Patterns — 24 h average load bar chart ===
// Aggregates /api/readings (last 7 days) by hour-of-day and renders an SVG
// bar chart of the mean output watts. Bars are color-intensity scaled.
async function loadUsagePatterns() {
    try {
        const res = await fetch('/api/readings?hours=168'); // 7 days
        const rows = await res.json();
        const svg = $('usagePatternsSvg');
        const legend = $('usagePatternsContent');
        if (!svg) return;

        if (rows.length < 100) {
            svg.innerHTML = '<text x="280" y="100" text-anchor="middle" fill="var(--text-dim)" font-size="12">' + t('noPatterns') + '</text>';
            if (legend) legend.innerHTML = '';
            return;
        }

        // Aggregate: for each hour 0-23, accumulate output W samples.
        const hourSum = new Array(24).fill(0);
        const hourCount = new Array(24).fill(0);
        for (const r of rows) {
            const d = new Date(r.timestamp);
            const h = d.getHours();
            if (isNaN(h)) continue;
            const out = r.total_output_watts || 0;
            hourSum[h] += out;
            hourCount[h] += 1;
        }
        const avgPerHour = hourSum.map((s, i) => hourCount[i] > 0 ? s / hourCount[i] : 0);
        const maxAvg = Math.max(1, ...avgPerHour);

        // Compute aggregate stats for the legend
        let totalAvg = 0, peakHour = 0, idleHours = 0, activeHours = 0;
        for (let h = 0; h < 24; h++) {
            totalAvg += avgPerHour[h];
            if (avgPerHour[h] > avgPerHour[peakHour]) peakHour = h;
            if (avgPerHour[h] < 5) idleHours++;
            else activeHours++;
        }
        const overallAvg = totalAvg / 24;

        // SVG layout
        const W = 560, H = 200;
        const PAD_LEFT = 36, PAD_RIGHT = 10, PAD_TOP = 12, PAD_BOT = 26;
        const plotW = W - PAD_LEFT - PAD_RIGHT;
        const plotH = H - PAD_TOP - PAD_BOT;
        const barW = plotW / 24;
        const barGap = 2;

        const y = (w) => PAD_TOP + plotH - (w / maxAvg) * plotH;

        const parts = [];
        // Horizontal gridlines at 4 levels
        for (let i = 0; i <= 4; i++) {
            const w = maxAvg * i / 4;
            const yy = y(w);
            parts.push(`<line class="dist-grid-line" x1="${PAD_LEFT}" y1="${yy.toFixed(1)}" x2="${W - PAD_RIGHT}" y2="${yy.toFixed(1)}"/>`);
            parts.push(`<text class="dist-axis-label" x="${PAD_LEFT - 4}" y="${(yy + 3).toFixed(1)}" text-anchor="end">${Math.round(w)}</text>`);
        }
        // Bars
        for (let h = 0; h < 24; h++) {
            const w = avgPerHour[h];
            const x = PAD_LEFT + h * barW + barGap / 2;
            const barH = plotH - (y(w) - PAD_TOP);
            const yy = y(w);
            const intensity = Math.min(1, w / maxAvg);
            // Color gradient: dim → solar → red for high usage
            const color = intensity > 0.7 ? 'var(--red)' : intensity > 0.35 ? 'var(--solar)' : '#22c55e';
            const opacity = 0.25 + intensity * 0.75;
            parts.push(`<rect class="up-bar" x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${(barW - barGap).toFixed(1)}" height="${Math.max(1, barH).toFixed(1)}" fill="${color}" fill-opacity="${opacity.toFixed(2)}"><title>${h}:00 — Ø ${fmt.format(w)} W</title></rect>`);
            // Hour label every 6 hours
            if (h % 6 === 0) {
                parts.push(`<text class="dist-axis-label" x="${(x + (barW - barGap) / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${h}</text>`);
            }
        }
        svg.innerHTML = parts.join('');

        // Legend: 3 compact stat chips
        if (legend) {
            const peakLabel = peakHour + ':00';
            legend.innerHTML =
                `<div class="up-stat"><span class="up-stat-label">Ø Tag</span><span class="up-stat-value">${fmt.format(overallAvg)} W</span></div>`
                + `<div class="up-stat"><span class="up-stat-label">Peak</span><span class="up-stat-value">${peakLabel} (${fmt.format(avgPerHour[peakHour])} W)</span></div>`
                + `<div class="up-stat"><span class="up-stat-label">Aktiv</span><span class="up-stat-value">${activeHours} h / Tag</span></div>`;
        }
    } catch (e) { console.warn('Usage patterns error:', e); }
}

loadUsagePatterns();
setInterval(loadUsagePatterns, 600000);  // refresh every 10 min

// === Tap/hover tooltip for SVG charts + heatmap (mobile + desktop) ===
(function initTapTooltip() {
    let tip = null;
    function show(text, x, y) {
        if (!tip) {
            tip = document.createElement('div');
            tip.id = 'tapTip';
            document.body.appendChild(tip);
        }
        // Use explicit colors based on current theme
        const isDark = !document.body.classList.contains('light');
        tip.style.cssText = 'position:fixed;z-index:9999;border-radius:6px;padding:6px 12px;font-size:0.75rem;'
            + 'pointer-events:none;white-space:pre-line;max-width:300px;font-weight:500;line-height:1.4;'
            + (isDark
                ? 'background:#1e1e2e;color:#f0f0f0;border:1px solid #444;box-shadow:0 2px 12px rgba(0,0,0,0.5)'
                : 'background:#fff;color:#1a1a2e;border:1px solid #ccc;box-shadow:0 2px 12px rgba(0,0,0,0.15)');
        tip.textContent = text;
        tip.style.display = 'block';
        requestAnimationFrame(() => {
            const left = Math.max(4, Math.min(x - tip.offsetWidth / 2, window.innerWidth - tip.offsetWidth - 4));
            tip.style.left = left + 'px';
            tip.style.top = Math.max(4, y - tip.offsetHeight - 10) + 'px';
        });
    }
    function hide() { if (tip) tip.style.display = 'none'; }

    function findTipText(target) {
        let el = target;
        for (let i = 0; i < 6 && el; i++) {
            if (el.getAttribute && el.getAttribute('data-tip')) return el.getAttribute('data-tip');
            if (el.title && el.classList && el.classList.contains('heatmap-cell')) return el.title;
            if (el.tagName === 'rect' || el.tagName === 'circle' || el.tagName === 'path' || el.tagName === 'line') {
                const t = el.querySelector('title');
                if (t && t.textContent) return t.textContent;
            }
            el = el.parentElement || el.parentNode;
        }
        return '';
    }

    document.addEventListener('click', e => {
        const text = findTipText(e.target);
        if (text) show(text, e.clientX, e.clientY); else hide();
    });
    document.addEventListener('mouseover', e => {
        const text = findTipText(e.target);
        if (text) show(text, e.clientX, e.clientY);
    });
    document.addEventListener('mouseout', e => {
        const tag = e.target.tagName;
        if (tag === 'rect' || tag === 'circle' || tag === 'path' || tag === 'line'
            || (e.target.classList && e.target.classList.contains('heatmap-cell'))) hide();
    });
    document.addEventListener('scroll', hide, true);
})();

// === Week Comparison ===
async function updateWeekComparison(energyData) {
    try {
        const res = await fetch('/api/daily?days=14');
        const data = await res.json();
        if (data.length < 2) return;

        const _wn = warsawNow();
        const today = new Date(_wn.year, _wn.month, _wn.day);
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
        $('wcLastValue').textContent = fmtKwh.format(lastWeekKwh) + ' kWh';
        $('wcThisValue').textContent = fmtKwh.format(thisWeekKwh) + ' kWh';

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
    const now = warsawNow();
    if (now.getDay() !== 1) return; // Only Monday
    if (now.getHours() !== 8) return; // Only at 8:00

    const lastReport = localStorage.getItem('lastWeeklyReport');
    const todayStr = warsawToday();
    if (lastReport === todayStr) return; // Already sent today

    // Fetch last week's data
    fetch('/api/daily?days=7').then(r => r.json()).then(data => {
        let totalKwh = 0;
        for (const d of data) totalKwh += d.solar_kwh || 0;
        const savedEur = totalKwh * EUR_PER_KWH;

        new Notification(t('weeklyReport'), {
            body: t('weeklyReportBody')
                .replace('{kwh}', fmtKwh.format(totalKwh))
                .replace('{eur}', fmtEur.format(savedEur)),
            icon: '/static/icon-192.png'
        });
        localStorage.setItem('lastWeeklyReport', todayStr);
    }).catch(() => {});
}

// Check weekly report every 30 minutes
setInterval(checkWeeklyReport, 1800000);
checkWeeklyReport();

// === Keyboard shortcuts (accessibility) ===
// Press `h` → heatmap, `s` → stats, `c` → cycle tracker, `f` → forecast compare,
// `e` → energy flow, `b` → break-even, `?` → show list of shortcuts.
// ============================================================================
// Energy-Flow Visualization Variants (2-5) — for user comparison.
// All share the same /api/sankey?days=N data source.
// ============================================================================
let _flowVarDays = 1;
let _flowVariant = 'A';

function renderEbVariantA(el, d) {
    const autoColor = d.autarkie >= 70 ? '#22c55e' : d.autarkie >= 30 ? 'var(--solar)' : '#f97316';
    const row = (label, val, color, shareVal) => {
        const p = d.pct(shareVal);
        return '<div class="eb2-dist-row">'
            + '<div class="eb2-dist-label">' + label + '</div>'
            + '<div class="eb2-dist-bar"><div class="eb2-dist-fill" style="width:' + p.toFixed(1) + '%;background:' + color + '"></div></div>'
            + '<div class="eb2-dist-val">' + d.f(val) + '<span class="eb2-dist-unit"> kWh</span></div>'
            + '<div class="eb2-dist-pct">' + Math.round(p) + '%</div>'
            + '</div>';
    };
    el.innerHTML =
        '<div class="eb2">'
        + '<div class="eb2-hero">'
        +   '<div class="eb2-hero-row">'
        +     '<div class="eb2-hero-label">Verbraucht</div>'
        +     '<div class="eb2-hero-val">' + d.f(d.load) + '<span class="eb2-hero-unit"> kWh</span></div>'
        +   '</div>'
        +   '<div class="eb2-auto-row">'
        +     '<div class="eb2-auto-label">Solar-Autarkie</div>'
        +     '<div class="eb2-auto-pct" style="color:' + autoColor + '">' + d.autarkie + '%</div>'
        +   '</div>'
        +   '<div class="eb2-auto-bar"><div class="eb2-auto-fill" style="width:' + d.autarkie + '%;background:linear-gradient(90deg,' + autoColor + ',' + autoColor + ')"></div></div>'
        +   '<div class="eb2-auto-sub">' + d.f(d.solarToLoad) + ' kWh Solar von ' + d.f(d.load) + ' kWh</div>'
        + '</div>'
        + '<div class="eb2-section-label">Quellen</div>'
        + '<div class="eb2-2col">'
        +   '<div class="eb2-src eb2-src-solar' + (d.solar > 0.01 ? '' : ' eb2-inactive') + '">'
        +     '<div class="eb2-src-ico">' + d.iconSolar + '</div>'
        +     '<div class="eb2-src-body">'
        +       '<div class="eb2-src-name">Solar</div>'
        +       '<div class="eb2-src-val">' + d.f(d.solar) + '<span class="eb2-src-unit"> kWh</span></div>'
        +     '</div>'
        +   '</div>'
        +   '<div class="eb2-src eb2-src-grid' + (d.grid > 0.01 ? '' : ' eb2-inactive') + '">'
        +     '<div class="eb2-src-ico">' + d.iconGrid + '</div>'
        +     '<div class="eb2-src-body">'
        +       '<div class="eb2-src-name">Netz</div>'
        +       '<div class="eb2-src-val">' + d.f(d.grid) + '<span class="eb2-src-unit"> kWh</span></div>'
        +     '</div>'
        +   '</div>'
        + '</div>'
        + '<div class="eb2-section-label">Akku</div>'
        + '<div class="eb2-bat">'
        +   '<div class="eb2-bat-side">'
        +     '<div class="eb2-bat-kicker"><span class="eb2-bat-arrow eb2-bat-in">↓</span> Geladen</div>'
        +     '<div class="eb2-bat-val eb2-bat-val-in">' + d.f(d.batIn) + '<span class="eb2-bat-unit"> kWh</span></div>'
        +   '</div>'
        +   '<div class="eb2-bat-ico">' + d.iconBattery + '</div>'
        +   '<div class="eb2-bat-side eb2-bat-side-r">'
        +     '<div class="eb2-bat-kicker">Entladen <span class="eb2-bat-arrow eb2-bat-out">↑</span></div>'
        +     '<div class="eb2-bat-val eb2-bat-val-out">' + d.f(d.batOut) + '<span class="eb2-bat-unit"> kWh</span></div>'
        +   '</div>'
        + '</div>'
        + '<div class="eb2-section-label">Verbrauch nach Quelle</div>'
        + '<div class="eb2-dist">'
        +   row('Solar direkt', d.distDirect, 'var(--solar)', d.distDirect)
        +   row('Aus Akku',     d.distBat,    '#c084fc',      d.distBat)
        +   row('Aus Netz',     d.distGrid,   'var(--blue)',   d.distGrid)
        + '</div>'
        + '</div>';
}

function renderEbVariantB(el, d) {
    const W = 380, H = 260;
    const maxKwh = Math.max(d.solar + d.grid, d.load, 0.01);
    const flowW = (v) => Math.max(2, Math.min(22, (v / maxKwh) * 28));

    const srcX = 55, batX = 190, loadX = 325;
    const solarY = 55, gridY = 200, batY = 128, loadY = 128;

    let paths = '', nodes = '';

    const flowPath = (x1, y1, x2, y2, val, color) => {
        if (val < 0.01) return '';
        const w = flowW(val);
        const cpx = (x1 + x2) / 2;
        return '<path d="M' + x1 + ',' + y1 + ' C' + cpx + ',' + y1 + ' ' + cpx + ',' + y2 + ' ' + x2 + ',' + y2 + '"'
            + ' fill="none" stroke="' + color + '" stroke-width="' + w + '" opacity="0.2" stroke-linecap="round"/>'
            + '<path d="M' + x1 + ',' + y1 + ' C' + cpx + ',' + y1 + ' ' + cpx + ',' + y2 + ' ' + x2 + ',' + y2 + '"'
            + ' fill="none" stroke="' + color + '" stroke-width="' + Math.max(1.5, w * 0.4) + '" opacity="0.7"'
            + ' stroke-dasharray="6 10" stroke-linecap="round" class="ebf-flow-anim"/>';
    };

    paths += flowPath(srcX + 42, solarY - 5, loadX - 42, loadY - 28, d.directUse, '#f59e0b');
    paths += flowPath(srcX + 42, solarY + 8, batX - 38, batY - 12, d.solarToBat, '#f59e0b');
    paths += flowPath(srcX + 42, gridY - 8, batX - 38, batY + 12, d.gridToBat, '#3b82f6');
    paths += flowPath(srcX + 42, gridY + 5, loadX - 42, loadY + 28, d.distGrid, '#3b82f6');
    paths += flowPath(batX + 38, batY, loadX - 42, loadY, d.batOut, '#c084fc');

    const nodeBox = (cx, cy, w, h, fill, stroke) =>
        '<rect x="' + (cx-w/2) + '" y="' + (cy-h/2) + '" width="' + w + '" height="' + h + '" rx="10" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"/>';

    nodes += nodeBox(srcX, solarY, 88, 54, 'rgba(245,158,11,0.12)', '#f59e0b');
    nodes += '<text x="' + srcX + '" y="' + (solarY - 7) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#f59e0b">Solar</text>';
    nodes += '<text x="' + srcX + '" y="' + (solarY + 12) + '" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text,#fff)">' + d.f(d.solar) + ' kWh</text>';

    nodes += nodeBox(srcX, gridY, 88, 54, 'rgba(59,130,246,0.12)', '#3b82f6');
    nodes += '<text x="' + srcX + '" y="' + (gridY - 7) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#3b82f6">Netz</text>';
    nodes += '<text x="' + srcX + '" y="' + (gridY + 12) + '" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text,#fff)">' + d.f(d.grid) + ' kWh</text>';

    nodes += nodeBox(batX, batY, 82, 68, 'rgba(34,197,94,0.12)', '#22c55e');
    nodes += '<text x="' + batX + '" y="' + (batY - 16) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#22c55e">Akku</text>';
    nodes += '<text x="' + batX + '" y="' + (batY + 2) + '" text-anchor="middle" font-size="10" fill="#60a5fa">↓ ' + d.f(d.batIn) + '</text>';
    nodes += '<text x="' + batX + '" y="' + (batY + 16) + '" text-anchor="middle" font-size="10" fill="#c084fc">↑ ' + d.f(d.batOut) + '</text>';

    nodes += nodeBox(loadX, loadY, 92, 78, 'rgba(107,114,128,0.12)', 'var(--text-dim,#888)');
    nodes += '<text x="' + loadX + '" y="' + (loadY - 20) + '" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-dim,#888)">Verbrauch</text>';
    nodes += '<text x="' + loadX + '" y="' + (loadY + 2) + '" text-anchor="middle" font-size="16" font-weight="800" fill="var(--text,#fff)">' + d.f(d.load) + '</text>';
    nodes += '<text x="' + loadX + '" y="' + (loadY + 16) + '" text-anchor="middle" font-size="10" fill="var(--text-dim,#888)">kWh</text>';

    const autoColor = d.autarkie >= 70 ? '#22c55e' : d.autarkie >= 30 ? '#f59e0b' : '#f97316';
    nodes += '<text x="' + loadX + '" y="' + (loadY + 34) + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + autoColor + '">' + d.autarkie + '% Solar</text>';

    el.innerHTML = '<div class="ebf"><svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:440px;margin:0 auto;display:block" class="ebf-svg">'
        + '<style>.ebf-flow-anim{animation:ebf-dash 1.5s linear infinite}@keyframes ebf-dash{to{stroke-dashoffset:-32}}</style>'
        + paths + nodes + '</svg></div>';
}

function renderEbVariantC(el, d) {
    const size = 180, cx = size / 2, cy = size / 2, r = 68, sw = 18;
    const circ = 2 * Math.PI * r;
    const total = d.distDirect + d.distBat + d.distGrid;
    if (total < 0.01) { el.innerHTML = '<div class="ebd"><p style="color:var(--text-dim)">Keine Daten</p></div>'; return; }

    const segments = [
        { val: d.distDirect, color: '#f59e0b', label: 'Solar direkt' },
        { val: d.distBat,    color: '#c084fc', label: 'Aus Akku' },
        { val: d.distGrid,   color: '#3b82f6', label: 'Aus Netz' },
    ];

    let arcs = '', offset = 0;
    const gap = 4;
    segments.forEach(seg => {
        if (seg.val < 0.01) return;
        const pct = seg.val / total;
        const dash = Math.max(0, pct * circ - gap);
        arcs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none"'
            + ' stroke="' + seg.color + '" stroke-width="' + sw + '"'
            + ' stroke-dasharray="' + dash.toFixed(2) + ' ' + (circ - dash).toFixed(2) + '"'
            + ' stroke-dashoffset="' + (-offset - gap / 2).toFixed(2) + '"'
            + ' transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
        offset += pct * circ;
    });

    const svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" style="display:block;margin:0 auto">'
        + arcs
        + '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text,#fff)">' + d.f(d.load) + '</text>'
        + '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" font-size="10" fill="var(--text-dim,#888)">kWh</text>'
        + '</svg>';

    let legend = '<div class="ebd-legend">';
    segments.forEach(seg => {
        const pct = total > 0 ? Math.round((seg.val / total) * 100) : 0;
        legend += '<div class="ebd-leg-item">'
            + '<span class="ebd-leg-dot" style="background:' + seg.color + '"></span>'
            + '<span class="ebd-leg-label">' + seg.label + '</span>'
            + '<span class="ebd-leg-val">' + d.f(seg.val) + ' kWh</span>'
            + '<span class="ebd-leg-pct">' + pct + '%</span>'
            + '</div>';
    });
    legend += '</div>';

    const autoColor = d.autarkie >= 70 ? '#22c55e' : d.autarkie >= 30 ? '#f59e0b' : '#f97316';
    const autarkie = '<div class="ebd-autarkie">'
        + '<div class="ebd-auto-header">'
        + '<span class="ebd-auto-label">Solar-Autarkie</span>'
        + '<span class="ebd-auto-pct" style="color:' + autoColor + '">' + d.autarkie + '%</span>'
        + '</div>'
        + '<div class="ebd-auto-bar"><div class="ebd-auto-fill" style="width:' + d.autarkie + '%;background:' + autoColor + '"></div></div>'
        + '<div class="ebd-auto-sub">' + d.f(d.solarToLoad) + ' kWh Solar von ' + d.f(d.load) + ' kWh</div>'
        + '</div>';

    const battery = '<div class="ebd-bat-summary">'
        + '<span class="ebd-bat-label">Akku</span>'
        + '<span class="ebd-bat-in">↓ ' + d.f(d.batIn) + ' geladen</span>'
        + '<span class="ebd-bat-sep">·</span>'
        + '<span class="ebd-bat-out">↑ ' + d.f(d.batOut) + ' entladen</span>'
        + '</div>';

    el.innerHTML = '<div class="ebd">' + svg + legend + autarkie + battery + '</div>';
}

async function loadFlowVariants(days) {
    _flowVarDays = days || _flowVarDays;
    // Update tab active state
    document.querySelectorAll('#flowAnimTabs .tab').forEach(t => {
        t.classList.toggle('active', parseInt(t.dataset.flowvar, 10) === _flowVarDays);
    });
    try {
        const res = await fetch('/api/sankey?days=' + _flowVarDays);
        if (!res.ok) return;
        const data = await res.json();
        const t = data.totals || {};
        const flows = data.flows || [];
        const solar = t.solar_kwh || 0;
        const grid = t.grid_in_kwh || 0;
        const batIn = t.battery_in_kwh || 0;
        const batOut = t.battery_out_kwh || 0;
        const load = t.load_kwh || 0;
        const directUse = (flows.find(f => f.from === 'solar' && f.to === 'load') || {}).kwh || 0;
        const gridToLoad = (flows.find(f => f.from === 'grid' && f.to === 'load') || {}).kwh || 0;
        const gridToBat = (flows.find(f => f.from === 'grid' && f.to === 'battery') || {}).kwh || 0;
        const solarToBat = (flows.find(f => f.from === 'solar' && f.to === 'battery') || {}).kwh || 0;

        const animEl = $('flowAnimatedContent');
        if (animEl) {
            const solarShareRatio = batIn > 0.01 ? solarToBat / batIn : 0;
            const solarViaBat = batOut * solarShareRatio;
            const solarToLoad = directUse + solarViaBat;
            const autarkie = load > 0.01 ? Math.max(0, Math.min(100, Math.round(solarToLoad / load * 100))) : 0;
            const f = (v) => fmtKwh.format(v);
            const pct = (v) => load > 0.01 ? Math.max(0, Math.min(100, (v / load) * 100)) : 0;
            const distDirect = directUse;
            const distBat = batOut;
            const distGrid = gridToLoad;

            const iconSolar = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
            const iconGrid = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2 7 8h10L15 2"/><path d="M7 8v14M17 8v14M4 12h16M4 18h16"/></svg>';
            const iconBattery = '<svg viewBox="0 0 28 16" width="44" height="26" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="2" width="22" height="12" rx="2"/><rect x="24" y="6" width="3" height="4" rx="0.5" fill="currentColor" stroke="none"/></svg>';

            const dd = { solar, grid, batIn, batOut, load, directUse, gridToLoad, solarToBat, gridToBat,
                solarShareRatio, solarViaBat, solarToLoad, autarkie, f, pct,
                distDirect, distBat, distGrid, iconSolar, iconGrid, iconBattery };
            const renderer = { A: renderEbVariantA, B: renderEbVariantB, C: renderEbVariantC }[_flowVariant] || renderEbVariantA;
            renderer(animEl, dd);
        }
    } catch (e) { console.warn('Flow variants error:', e); }
}

// Tab bar for Energie-Bilanz
document.querySelectorAll('#flowAnimTabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#flowAnimTabs .tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        loadFlowVariants(parseInt(btn.dataset.flowvar, 10) || 1);
    });
});

loadFlowVariants(1);

(function initVariantToggle() {
    const tabs = document.getElementById('flowAnimTabs');
    if (!tabs) return;
    const toggle = document.createElement('div');
    toggle.className = 'eb-variant-toggle';
    toggle.innerHTML =
        '<button class="eb-var-btn active" data-variant="A">A - Cards</button>' +
        '<button class="eb-var-btn" data-variant="B">B - Flow</button>' +
        '<button class="eb-var-btn" data-variant="C">C - Donut</button>';
    tabs.after(toggle);
    toggle.querySelectorAll('.eb-var-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggle.querySelectorAll('.eb-var-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _flowVariant = btn.dataset.variant;
            loadFlowVariants();
        });
    });
})();

document.addEventListener('keydown', (e) => {
    // Ignore when typing in an input / textarea / contenteditable
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const targetId = {
        'h': 'heatmapWrap',
        's': 'statsGrid',
        'c': 'batteryCycleSection',
        'e': 'energyFlowSection',
        'b': 'breakEvenSection',
        'a': 'anomalySection',
    }[e.key.toLowerCase()];

    if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
            e.preventDefault();
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    } else if (e.key === '?') {
        e.preventDefault();
        alert('Shortcuts:\n  h — Heatmap\n  s — Statistics\n  c — Battery cycles\n  e — Energy flow\n  b — Break-even\n  a — Anomaly');
    }
});

// ============================================================================
// Mobile Bottom Tab Bar - Navigation + Active State
// ============================================================================
// ============================================================================
// Collapsible Sections
// ============================================================================
(function initCollapsibleSections() {
    // Everything up to and including Energie-Bilanz stays open.
    // Everything after is collapsed by default.
    const CUTOFF_ID = 'flowAnimatedSection';

    // Select all section-like containers
    const sections = document.querySelectorAll('.today-box[id]');
    // Reset saved state when cutoff changes (version bump clears stale prefs)
    const COLLAPSE_VERSION = 4;
    const savedState = (() => {
        try {
            const raw = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
            if (raw._v !== COLLAPSE_VERSION) { localStorage.removeItem('collapsedSections'); return {}; }
            return raw;
        } catch { return {}; }
    })();

    function saveState(states) {
        try { states._v = COLLAPSE_VERSION; localStorage.setItem('collapsedSections', JSON.stringify(states)); }
        catch {}
    }

    // Build set of IDs that are at or before the cutoff in DOM order
    // Include hidden sections (display:none) so cutoff works correctly
    const allSections = document.querySelectorAll('.today-box[id]');
    let reachedCutoff = false;
    const openByDefault = new Set();
    allSections.forEach(s => {
        if (reachedCutoff) return;
        if (s.id) openByDefault.add(s.id);
        if (s.id === CUTOFF_ID) reachedCutoff = true;
    });

    sections.forEach((section, idx) => {
        // Find the header (h2 or h3)
        const header = section.querySelector('h2, h3');
        if (!header) return;

        // Generate a stable ID for state persistence
        const sectionId = section.id || 'section-' + idx;
        if (!section.id) section.id = sectionId;

        // Skip the ticker
        if (section.classList.contains('ticker')) return;

        // Wrap all children after the header in a section-body div
        const body = document.createElement('div');
        body.className = 'section-body';
        const children = Array.from(section.children);
        let afterHeader = false;
        for (const child of children) {
            if (child === header) { afterHeader = true; continue; }
            if (afterHeader) body.appendChild(child);
        }
        section.appendChild(body);

        // Add chevron to header
        header.classList.add('section-header');
        const chevron = document.createElement('span');
        chevron.className = 'chevron';
        chevron.textContent = '\u25BC';
        header.appendChild(chevron);

        // Determine initial state
        const isDefaultOpen = openByDefault.has(sectionId);
        const isCollapsed = sectionId in savedState
            ? savedState[sectionId]
            : !isDefaultOpen;

        if (isCollapsed) {
            section.classList.add('section-collapsed');
        } else {
            body.style.maxHeight = 'none';
        }

        // Click handler
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking a link or button inside header
            if (e.target.closest('a, button:not(.section-header)')) return;

            const collapsed = section.classList.contains('section-collapsed');
            if (collapsed) {
                // Expand
                section.classList.remove('section-collapsed');
                body.style.maxHeight = body.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    setTimeout(() => { body.style.maxHeight = 'none'; }, 350);
                });
            } else {
                // Collapse
                body.style.maxHeight = body.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    body.style.maxHeight = '0px';
                    section.classList.add('section-collapsed');
                });
            }

            // Persist
            savedState[sectionId] = !collapsed;
            saveState(savedState);
        });
    });
})();
