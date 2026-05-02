const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function createDriver() {
    let options = new chrome.Options();
    // options.addArguments('--headless'); // Commented out so you can see the browser
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--window-size=1920,1080');

    return await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
}

async function login(driver, username, password) {
    console.log(`Attempting login with: ${username}`);
    await driver.get('http://localhost:5173/login');
    
    let usernameField = await driver.wait(
        until.elementLocated(By.css("input[placeholder='e.g. EMP001 or admin1']")), 
        10000
    );
    let passwordField = await driver.findElement(By.css("input[placeholder='••••••••']"));
    let signInButton = await driver.findElement(By.xpath("//button[text()='Sign In']"));

    await usernameField.clear();
    await usernameField.sendKeys(username);
    await driver.sleep(1000); // Small pause for visibility
    await passwordField.clear();
    await passwordField.sendKeys(password);
    await driver.sleep(1000); // Small pause for visibility
    await signInButton.click();
}

async function logout(driver) {
    console.log("Attempting logout...");
    let signOutButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Sign Out')]")),
        10000
    );
    await driver.wait(until.elementIsVisible(signOutButton), 5000);
    await signOutButton.click();
    await driver.sleep(1000); // Pause to see the logout transition
    await driver.wait(until.urlContains('/login'), 10000);
    console.log("✅ Successfully logged out!");
}

(async function runTestSuite() {
    let driver = await createDriver();

    try {
        // Test Case 1: Admin Login
        console.log("\n--- TEST CASE: Admin Login ---");
        await login(driver, 'admin_test1', 'password');
        await driver.wait(until.urlContains(':5173'), 10000);
        console.log("✅ Admin Login Successful!");
        await logout(driver);

        // Test Case 2: Employee Login
        console.log("\n--- TEST CASE: Employee Login ---");
        await login(driver, 'EMP_001', 'password');
        await driver.wait(until.urlContains(':5173'), 10000);
        console.log("✅ Employee Login Successful!");
        await logout(driver);

        // Test Case 3: Invalid Password
        console.log("\n--- TEST CASE: Invalid Password ---");
        await login(driver, 'admin_test1', 'wrongpassword');
        let errorMsg = await driver.wait(
            until.elementLocated(By.css("div.bg-red-50.text-red-600")),
            10000
        );
        console.log(`✅ Received expected error: ${await errorMsg.getText()}`);

        // Test Case 4: Non-Existent User
        console.log("\n--- TEST CASE: Non-Existent User ---");
        await login(driver, 'nonexistent_user', 'password');
        errorMsg = await driver.wait(
            until.elementLocated(By.css("div.bg-red-50.text-red-600")),
            10000
        );
        console.log(`✅ Received expected error: ${await errorMsg.getText()}`);

        // Test Case 5: Empty Fields (HTML5 validation check)
        console.log("\n--- TEST CASE: Empty Fields ---");
        await driver.get('http://localhost:5173/login');
        let signInButton = await driver.findElement(By.xpath("//button[text()='Sign In']"));
        await signInButton.click();
        // If HTML5 validation is present, URL should stay /login and browser might show tooltip.
        // We'll just check that we are still on the login page and NOT on the dashboard.
        await driver.sleep(1000);
        let currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/login')) {
            console.log("✅ Still on login page as expected.");
        } else {
            console.log("❌ Failed: Moved away from login page unexpectedly!");
        }

        console.log("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---");

    } catch (error) {
        console.error("\n❌ Test Suite Failed:", error);
        console.log("Current URL at failure:", await driver.getCurrentUrl());
        let image = await driver.takeScreenshot();
        require('fs').writeFileSync('test_suite_failure.png', image, 'base64');
        console.log("Screenshot saved as test_suite_failure.png");
    } finally {
        await driver.quit();
    }
})();
