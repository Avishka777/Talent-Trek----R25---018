import pandas as pd
import time
import random
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from datetime import timedelta
import tempfile
import os
import subprocess

# from selenium_stealth import stealth  # Comment out if not available

# ============ Logger Setup ============
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("naukri_scraper.log"),
        logging.StreamHandler()
    ]
)


# ============ Browser Setup ============
def create_browser(headless=True):  # Default to headless for EC2
    options = Options()

    # Essential arguments for EC2/headless environments
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-features=VizDisplayCompositor")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--proxy-server='direct://'")
    options.add_argument("--proxy-bypass-list=*")
    options.add_argument("--start-maximized")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-features=TranslateUI")
    options.add_argument("--disable-ipc-flooding-protection")

    # User agent
    options.add_argument(
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    # Memory and performance optimizations
    options.add_argument("--memory-pressure-off")
    options.add_argument("--max_old_space_size=4096")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-sync")

    # Try to find ChromeDriver automatically or use explicit path
    service = None
    try:
        # Try to use ChromeDriver in PATH
        service = Service()
        logging.info("Using ChromeDriver from PATH")
    except Exception as e:
        # Try common locations
        chromedriver_paths = [
            "/usr/local/bin/chromedriver",
            "/usr/bin/chromedriver",
            "/opt/chromedriver",
            "./chromedriver"
        ]

        for path in chromedriver_paths:
            if os.path.exists(path):
                service = Service(path)
                logging.info(f"Found ChromeDriver at: {path}")
                break

        if not service:
            logging.error("ChromeDriver not found. Please install ChromeDriver.")
            raise Exception("ChromeDriver not found")

    try:
        driver = webdriver.Chrome(service=service, options=options)
        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        return driver
    except Exception as e:
        logging.error(f"Failed to create Chrome driver: {e}")
        raise


def check_dependencies():
    """Check if Chrome and ChromeDriver are installed"""
    try:
        # Check Chrome
        chrome_result = subprocess.run(['google-chrome', '--version'],
                                       capture_output=True, text=True)
        if chrome_result.returncode == 0:
            logging.info(f"Chrome version: {chrome_result.stdout.strip()}")
        else:
            logging.warning("Chrome not found or not working")

        # Check ChromeDriver
        chromedriver_result = subprocess.run(['chromedriver', '--version'],
                                             capture_output=True, text=True)
        if chromedriver_result.returncode == 0:
            logging.info(f"ChromeDriver version: {chromedriver_result.stdout.strip()}")
        else:
            logging.warning("ChromeDriver not found or not working")

    except Exception as e:
        logging.error(f"Error checking dependencies: {e}")


# ============ Utility Functions ============
def random_sleep(a=6, b=8):
    """Sleep for a random duration between a and b seconds."""
    sleep_time = random.uniform(a, b)
    logging.debug(f"Sleeping for {sleep_time:.2f} seconds.")
    time.sleep(sleep_time)


def safe_text(tag, default="N/A"):
    """Return text of a BeautifulSoup tag or default."""
    return tag.text.strip() if tag else default


def safe_attr(tag, attr, default="N/A"):
    """Return attribute value of a tag or default."""
    return tag.get(attr, default) if tag else default


# ============ Main Parsing Logic ============
def parse_job_listings(page_jobs):
    """Extracts job data from a list of job containers."""
    job_data_list = []
    for job in page_jobs:
        try:
            soup = BeautifulSoup(str(job), 'html.parser')
            row1, row2, row3, row5, row6 = (
                soup.find('div', class_=f"row{i}") for i in [1, 2, 3, 5, 6]
            )

            job_title = safe_text(row1.a) if row1 and row1.a else "N/A"
            job_url = safe_attr(row1.a, 'href') if row1 and row1.a else "N/A"
            company_name = safe_text(row2.find('a', class_='comp-name')) if row2 else "N/A"

            rating_tag = row2.find('a', class_='rating') if row2 else None
            rating = safe_text(rating_tag.find('span', class_='main-2')) if rating_tag else "N/A"

            experience = salary = location = "N/A"
            if row3:
                exp_tag = row3.select_one("span.expwdth")
                experience = safe_attr(exp_tag, "title", safe_text(exp_tag)) if exp_tag else "N/A"

                sal_tag = row3.select_one("span.sal > span")
                salary = safe_attr(sal_tag, "title", safe_text(sal_tag)) if sal_tag else "N/A"

                loc_tag = row3.select_one("span.locWdth")
                location = safe_attr(loc_tag, "title", safe_text(loc_tag)) if loc_tag else "N/A"

            tech_stack = [li.text.strip() for li in row5.ul.find_all('li')] if row5 and row5.ul else []

            post_date = safe_text(row6.find('span', class_='job-post-day')) if row6 else "N/A"

            # Normalize relative dates like "Just now", "Today", "1 day ago"
            if post_date.lower() in ["just now", "few hours ago", "today"]:
                post_date = datetime.today().strftime("%Y-%m-%d")
            elif "day ago" in post_date.lower() or "days ago" in post_date.lower():
                try:
                    days_ago = int(post_date.strip().split()[0])
                    calculated_date = datetime.today() - timedelta(days=days_ago)
                    post_date = calculated_date.strftime("%Y-%m-%d")
                except Exception as e:
                    logging.warning(f"Could not parse days ago from '{post_date}': {e}")
                    post_date = datetime.today().strftime("%Y-%m-%d")  # fallback to today

            job_data_list.append({
                "Job Title": job_title,
                "Job URL": job_url,
                "Company Name": company_name,
                "Rating": rating,
                "Experience": experience,
                "Salary": salary,
                "Location": location,
                "Tech Stack": ', '.join(tech_stack),
                "Posted Date": post_date
            })
        except Exception as e:
            logging.error(f"Error parsing job listing: {e}")
            continue  # Skip this job and continue with others
    return pd.DataFrame(job_data_list)


# ============ Scraper Logic ============
def scrape_listing_pages(driver, base_url, max_pages=5):
    """Scrape job listings from pagination."""
    all_jobs_df = pd.DataFrame()

    try:
        driver.get(base_url)
        logging.info(f"Successfully loaded: {base_url}")

        # Save debug screenshot
        try:
            driver.save_screenshot(f"ec2_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
            logging.info("Debug screenshot saved")
        except Exception as e:
            logging.warning(f"Could not save screenshot: {e}")

    except Exception as e:
        logging.error(f"Failed to load base URL: {e}")
        return all_jobs_df

    wait = WebDriverWait(driver, 20)
    page = 1

    while page <= max_pages:
        logging.info(f"Scraping listing page {page}...")
        random_sleep(6, 7)

        # Sort by Date (only on first page)
        if page == 1:
            try:
                dropdown_btn = WebDriverWait(driver, 20).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, 'button#filter-sort'))
                )
                dropdown_btn.click()
                random_sleep(2, 3)
                date_option = wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//ul[@data-filter-id='sort']//li[@title='Date']")))
                date_option.click()
                random_sleep(2, 4)
            except Exception as e:
                logging.warning(f"Sort dropdown error: {e}")

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        jobs_on_page = soup.find_all("div", class_="srp-jobtuple-wrapper")
        logging.info(f"Found {len(jobs_on_page)} job listings on page {page}")

        if len(jobs_on_page) == 0:
            logging.warning("No job listings found on this page")
            # Save debug info
            with open(f"debug_page_{page}_source.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            break

        page_df = parse_job_listings(jobs_on_page)
        all_jobs_df = pd.concat([all_jobs_df, page_df], ignore_index=True)

        try:
            next_button = wait.until(EC.presence_of_element_located((By.XPATH, "//a[span[text()='Next']]")))
            if "disabled" in next_button.get_attribute("class"):
                logging.info("Next button disabled. Ending pagination.")
                break
            else:
                driver.execute_script("arguments[0].click();", next_button)
                page += 1
        except Exception as e:
            logging.info(f"No further pages found: {e}")
            break

    return all_jobs_df


def scrape_job_details(driver, df):
    """Scrape detailed job info from individual job pages."""
    additional_columns = [
        'Company Location', 'Openings', 'Applicants', 'Job Description',
        'Role', 'Industry Type', 'Department', 'Employment Type', 'Role Category'
    ]
    for col in additional_columns:
        if col not in df.columns:
            df[col] = "N/A"

    wait = WebDriverWait(driver, 15)
    processed_urls = set()

    for index, row in df.iterrows():
        url = row['Job URL']
        if url in processed_urls or url == "N/A":
            continue

        processed_urls.add(url)
        logging.info(f"Scraping details for: {url}")

        try:
            driver.quit()
            driver = create_browser(headless=True)
            driver.get(url)
            random_sleep(8, 9)
            soup = BeautifulSoup(driver.page_source, "html.parser")

            # Initialize defaults
            company_location = openings = applicants = job_description = "N/A"
            role = industry_type = department = employment_type = role_category = "N/A"

            # ==== Extract Company Location ====
            heading_soup = soup.find("div", class_="styles_jhc__top__BUxpc")
            if heading_soup:
                loc_div = heading_soup.find("div", class_="styles_jhc__loc___Du2H")
                if loc_div and loc_div.a:
                    company_location = loc_div.a.text.strip()

            # ==== Extract Openings & Applicants ====
            header_bottom = soup.find("div", class_="styles_jhc__bottom__DrTmB")
            if header_bottom:
                info_part = header_bottom.find("div", class_="styles_jhc__jd-stats__KrId0")
                if info_part:
                    stats = info_part.find_all("span", class_="styles_jhc__stat__PgY67")
                    for stat in stats:
                        label = safe_text(stat.find("label"))
                        value = safe_text(stat.find_all("span")[-1])
                        if "Openings" in label:
                            openings = value
                        elif "Applicants" in label:
                            applicants = value

            # ==== Extract Job Description ====
            job_desc_container = soup.find("section", class_="styles_job-desc-container__txpYf")
            if job_desc_container:
                jd_div = job_desc_container.find("div", class_="styles_JDC__dang-inner-html__h0K4t")
                if jd_div:
                    job_description = jd_div.text.strip()

                other_details = job_desc_container.find("div", class_="styles_other-details__oEN4O")
                if other_details:
                    detail_blocks = other_details.find_all("div", class_="styles_details__Y424J")
                    for block in detail_blocks:
                        label_tag = block.find("label")
                        value_tag = block.find("span")
                        if label_tag and value_tag:
                            key = label_tag.text.strip().replace(":", "")
                            value = ' '.join(value_tag.stripped_strings)
                            if key == "Role":
                                role = value
                            elif key == "Industry Type":
                                industry_type = value
                            elif key == "Department":
                                department = value
                            elif key == "Employment Type":
                                employment_type = value
                            elif key == "Role Category":
                                role_category = value

            # ==== Update DataFrame ====
            df.loc[df['Job URL'] == url, 'Company Location'] = company_location
            df.loc[df['Job URL'] == url, 'Openings'] = openings
            df.loc[df['Job URL'] == url, 'Applicants'] = applicants
            df.loc[df['Job URL'] == url, 'Job Description'] = job_description
            df.loc[df['Job URL'] == url, 'Role'] = role
            df.loc[df['Job URL'] == url, 'Industry Type'] = industry_type
            df.loc[df['Job URL'] == url, 'Department'] = department
            df.loc[df['Job URL'] == url, 'Employment Type'] = employment_type
            df.loc[df['Job URL'] == url, 'Role Category'] = role_category

            logging.info(f"Details scraped successfully for: {url}")

        except Exception as e:
            logging.error(f"Error scraping {url}: {e}")
            continue  # Skip to the next job page on error

    return df


# ============ Main ============
def main():
    logging.info("Starting Naukri scraper... v1")

    # Check dependencies first
    check_dependencies()

    driver = None
    try:
        driver = create_browser(headless=True)
        base_url = "https://www.naukri.com/remote-jobs?src=discovery_trendingWdgt_homepage_srch"

        listings_df = scrape_listing_pages(driver, base_url, max_pages=3)

        if listings_df.empty:
            logging.warning("No job listings found. Check if the website structure has changed.")
            return

        logging.info(f"Found {len(listings_df)} job listings")

        full_df = scrape_job_details(driver, listings_df)

        # Save results
        output_file = "all_jobs_df.csv"
        full_df.to_csv(output_file, index=False)
        logging.info(f"Data saved to {output_file}")

        # Print summary
        logging.info(f"Successfully scraped {len(full_df)} jobs")

    except Exception as e:
        logging.error(f"Main execution error: {e}")
        import traceback
        logging.error(traceback.format_exc())
    finally:
        if driver:
            driver.quit()
            logging.info("Browser session ended.")


if __name__ == "__main__":
    main()