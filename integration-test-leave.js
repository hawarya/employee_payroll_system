const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function createDriver() {
    let options = new chrome.Options();
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--window-size=1920,1080');
    // options.addArguments('--headless'); // Use headless if needed

    return await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
}

async function login(driver, username, password) {
    console.log(`--- Logging in as ${username} ---`);
    await driver.get('http://localhost:5173/login');
    
    let usernameField = await driver.wait(
        until.elementLocated(By.css("input[placeholder='e.g. EMP001 or admin1']")), 
        10000
    );
    let passwordField = await driver.findElement(By.css("input[placeholder='••••••••']"));
    let signInButton = await driver.findElement(By.xpath("//button[text()='Sign In']"));

    await usernameField.clear();
    await usernameField.sendKeys(username);
    await passwordField.clear();
    await passwordField.sendKeys(password);
    await signInButton.click();
    
    await driver.wait(until.urlContains(':5173'), 10000);
    console.log(`✅ Logged in as ${username}`);
}

async function logout(driver) {
    console.log("--- Logging out ---");
    let signOutButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Sign Out')]")),
        10000
    );
    await driver.wait(until.elementIsVisible(signOutButton), 5000);
    await signOutButton.click();
    await driver.wait(until.urlContains('/login'), 10000);
    console.log("✅ Successfully logged out");
}

async function runIntegrationTest() {
    let driver = await createDriver();
    const employeeUser = 'EMP_001';
    const adminUser = 'admin_test1';
    const password = 'password';

    try {
        // STEP 1: Employee applies for leave
        await login(driver, employeeUser, password);
        
        console.log("Navigating to Leave page...");
        let leaveLink = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Leave')]")), 10000);
        await leaveLink.click();

        await driver.sleep(2000); // Wait for Leave page to load fully

        console.log("Applying for leave...");
        let applyButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Apply Leave')]")), 10000);
        await driver.wait(until.elementIsVisible(applyButton), 5000);
        await applyButton.click();

        await driver.sleep(1000); // Wait for the form to expand

        let leaveTypeSelect = await driver.wait(until.elementLocated(By.css("select")), 5000);
        await leaveTypeSelect.sendKeys("CASUAL");

        let today = new Date();
        let startDateStr = today.toISOString().split('T')[0];
        let endDate = new Date();
        endDate.setDate(today.getDate() + 2);
        let endDateStr = endDate.toISOString().split('T')[0];

        let dateInputs = await driver.findElements(By.css("input[type='date']"));

        // Use javascript to safely set the value and trigger React's change tracking
        await driver.executeScript(`
            let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(arguments[0], arguments[1]);
            let event = new Event('input', { bubbles: true});
            arguments[0].dispatchEvent(event);
        `, dateInputs[0], startDateStr);

        await driver.executeScript(`
            let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(arguments[0], arguments[1]);
            let event = new Event('input', { bubbles: true});
            arguments[0].dispatchEvent(event);
        `, dateInputs[1], endDateStr);

        let reasonField = await driver.findElement(By.css("textarea"));
        await reasonField.sendKeys("Integration Testing - Annual Leave Request");

        let submitButton = await driver.findElement(By.xpath("//button[text()='Submit Application']"));
        await submitButton.click();

        let successMsg = await driver.wait(
            until.elementLocated(By.css("div.bg-emerald-50.text-emerald-700")),
            10000
        );
        console.log(`✅ Leave application submitted: ${await successMsg.getText()}`);
        
        await driver.sleep(2000); // Wait for form to close
        await logout(driver);

        // STEP 2: Admin approves leave
        await login(driver, adminUser, password);

        console.log("Navigating to Leave Management page...");
        leaveLink = await driver.wait(until.elementLocated(By.xpath("//span[text()='Leave']")), 10000);
        await leaveLink.click();

        console.log("Approving the leave request...");
        // Wait for the table to load and find the "Approve" button
        let approveButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Approve')]")),
            10000
        );
        
        // Ensure it's the right one (could be multiple, we take the first pending)
        await approveButton.click();
        console.log("✅ Clicked Approve button");

        // Verify status change in the table
        await driver.sleep(2000); // Wait for update
        let approvedStatus = await driver.wait(
            until.elementLocated(By.xpath("//span[text()='APPROVED']")),
            10000
        );
        console.log("✅ Leave status verified as APPROVED");

        await logout(driver);
        console.log("\n--- INTEGRATION TEST COMPLETED SUCCESSFULLY ---");

    } catch (error) {
        console.error("\n❌ Integration Test Failed:", error);
        fs.writeFileSync('failure_reason.txt', error.stack || error.toString());
        let image = await driver.takeScreenshot();
        fs.writeFileSync('integration_test_failure.png', image, 'base64');
        console.log("Screenshot saved as integration_test_failure.png");
    } finally {
        await driver.quit();
    }
}

runIntegrationTest();
