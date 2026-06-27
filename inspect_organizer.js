import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const layout = await page.evaluate(() => {
        const wrapper = document.querySelector('.organizer-wrapper');
        const bio = document.querySelector('.organizer-bio');
        const stats = document.querySelector('.organizer-stats');
        
        return {
            wrapper: wrapper ? wrapper.getBoundingClientRect().toJSON() : null,
            bio: bio ? bio.getBoundingClientRect().toJSON() : null,
            stats: stats ? stats.getBoundingClientRect().toJSON() : null,
            viewportWidth: window.innerWidth
        };
    });

    console.log(JSON.stringify(layout, null, 2));
    
    // Take a screenshot to see what Puppeteer sees
    await page.screenshot({ path: 'organizer_mobile.png', fullPage: true });

    await browser.close();
})();
