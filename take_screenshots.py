"""Take desktop screenshots of the Solar Dashboard in light mode for PDF report."""
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

SCREENSHOT_DIR = "screenshots"
URL = "http://localhost:8420"

# Section scroll positions and names
SECTIONS = [
    (0, "01_header_overview_forecast"),
    (530, "02_forecast_reality_cards"),
    (1100, "03_energyflow_savings"),
    (1750, "04_charts_solar_battery_temp"),
    (2400, "05_charts_output_ac_usbc"),
    (3900, "06_charts_comparison_daily"),
    (4600, "07_calendar_soh_cycles"),
    (5300, "08_stats_export_mqtt"),
    (6100, "09_amortisation_backup_log"),
    (7000, "10_deviceinfo_techspecs"),
    (7600, "11_charge_equivalents"),
]


def main():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1280,900")
    options.add_argument("--force-device-scale-factor=2")  # Retina quality
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    # Use the known chromedriver path
    import glob
    cd_paths = glob.glob("/Users/florian/.wdm/drivers/chromedriver/mac64/*/chromedriver-mac-arm64/chromedriver")
    chromedriver_path = cd_paths[-1] if cd_paths else ChromeDriverManager().install()
    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service, options=options)

    try:
        driver.get(URL)
        time.sleep(3)  # Wait for page + data load

        # Force light mode
        driver.execute_script("document.body.classList.add('light-mode'); document.body.classList.remove('dark-mode');")
        time.sleep(0.5)

        for scroll_y, name in SECTIONS:
            driver.execute_script(f"window.scrollTo(0, {scroll_y});")
            time.sleep(0.3)
            path = f"{SCREENSHOT_DIR}/{name}.png"
            driver.save_screenshot(path)
            print(f"Saved: {path}")

        # Also take a full-page screenshot
        total_height = driver.execute_script("return document.documentElement.scrollHeight")
        driver.set_window_size(1280, total_height)
        driver.execute_script("document.body.classList.add('light-mode'); document.body.classList.remove('dark-mode');")
        time.sleep(1)
        driver.save_screenshot(f"{SCREENSHOT_DIR}/full_page.png")
        print(f"Saved: {SCREENSHOT_DIR}/full_page.png (full page, {total_height}px)")

    finally:
        driver.quit()


if __name__ == "__main__":
    main()
