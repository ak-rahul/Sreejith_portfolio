const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        await page.goto('http://localhost:8080/index.html');

        // Wait for the college section to be visible
        await page.waitForSelector('#college');

        // Scroll to the college section
        await page.evaluate(() => {
            const element = document.getElementById('college');
            element.scrollIntoView();
        });

        // Wait a moment for any lazy loading/animations
        await new Promise(resolve => setTimeout(resolve, 1000));

        const savePath = path.join(process.cwd(), 'Uploads', 'college_works_screenshot.png');
        await page.screenshot({ path: savePath, fullPage: false });

        console.log(`Screenshot saved to ${savePath}`);
        await browser.close();
    } catch (error) {
        console.error('Error taking screenshot:', error);
        process.exit(1);
    }
})();
