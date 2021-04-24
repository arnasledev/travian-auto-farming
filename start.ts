import "dotenv/config";
import * as puppeteer from "puppeteer";

import {
  AUTH_NAME,
  AUTH_PASSWORD,
  PAGES,
  SELECTORS,
  MATCHING_PATTERNS,
  ACCEPTED_RAID_RESULTS,
} from "./config";

const start = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 720 });

  await page.goto(PAGES.login);

  await page.type(SELECTORS.auth.inputs.name, AUTH_NAME);
  await page.type(SELECTORS.auth.inputs.password, AUTH_PASSWORD);

  await Promise.all([
    page.click(SELECTORS.auth.button),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  await Promise.all([
    await page.waitForSelector(SELECTORS.popup.parent),
    await page.click(SELECTORS.popup.button),
  ]);

  await page.goto(PAGES.farmList);

  const farmsList = await page.$$(SELECTORS.rallyPoint.raidList);

  await Promise.all(
    farmsList.map(async (farmList, key) => {
      const farmMatchesPattern = await page.evaluate(
        (element) => element.textContent.includes("running.farms"),
        farmList
      );

      if (farmMatchesPattern) {
        const button = await farmList.$(MATCHING_PATTERNS.expandButton);

        if (button) {
          await button.click();
        }

        const elementID = await page.evaluate(
          (el) => el.getAttribute("id"),
          farmList
        );

        await page.waitForSelector(`#${elementID} tbody`);
        const farmsToBeRaided = page.evaluate(
          ({ elementID, ACCEPTED_RAID_RESULTS }) => {
            let table = document.querySelector(`#${elementID} table tbody`);
            let tableRows = Array.from(table.children);

            return tableRows.map((row) => {
              const title = row.querySelector("td.target a").textContent.trim();
              const imagesSources = Array.from(
                row.querySelectorAll("td.lastRaid div img")
              ).map((image) => image.getAttribute("class"));

              let wasLastRaidSuccessfull = true;
              if (imagesSources.length) {
                const lastRaidImagesClassName = imagesSources[0].split(" ")[1];
                wasLastRaidSuccessfull = ACCEPTED_RAID_RESULTS.includes(
                  lastRaidImagesClassName
                );
              }

              if (wasLastRaidSuccessfull) {
                // reik pazymeti checkboxa
                return { title };
              }
            });
          },
          { elementID, ACCEPTED_RAID_RESULTS }
        );

        await farmsToBeRaided.then((result) => {
          console.log(result);
        });
      }
    })
  );
};

start();

// await page.evaluate(() => {
//     // find the tr with Jones
//     let tr = [...document.querySelectorAll('tr')].find(tr => tr.innerText.match(/Jones/))
//     if(tr){
//       // find the checkbox and click it
//       let cb = tr.querySelector('input[type="checkbox"]')
//       if(cb) {
//         cb.click()
//       }
//     }
//   })
