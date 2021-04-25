import 'dotenv/config';
import * as puppeteer from 'puppeteer';

import { AUTH_NAME, AUTH_PASSWORD, PAGES, SELECTORS, MATCHING_PATTERNS, ACCEPTED_RAID_RESULTS } from './config';

const TIMERS = {
  farms: [
    {
      name: 'running.farms 01',
      lastRaid: null,
      timeoutBetweenRaids: 60000 * 20, // 20 minutes
      timeRange: {
        from: 60000 * 20, // 20 minutes
        to: 60000 * 23,
      },
    },
    // {
    //   name: 'test.farms 01',
    //   lastRaid: null,
    //   timeoutBetweenRaids: 60000,
    //   timeRange: {
    //     from: 10000,
    //     to: 15000,
    //   },
    // },
  ],
};

const acceptCookies = async (page) => {
  if ((await page.$(SELECTORS.popup.parent)) !== null && (await page.$(SELECTORS.popup.button)) !== null) {
    await page.waitForSelector(SELECTORS.popup.parent, { timeout: 1000 });
    await page.click(SELECTORS.popup.button);
  }
};

const login = async (page) => {
  await page.goto(PAGES.login);
  await page.waitForTimeout(1000);
  await acceptCookies(page);

  await page.waitForSelector(SELECTORS.auth.inputs.name);
  await page.type(SELECTORS.auth.inputs.name, AUTH_NAME);
  await page.type(SELECTORS.auth.inputs.password, AUTH_PASSWORD);

  return Promise.all([page.click(SELECTORS.auth.button), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
};

const expandFarmList = async (farmList) => {
  const button = await farmList.$(MATCHING_PATTERNS.expandButton);
  if (button) {
    await button.click();
  }

  return true;
};

const checkFarmsForRaiding = async (page, elementID) =>
  page.evaluate(
    ({ elementID, ACCEPTED_RAID_RESULTS }) => {
      let table = document.querySelector(`#${elementID} table tbody`);
      let tableRows = Array.from(table.children);

      return tableRows.map((row) => {
        const title = row.querySelector('td.target a').textContent.trim();
        const imagesSources = Array.from(row.querySelectorAll('td.lastRaid div img')).map((image) =>
          image.getAttribute('class')
        );

        let wasLastRaidSuccessfull = true;
        if (imagesSources.length) {
          const lastRaidImagesClassName = imagesSources[0].split(' ')[1];
          wasLastRaidSuccessfull = ACCEPTED_RAID_RESULTS.includes(lastRaidImagesClassName);
        }

        if (wasLastRaidSuccessfull) {
          // there should be a logic to check a checkbox
          return { title };
        }

        return null;
      });
    },
    { elementID, ACCEPTED_RAID_RESULTS }
  );

const shouldFarmBeRaided = (farm) => {
  const timeNow = Date.now();

  if (!farm.lastRaid) {
    return true;
  }

  if (timeNow > parseInt(farm.lastRaid) + parseInt(farm.timeoutBetweenRaids)) {
    return true;
  }

  return false;
};

const updateFarmsList = async (farm) => {
  const farmIndex = TIMERS.farms.findIndex((element) => element.name === farm.name);
  TIMERS.farms[farmIndex].lastRaid = Date.now();
};

const loopFarmingList = (page, farmsList) =>
  farmsList.map(async (farmList, key) => {
    const farmName = await page.evaluate((element) => element.textContent.trim().substr(0, 20), farmList);
    const [farmTitle, farmNumber] = farmName.split(' ');
    const validFarmName = `${farmTitle} ${farmNumber}`;
    const farmFoundOnTheList = TIMERS.farms.find((farm) => farm.name === validFarmName);

    if (farmFoundOnTheList && shouldFarmBeRaided(farmFoundOnTheList)) {
      await expandFarmList(farmList);
      await page.waitForTimeout(1000);
      const elementID = await page.evaluate((el) => el.getAttribute('id'), farmList);

      await page.waitForSelector(`#${elementID} tbody`);
      const farmsToBeRaided = checkFarmsForRaiding(page, elementID);

      await farmsToBeRaided.then(async (result) => {
        if (result) {
          console.log(`++++++++++++ Raiding farm list`, validFarmName);

          const button = await farmList.$(MATCHING_PATTERNS.raidButton);
          await button.click(); // does not work because we need to scroll there
        }

        await updateFarmsList(farmFoundOnTheList);
      });
    } else {
      console.log(`>>> Farm ${validFarmName} is either not in the list, or its too soon to raid it again`);
    }
  });

const startFarming = async (page) => {
  await page.goto(PAGES.farmList);

  const farmsList = await page.$$(SELECTORS.rallyPoint.raidList);
  await Promise.all(loopFarmingList(page, farmsList));
};

const startBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 3000 });

  await login(page);
  await acceptCookies(page);
  await startFarming(page);

  await browser.close();
};

const launch = async () => {
  await startBrowser();
  const timerIntervals = {
    min: 40000,
    max: 70000,
  };

  const randomTimeout = Math.floor(Math.random() * (timerIntervals.max - timerIntervals.min + 1) + timerIntervals.min);
  setTimeout(() => launch(), randomTimeout);
};

launch();
