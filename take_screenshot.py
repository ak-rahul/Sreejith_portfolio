import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:8080/index.html')
        
        # Wait for the college section
        college_section = page.locator('#college')
        await college_section.wait_for()
        
        # Scroll to the section
        await college_section.scroll_into_view_if_needed()
        
        # Wait a moment for rendering
        await page.wait_for_timeout(1000)
        
        # Take a screenshot of the specific section
        await college_section.screenshot(path='college_works_screenshot.png')
        
        print("Screenshot saved to college_works_screenshot.png")
        await browser.close()

asyncio.run(run())
