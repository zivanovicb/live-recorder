const puppeteer = require("puppeteer");

const waitForSelector = "#react-root";
const liveHTMLElem = "._1iHbP";
const testUrl2 = "https://www.instagram.com/deeexeev/";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(testUrl2);
  console.log("waiting");
  await page.waitForSelector(waitForSelector);

  const reactRoot = await page.$("#react-root");
  const span = await page.$(liveHTMLElem);
  const eval = await page.evaluate((root) => root.innerHTML, span);
  console.log(eval);
  await browser.close();
})();
