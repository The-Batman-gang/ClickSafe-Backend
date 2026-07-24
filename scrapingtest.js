const {
    scrapeAndExtract
} = require("./src/scraper/playwright/playwrightOrchestrator");

async function test() {

    try {

        const website = await scrapeAndExtract(
            "https://playwright.dev/"
        );

        console.log("\n===== WEBSITE OBJECT =====\n");

        console.dir(website, {
            depth: null,
            colors: true
        });

    } catch (error) {

        console.error(error);

    }

}

test();