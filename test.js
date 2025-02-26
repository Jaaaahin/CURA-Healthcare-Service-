const { Builder, Browser, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { Select } = require('selenium-webdriver');
const moment = require('moment');

// Configuration - Dynamically change values
const config = {
  baseUrl: "https://katalon-demo-cura.herokuapp.com/",
  username: "John Doe",
  password: "ThisIsNotAPassword",
  facility: "Hongkong CURA Healthcare Center",
  visitDate: "28/02/2025",  // Date format: DD/MM/YYYY
  comment: "CUDA Healthcare Automation Test",
  pages: [
    {
      url: "https://katalon-demo-cura.herokuapp.com/",
      actions: [
        { type: 'click', locator: By.id("btn-make-appointment") },
      ]
    },
    {
      url: "https://katalon-demo-cura.herokuapp.com/appointment",
      actions: [
        { type: 'type', locator: By.id("txt-username"), value: "John Doe" },
        { type: 'type', locator: By.id("txt-password"), value: "ThisIsNotAPassword" },
        { type: 'click', locator: By.id("btn-login") },
      ]
    },
    {
      url: "https://katalon-demo-cura.herokuapp.com/appointment",
      actions: [
        { type: 'select', locator: By.id("combo_facility"), value: "Hongkong CURA Healthcare Center" },
        { type: 'click', locator: By.id("chk_hospotal_readmission") },
        { type: 'click', locator: By.id("radio_program_medicaid") },
        { type: 'type', locator: By.id("txt_visit_date"), value: "28/02/2025" },
        { type: 'type', locator: By.id("txt_comment"), value: "CUDA Healthcare Automation Test" },
        { type: 'click', locator: By.id("btn-book-appointment") },
      ]
    }
  ]
};

(async function cudaHealthcareTest() {
  // Validate the visit date format and check if it's a valid future date
  if (!isValidDateFormat(config.visitDate)) {
    console.error("❌ Invalid date format. Please use DD/MM/YYYY format.");
    return;
  }

  if (!isValidFutureDate(config.visitDate)) {
    console.error("❌ The selected date is in the past. Please choose a future date.");
    return;
  }

  // Configure Chrome options (Uncomment headless mode if needed)
  let options = new chrome.Options()
    // .addArguments("--headless=new")  // Uncomment for headless mode
    .addArguments("--disable-gpu")
    .addArguments("--no-sandbox");

  let driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  try {
    for (let page of config.pages) {
      // Navigate to the page
      console.log(`Navigating to ${page.url}...`);
      await navigateToPage(driver, page.url, page.actions);
    }

    console.log("✅ Test Completed Successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    console.log("Closing the browser...");
    await driver.quit();
  }
})();

// Dynamic Navigation Function
async function navigateToPage(driver, url, actions) {
  // Navigate to the page URL
  await driver.get(url);

  for (let action of actions) {
    switch (action.type) {
      case 'click':
        await waitAndClick(driver, action.locator);
        break;
      case 'type':
        await waitAndType(driver, action.locator, action.value);
        break;
      case 'select':
        await selectFromDropdown(driver, action.locator, action.value);
        break;
      default:
        console.error(`❌ Unknown action type: ${action.type}`);
    }
    await driver.sleep(2000); // Sleep for 2 seconds after each action to allow page changes
  }
}

// Utility Functions (Reusable for Dynamic Actions)
async function waitAndClick(driver, locator, timeout = 20000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await element.click();
}

async function waitAndType(driver, locator, text, timeout = 20000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await element.clear(); // Clear input before typing
  await element.sendKeys(text);
}

async function waitAndGetText(driver, locator, timeout = 20000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  return await element.getText();
}

// Utility function to handle selecting from a dropdown
async function selectFromDropdown(driver, locator, value, timeout = 20000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  const dropdown = new Select(element);
  await dropdown.selectByVisibleText(value);
}

// Validate date format (DD/MM/YYYY)
function isValidDateFormat(date) {
  const dateFormat = "DD/MM/YYYY";
  // Use strict parsing for DD/MM/YYYY format
  return moment(date, dateFormat, true).isValid();
}

// Validate that the selected date is not in the past
function isValidFutureDate(date) {
  const today = moment();
  const visitDate = moment(date, "DD/MM/YYYY");
  return visitDate.isAfter(today, 'day'); // Ensure the date is a future date
}
