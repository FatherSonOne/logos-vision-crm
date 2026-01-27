const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DEVICE_CONFIGS = {
  desktop: [
    { name: 'large-desktop', width: 1920, height: 1080, deviceScaleFactor: 1 },
    { name: 'medium-desktop', width: 1366, height: 768, deviceScaleFactor: 1 },
    { name: 'small-desktop', width: 1280, height: 720, deviceScaleFactor: 1 }
  ],
  tablet: [
    { name: 'ipad-pro-portrait', width: 1024, height: 1368, deviceScaleFactor: 2, isMobile: true },
    { name: 'ipad-pro-landscape', width: 1368, height: 1024, deviceScaleFactor: 2, isMobile: true },
    { name: 'ipad-portrait', width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true },
    { name: 'ipad-landscape', width: 1024, height: 768, deviceScaleFactor: 2, isMobile: true }
  ],
  mobile: [
    { name: 'iphone-14-pro-max', width: 430, height: 932, deviceScaleFactor: 3, isMobile: true },
    { name: 'iphone-14', width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
    { name: 'iphone-se', width: 375, height: 667, deviceScaleFactor: 2, isMobile: true },
    { name: 'small-android', width: 360, height: 640, deviceScaleFactor: 2, isMobile: true }
  ]
};

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const results = {
    timestamp: new Date().toISOString(),
    devices: [],
    issues: []
  };

  try {
    for (const [category, devices] of Object.entries(DEVICE_CONFIGS)) {
      console.log(`\nTesting ${category} devices...`);

      for (const device of devices) {
        console.log(`  Testing ${device.name} (${device.width}x${device.height})...`);

        const page = await browser.newPage();

        await page.setViewport({
          width: device.width,
          height: device.height,
          deviceScaleFactor: device.deviceScaleFactor || 1,
          isMobile: device.isMobile || false,
          hasTouch: device.isMobile || false
        });

        const deviceResults = {
          name: device.name,
          category: category,
          viewport: `${device.width}x${device.height}`,
          screenshots: [],
          metrics: {}
        };

        try {
          // Navigate to Contacts page
          await page.goto('http://localhost:5173/#/contacts', {
            waitUntil: 'networkidle0',
            timeout: 30000
          });

          // Wait for main content
          await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Capture main view
          const mainScreenshot = `public/qa-evidence/day10/${category}/${device.name}-main.png`;
          await page.screenshot({ path: mainScreenshot, fullPage: false });
          deviceResults.screenshots.push('main');
          console.log(`    - Captured main view`);

          // Check for horizontal scroll
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });

          if (hasHorizontalScroll) {
            results.issues.push({
              device: device.name,
              category: category,
              severity: 'HIGH',
              issue: 'Horizontal scrolling detected',
              component: 'Overall layout'
            });
          }

          // Capture full page scroll
          const fullScreenshot = `public/qa-evidence/day10/${category}/${device.name}-fullpage.png`;
          await page.screenshot({ path: fullScreenshot, fullPage: true });
          deviceResults.screenshots.push('fullpage');

          // Test contact card visibility
          const contactCards = await page.$$('.contact-card');
          if (contactCards.length > 0) {
            const cardScreenshot = `public/qa-evidence/day10/${category}/${device.name}-cards.png`;
            await contactCards[0].screenshot({ path: cardScreenshot });
            deviceResults.screenshots.push('cards');
            console.log(`    - Captured ${contactCards.length} contact cards`);
          }

          // Test tab navigation
          const tabs = await page.$$('[role="tab"], .tab-button, button[class*="tab"]');
          if (tabs.length > 0) {
            const tabScreenshot = `public/qa-evidence/day10/${category}/${device.name}-tabs.png`;
            const boundingBox = await tabs[0].boundingBox();
            if (boundingBox) {
              await page.screenshot({ path: tabScreenshot, clip: boundingBox });
              deviceResults.screenshots.push('tabs');
            }
          }

          // Get layout metrics
          deviceResults.metrics = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;

            return {
              bodyWidth: body.scrollWidth,
              bodyHeight: body.scrollHeight,
              viewportWidth: html.clientWidth,
              viewportHeight: html.clientHeight,
              hasHorizontalScroll: body.scrollWidth > html.clientWidth,
              hasVerticalScroll: body.scrollHeight > html.clientHeight
            };
          });

          console.log(`    - Completed ${device.name} - ${deviceResults.screenshots.length} screenshots`);
        } catch (error) {
          console.error(`    - Error testing ${device.name}:`, error.message);
          results.issues.push({
            device: device.name,
            category: category,
            severity: 'CRITICAL',
            issue: `Failed to load: ${error.message}`,
            component: 'Page load'
          });
        }

        results.devices.push(deviceResults);
        await page.close();
      }
    }

    // Save results
    fs.writeFileSync(
      'public/qa-evidence/day10/test-results.json',
      JSON.stringify(results, null, 2)
    );

    console.log('\nTesting complete!');
    console.log(`Tested ${results.devices.length} device configurations`);
    console.log(`Found ${results.issues.length} potential issues`);
    console.log(`Results saved to: public/qa-evidence/day10/test-results.json`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
