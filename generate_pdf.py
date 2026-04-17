"""Generate Use Case Report PDF for Anker Solix C1000 Gen 2 Solar Dashboard."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak,
    Table, TableStyle, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
from datetime import datetime

# Colors
ORANGE = HexColor("#F5A623")
DARK = HexColor("#1a1a2e")
GRAY = HexColor("#666666")
LIGHT_GRAY = HexColor("#f0f0f0")
GREEN = HexColor("#4CAF50")

SCREENSHOTS = "screenshots"
OUTPUT = "Anker_Solix_Dashboard_UseCase_Report.pdf"

WIDTH, HEIGHT = A4  # 595.28 x 841.89 points


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        topMargin=20*mm,
        bottomMargin=15*mm,
        leftMargin=15*mm,
        rightMargin=15*mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=28,
        leading=34,
        textColor=DARK,
        spaceAfter=5*mm,
        alignment=TA_CENTER,
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        leading=18,
        textColor=GRAY,
        spaceAfter=15*mm,
        alignment=TA_CENTER,
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontSize=20,
        leading=26,
        textColor=DARK,
        spaceBefore=8*mm,
        spaceAfter=4*mm,
        borderColor=ORANGE,
        borderWidth=0,
        borderPadding=0,
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=DARK,
        spaceBefore=5*mm,
        spaceAfter=3*mm,
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=DARK,
        spaceAfter=3*mm,
        alignment=TA_JUSTIFY,
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=body_style,
        leftIndent=10*mm,
        bulletIndent=5*mm,
        spaceAfter=1.5*mm,
    )

    caption_style = ParagraphStyle(
        'Caption',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=GRAY,
        alignment=TA_CENTER,
        spaceBefore=1*mm,
        spaceAfter=4*mm,
    )

    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=GRAY,
        alignment=TA_CENTER,
    )

    # Available width for images
    avail_width = WIDTH - 30*mm  # 15mm margins each side
    img_width = avail_width * 0.95

    def add_screenshot(name, caption_text):
        """Helper to add a screenshot with caption."""
        path = os.path.join(SCREENSHOTS, f"{name}.png")
        if not os.path.exists(path):
            return [Paragraph(f"[Screenshot not found: {name}]", body_style)]
        img = Image(path)
        # Scale to fit width while maintaining aspect ratio
        aspect = img.imageHeight / img.imageWidth
        img_h = img_width * aspect
        # Cap max height to avoid overflow
        max_h = HEIGHT * 0.65
        if img_h > max_h:
            img_h = max_h
            img_w = img_h / aspect
        else:
            img_w = img_width
        img.drawWidth = img_w
        img.drawHeight = img_h
        return [
            img,
            Paragraph(caption_text, caption_style),
        ]

    # === BUILD DOCUMENT ===
    elements = []

    # --- TITLE PAGE ---
    elements.append(Spacer(1, 40*mm))
    elements.append(Paragraph("Anker Solix C1000 Gen 2", title_style))
    elements.append(Paragraph("Solar Dashboard", ParagraphStyle(
        'TitleSub', parent=title_style, fontSize=22, textColor=ORANGE, spaceAfter=10*mm
    )))
    elements.append(Paragraph(
        "Use Case Report & Feature Documentation",
        subtitle_style
    ))
    elements.append(Spacer(1, 10*mm))

    # Info table
    info_data = [
        ["System", "Anker Solix C1000 Gen 2 (A1763)"],
        ["Kapazitat", "2080 Wh LiFePO4 (C1000 + BP1000)"],
        ["Solar", "2 x 200W flexible Panels (SW 240°, 60°-90° Kurve)"],
        ["Standort", "Warschau, Polen"],
        ["Dashboard", "Echtzeit Web-App (PWA)"],
        ["Datenquelle", "MQTT (alle 3 Sekunden)"],
        ["Erstellt", datetime.now().strftime("%d.%m.%Y")],
    ]
    info_table = Table(info_data, colWidths=[35*mm, 120*mm])
    info_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), GRAY),
        ('TEXTCOLOR', (1, 0), (1, -1), DARK),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, LIGHT_GRAY),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(info_table)
    elements.append(PageBreak())

    # --- TABLE OF CONTENTS ---
    elements.append(Paragraph("Inhaltsverzeichnis", h1_style))
    elements.append(Spacer(1, 5*mm))
    toc_items = [
        "1. Dashboard-Ubersicht & Wetter",
        "2. Solar-Prognose (7 Tage)",
        "3. Prognose vs. Realitat",
        "4. Live-Statusanzeigen (4 Karten)",
        "5. Energiefluss-Visualisierung",
        "6. Energie & Ersparnis",
        "7. Echtzeit-Charts (12 Graphen)",
        "8. Solar-Kalender & Batterie-Gesundheit",
        "9. Batterie-Zyklen & Verbrauchsmuster",
        "10. Statistiken & Daten-Export",
        "11. MQTT-Ubersicht",
        "12. Amortisations-Rechner",
        "13. Daten-Backup & MQTT Live-Log",
        "14. Gerate-Info & Technische Daten",
        "15. Ladezyklen-Aquivalent",
        "16. Push-Benachrichtigungen",
        "17. Technische Architektur",
    ]
    for item in toc_items:
        elements.append(Paragraph(item, ParagraphStyle(
            'TOC', parent=body_style, fontSize=11, leading=18, spaceAfter=1*mm
        )))
    elements.append(PageBreak())

    # --- 1. DASHBOARD OVERVIEW ---
    elements.append(Paragraph("1. Dashboard-Ubersicht & Wetter", h1_style))
    elements.append(Paragraph(
        "Das Dashboard zeigt auf einen Blick den aktuellen Status der Solaranlage: "
        "Links der Solar-Score (Tagesertrag in % des Potenzials), in der Mitte Wetterdaten "
        "(Temperatur, Sonnenauf-/untergang, UV-Index, Wind, Wolkenbedeckung) und rechts "
        "die heutigen Ersparnisse in EUR sowie den CO2-Fussabdruck.",
        body_style
    ))
    elements.extend(add_screenshot("01_header_overview_forecast",
        "Abb. 1: Dashboard-Header mit Score-Ring, Wetter-Widget und Tagesersparnissen"))

    elements.append(Paragraph("Funktionen:", h2_style))
    for feat in [
        "Echtzeit-Wetterdaten von Open-Meteo (stundlich aktualisiert)",
        "UV-Index mit Farbcodierung (niedrig/mittel/hoch/extrem)",
        "Sonnenauf- und Sonnenuntergangszeiten fur Warschau",
        "Automatische Hell/Dunkel-Modusumschaltung (auch manuell)",
        "PWA-fahig: Als App auf dem Homescreen installierbar",
        "Push-Benachrichtigungen (Glocken-Symbol oben rechts)",
    ]:
        elements.append(Paragraph(f"\u2022 {feat}", bullet_style))

    elements.append(PageBreak())

    # --- 2. SOLAR FORECAST ---
    elements.append(Paragraph("2. Solar-Prognose (7 Tage)", h1_style))
    elements.append(Paragraph(
        "Die 7-Tage-Solar-Prognose nutzt Open-Meteo-Wetterdaten und berechnet den erwarteten "
        "Ertrag basierend auf dem Standort (Warschau), der Panelausrichtung (240° SW) und "
        "dem Neigungsprofil (60°-90° Kurve, 5 Segmente). Jeder Tag zeigt Wettericon, erwartete kWh, "
        "Sonnenstunden, Windgeschwindigkeit, UV-Index und Wolkenbedeckung.",
        body_style
    ))
    elements.extend(add_screenshot("01_header_overview_forecast",
        "Abb. 2: 7-Tage Solar-Prognose mit detaillierten Wetterdaten pro Tag"))

    elements.append(PageBreak())

    # --- 3. FORECAST VS REALITY ---
    elements.append(Paragraph("3. Prognose vs. Realitat", h1_style))
    elements.append(Paragraph(
        "Das Balkendiagramm vergleicht die prognostizierte Solarproduktion (hell) mit der "
        "tatsachlich gemessenen Produktion (dunkel) der letzten 7 Tage. "
        "Pro Tag wird die prozentuale Ubereinstimmung angezeigt, um die Prognosegenauigkeit "
        "zu bewerten.",
        body_style
    ))
    elements.extend(add_screenshot("02_forecast_reality_cards",
        "Abb. 3: Prognose vs. Realitat Chart mit Genauigkeits-Prozenten und Live-Statuskarten"))

    elements.append(PageBreak())

    # --- 4. LIVE STATUS CARDS ---
    elements.append(Paragraph("4. Live-Statusanzeigen", h1_style))
    elements.append(Paragraph(
        "Vier interaktive Karten zeigen den aktuellen Status in Echtzeit (Aktualisierung alle 3 Sekunden via WebSocket):",
        body_style
    ))
    for card in [
        "<b>Solareingabe</b> - Aktuelle Solarleistung in Watt mit Panelvisualisierung (max. 400W fur 2x200W)",
        "<b>Batterie</b> - Ladezustand (SOC %) mit Farb-Ring, Lade-/Entladestatus und geschatzter Restlaufzeit",
        "<b>Temperatur</b> - Geratetemperatur mit Thermometer-Visualisierung und Farbcodierung (blau/grun/rot)",
        "<b>Ausgang Gesamt</b> - Gesamtausgangsleistung mit Balkenvisualisierung (max. 3000W Peak)",
    ]:
        elements.append(Paragraph(f"\u2022 {card}", bullet_style))

    # Status bar
    elements.append(Spacer(1, 3*mm))
    elements.append(Paragraph(
        "Die Statusleiste zwischen Header und Karten zeigt die aktuelle MQTT-Nachricht "
        "mit Zeitstempel, Batteriestatus und Temperatur. Die Legende darunter erklart "
        "die Farbcodes fur AC/DC-Ausgange, Batteriebereich und maximale Solareingabe.",
        body_style
    ))

    elements.append(PageBreak())

    # --- 5. ENERGY FLOW ---
    elements.append(Paragraph("5. Energiefluss-Visualisierung", h1_style))
    elements.append(Paragraph(
        "Der vertikale Energiefluss zeigt den Weg der Energie durch das System: "
        "Oben die Eingange (Solar und AC-Netz), in der Mitte die Batterie mit "
        "aktuellem Ladestand (visueller Fullbalken), und unten alle Ausgange "
        "(AC 230V, 3x USB-C, USB-A, DC 12V) in einem ubersichtlichen 2-Spalten-Grid.",
        body_style
    ))
    elements.extend(add_screenshot("03_energyflow_savings",
        "Abb. 4: Vertikaler Energiefluss mit Batterie-Visualisierung und allen Ein-/Ausgangen"))

    elements.append(PageBreak())

    # --- 6. ENERGY & SAVINGS ---
    elements.append(Paragraph("6. Energie & Ersparnis", h1_style))
    elements.append(Paragraph(
        "Die Energietabelle fasst Solarproduktion, Verbrauch, Ersparnisse (EUR) und "
        "CO2-Vermeidung fur verschiedene Zeitraume zusammen: Heute, Woche, Monat und Gesamt. "
        "Der Strompreis (0,25 EUR/kWh) wird fur die Berechnung verwendet. "
        "Darunter drei Kennzahlen: Gesamt-kWh der letzten 7 Tage, Durchschnitt pro Tag, "
        "und Gesamtsonnenstunden.",
        body_style
    ))
    elements.extend(add_screenshot("03_energyflow_savings",
        "Abb. 5: Energie-Ubersicht mit Ersparnissen nach Zeitraum"))

    elements.append(PageBreak())

    # --- 7. REALTIME CHARTS ---
    elements.append(Paragraph("7. Echtzeit-Charts (12 Graphen)", h1_style))
    elements.append(Paragraph(
        "Umschaltbar zwischen Tag/Woche/Monat/Jahr - 12 interaktive Charts "
        "visualisieren alle Messwerte mit Chart.js:",
        body_style
    ))
    for chart in [
        "Solar (W) - Solarleistung uber Zeit",
        "Batterie (%) - Ladezustand mit grun/gelb/rot Zonen",
        "Temperatur (°C) - Min/Max-Bereich mit Linie",
        "Ausgang Gesamt (W) - Gesamtverbrauch",
        "AC 230V (W) - Wechselstrom-Ausgang",
        "USB-C 1/2/3 (W) - Drei separate USB-C Ports",
        "USB-A (W) - USB-A Ausgang",
        "DC 12V (W) - Gleichstrom-Ausgang",
        "AC Laden (W) - Netzladung (logarithmisch)",
        "Heute vs. Gestern - Solar-Vergleich",
        "Tagesproduktion (kWh) - Solar vs. Verbrauch",
    ]:
        elements.append(Paragraph(f"\u2022 {chart}", bullet_style))

    elements.extend(add_screenshot("04_charts_solar_battery_temp",
        "Abb. 6: Solar-, Batterie- und Temperatur-Charts"))
    elements.extend(add_screenshot("05_charts_output_ac_usbc",
        "Abb. 7: Ausgangs-, AC- und USB-C-Charts"))
    elements.extend(add_screenshot("06_charts_comparison_daily",
        "Abb. 8: AC Laden, Tagesvergleich und Tagesproduktion"))

    elements.append(PageBreak())

    # --- 8. SOLAR CALENDAR & SOH ---
    elements.append(Paragraph("8. Solar-Kalender & Batterie-Gesundheit", h1_style))
    elements.append(Paragraph(
        "Der Solar-Kalender (inspiriert vom GitHub-Contribution-Graph) zeigt die tagliche "
        "Solarproduktion als Farbintensitat. Darunter die Batterie-Gesundheit (State of Health) "
        "als Langzeittrend - wichtig fur die Lebensdauer der LiFePO4-Zellen.",
        body_style
    ))
    elements.extend(add_screenshot("07_calendar_soh_cycles",
        "Abb. 9: Solar-Kalender, SOH-Trend und Batterie-Zyklen"))

    elements.append(PageBreak())

    # --- 9. BATTERY CYCLES & USAGE ---
    elements.append(Paragraph("9. Batterie-Zyklen & Verbrauchsmuster", h1_style))
    elements.append(Paragraph(
        "Die Batterie-Zyklen-Anzeige zeigt Gesamt-Zyklen, heutige Zyklen und verbleibende "
        "Zyklen (von 3000 LiFePO4-Zyklen bei 80% Kapazitat). Das Verbrauchsmuster analysiert "
        "die stundliche Nutzung und kategorisiert sie automatisch (z.B. Standby/LED, "
        "Entertainment, Kochen).",
        body_style
    ))

    elements.append(PageBreak())

    # --- 10. STATISTICS & EXPORT ---
    elements.append(Paragraph("10. Statistiken & Daten-Export", h1_style))
    elements.append(Paragraph(
        "Die Statistik-Sektion zeigt Peak Solar, Durchschnitts-Solar, Durchschnitts-Temperatur, "
        "Peak Output, Min/Max Batterie - umschaltbar zwischen Heute, 7 Tage, 30 Tage und Alle. "
        "Der CSV-Export ermoglicht das Herunterladen der Rohdaten fur jeden Zeitraum.",
        body_style
    ))
    elements.extend(add_screenshot("08_stats_export_mqtt",
        "Abb. 10: Statistiken, CSV-Export und MQTT-Ubersicht"))

    elements.append(PageBreak())

    # --- 11. MQTT OVERVIEW ---
    elements.append(Paragraph("11. MQTT-Ubersicht", h1_style))
    elements.append(Paragraph(
        "Der kombinierte MQTT-Chart zeigt alle wichtigen Metriken auf einer Zeitachse: "
        "Solar (orange), Output (grun), AC In (blau), Batterie-% (hellgrun) und "
        "Temperatur (lila). Umschaltbar zwischen Tag/Woche/Monat/Jahr mit logarithmischer "
        "Y-Achse fur Watt-Werte und linearer Achse fur Prozent/Temperatur.",
        body_style
    ))

    elements.append(PageBreak())

    # --- 12. AMORTISATION ---
    elements.append(Paragraph("12. Amortisations-Rechner", h1_style))
    elements.append(Paragraph(
        "Der integrierte Amortisations-Rechner berechnet, wann sich die Investition "
        "(941 EUR Systemkosten) durch Stromersparnisse amortisiert hat. Er zeigt "
        "Systemkosten, bisherige Ersparnisse, verbleibende Kosten und einen Fortschrittsbalken. "
        "Zusatzlich wird die gesamte CO2-Vermeidung angezeigt. "
        "Die detaillierte Kostenaufstellung ist ausklappbar.",
        body_style
    ))
    elements.extend(add_screenshot("09_amortisation_backup_log",
        "Abb. 11: Amortisations-Rechner, Daten-Backup und MQTT Live-Log"))

    elements.append(PageBreak())

    # --- 13. BACKUP & LOG ---
    elements.append(Paragraph("13. Daten-Backup & MQTT Live-Log", h1_style))
    elements.append(Paragraph(
        "Das Daten-Backup exportiert alle archivierten 3-Sekunden-MQTT-Daten als CSV. "
        "Tagesarchive werden automatisch mit gzip komprimiert. "
        "Der MQTT Live-Log zeigt die letzten 7136+ Datenpunkte mit Paginierung "
        "(10 Eintrage pro Seite), filterbar nach Zeit, Solar, Batterie, Temperatur, "
        "Ausgang und AC-Eingang.",
        body_style
    ))

    elements.append(PageBreak())

    # --- 14. DEVICE INFO & SPECS ---
    elements.append(Paragraph("14. Gerate-Info & Technische Daten", h1_style))
    elements.append(Paragraph(
        "Die Gerate-Info zeigt aktuelle Einstellungen (Ladegrenzen, AC-Limit, Display-Status, Modell). "
        "Die Technischen Daten listen alle Spezifikationen in 4 Kategorien: "
        "Eingang (AC, Solar MPPT, UltraFast), Ausgang (AC 2000W Peak, USB-C 3x140W, DC 12V), "
        "Batterie (2080Wh LiFePO4: C1000+BP1000, 3000 Zyklen) und Gehause (Masse, Gewicht).",
        body_style
    ))
    elements.extend(add_screenshot("10_deviceinfo_techspecs",
        "Abb. 12: Gerate-Info und vollstandige technische Spezifikationen"))

    elements.append(PageBreak())

    # --- 15. CHARGE EQUIVALENTS ---
    elements.append(Paragraph("15. Ladezyklen-Aquivalent", h1_style))
    elements.append(Paragraph(
        "Eine anschauliche Visualisierung zeigt, wie oft die Tagesladung typische "
        "Gerate laden konnte: iPhone 15 Pro Max (534x/Woche, 76x/Tag) und "
        "MacBook Air M4 13\" (175x/Woche, 25x/Tag). Die Werte aktualisieren sich "
        "dynamisch basierend auf dem aktuellen Ladestand.",
        body_style
    ))
    elements.extend(add_screenshot("11_charge_equivalents",
        "Abb. 13: Ladezyklen-Aquivalent fur iPhone und MacBook"))

    elements.append(PageBreak())

    # --- 16. PUSH NOTIFICATIONS ---
    elements.append(Paragraph("16. Push-Benachrichtigungen", h1_style))
    elements.append(Paragraph(
        "Das Dashboard unterstutzt drei Arten von Push-Benachrichtigungen:",
        body_style
    ))
    for notif in [
        "<b>Temperatur-Warnung</b> - Automatisch bei Geratetemperatur > 40°C, "
        "Reset bei Abkuhlung unter 38°C",
        "<b>Taglicher Solar-Report</b> - Wird 15 Minuten nach Sonnenuntergang gesendet "
        "(wenn Solardaten vorhanden). Zeigt Tagesertrag in kWh und Ersparnisse in EUR",
        "<b>Test-Benachrichtigung</b> - Doppelklick auf das Glocken-Symbol sendet "
        "eine Test-Notification zur Uberprufung",
    ]:
        elements.append(Paragraph(f"\u2022 {notif}", bullet_style))

    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph(
        "Benachrichtigungen werden nur einmal pro Tag gesendet (Duplikatschutz via localStorage). "
        "Der Browser muss Notifications erlaubt haben.",
        body_style
    ))

    elements.append(PageBreak())

    # --- 17. TECHNICAL ARCHITECTURE ---
    elements.append(Paragraph("17. Technische Architektur", h1_style))
    elements.append(Paragraph("Backend:", h2_style))
    for item in [
        "Python FastAPI Server auf Port 8420",
        "MQTT-Verbindung zur Anker Solix API (alle 3 Sekunden)",
        "SQLite-Datenbank (WAL-Modus) fur Live-Charts (letzte 2 Tage)",
        "CSV-Archiv mit gzip-Kompression fur Langzeitspeicherung",
        "WebSocket fur Echtzeit-Push an alle verbundenen Clients",
    ]:
        elements.append(Paragraph(f"\u2022 {item}", bullet_style))

    elements.append(Paragraph("Frontend:", h2_style))
    for item in [
        "Progressive Web App (PWA) mit Service Worker",
        "Offline-fahig: API-Antworten werden 5 Minuten gecacht",
        "Chart.js fur alle Diagramme (12+ interaktive Charts)",
        "Responsive Design (Desktop & Mobile optimiert)",
        "i18n: Deutsch & Englisch (automatisch nach Browser-Sprache)",
        "Light/Dark Mode mit System-Praferenz-Erkennung",
    ]:
        elements.append(Paragraph(f"\u2022 {item}", bullet_style))

    elements.append(Paragraph("Datenfluss:", h2_style))
    elements.append(Paragraph(
        "Anker Cloud -> MQTT (3s) -> FastAPI Server -> WebSocket -> Browser. "
        "Parallel: Server -> SQLite (60s Interval) + CSV-Archiv (bei Wertanderung). "
        "Altere SQLite-Readings werden nach 2 Tagen geloscht (VACUUM), "
        "CSV-Archive bleiben als gzip dauerhaft erhalten.",
        body_style
    ))

    elements.append(Paragraph("Hosting:", h2_style))
    for item in [
        "Fly.io (Production) - 256MB RAM, Frankfurt Region",
        "Oracle Cloud Free Tier (geplant) - ARM VM, dauerhaft kostenlos",
        "Lokaler Entwicklungsserver auf macOS",
    ]:
        elements.append(Paragraph(f"\u2022 {item}", bullet_style))

    # Footer
    elements.append(Spacer(1, 15*mm))
    elements.append(Paragraph(
        f"Generiert am {datetime.now().strftime('%d.%m.%Y um %H:%M')} Uhr",
        footer_style
    ))

    # Build
    doc.build(elements)
    print(f"PDF erstellt: {OUTPUT}")
    print(f"Grosse: {os.path.getsize(OUTPUT) / 1024:.0f} KB")


if __name__ == "__main__":
    build_pdf()
