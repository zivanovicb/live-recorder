const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const TwitchAccount = require("./models/TwitchAccount");
const dotenv = require("dotenv");
const StreamLink = require("streamlink");
const mkdirp = require("mkdirp");
const moment = require("moment");
const faker = require("faker");

dotenv.config();

const MONGODB_HOST = process.env.DB_HOST;
const MONGODB_PASS = process.env.DB_PASS;
const MONGODB_DB_NAME = process.env.DB_NAME;

const TWITCH_WAIT_FOR_SELECTOR = "#root";
const TWITCH_LIVE_INDICATOR_ELEM_SELECTOR = ".live-indicator-container p";
const TWITCH_LIVE_TEXT_INDICATOR = "live";
const STREAMLINK_VIDEO_OUTPUT_EXTENSION = "flv";

const MONGODB_CONNECTION_URI = `mongodb://${MONGODB_HOST}/${MONGODB_DB_NAME}`;

console.log({
  MONGODB_HOST,
  MONGODB_PASS,
  MONGODB_DB_NAME,
  MONGODB_CONNECTION_URI,
});

mongoose.connect(MONGODB_CONNECTION_URI, {
  useNewUrlParser: true,
});

const checkIfLive = (acc) => {
  const accObj = acc.toObject();
  const twitchStreamerURL = `https://www.twitch.tv/${accObj.username}`;
  console.log("[accountToStartRecordingPromise]", accObj);

  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(twitchStreamerURL);

      console.log(
        "[accountToStartRecordingPromise] going to wait for selector"
      );
      await page.waitForSelector(TWITCH_WAIT_FOR_SELECTOR);

      const indicator = await page.$(TWITCH_LIVE_INDICATOR_ELEM_SELECTOR);
      console.log({ TWITCH_LIVE_INDICATOR_ELEM_SELECTOR });
      const textIndicator = await page.evaluate(
        (root) => root.innerHTML,
        indicator
      );
      console.log("[accountToStartRecordingPromise] indicator val", eval);
      if (
        textIndicator &&
        typeof textIndicator === "string" &&
        textIndicator.toLowerCase() === TWITCH_LIVE_TEXT_INDICATOR
      ) {
        resolve({ isLive: true, accObj, twitchStreamerURL });
      }

      await browser.close();
    } catch (err) {
      console.error(
        "[accountToStartRecordingPromise] something went wrong",
        err
      );
      reject(err);
    }
  });
};

const record = ({ isLive, accObj, twitchStreamerURL }) => {
  return new Promise(async (resolve) => {
    console.log("[checkIfLive]", { isLive, accObj });
    const stream = new StreamLink(twitchStreamerURL);
    const now = moment();

    const month = now.month();
    const date = now.date();
    const hr = now.hour();

    const dir = await mkdirp(`./${accObj.username}/${month}/${date}/${hr}`);
    const output = `${dir}/${faker.random.word()}.${STREAMLINK_VIDEO_OUTPUT_EXTENSION}`;

    stream.output(output).start();

    stream.on("err", (err) => {
      console.error("[record] err", err);
    });

    stream.on("end", (o) => {
      console.log("[record] stream ended", o);
      console.log(o);
      resolve({ accObj, ended: true, twitchStreamerURL, output });
    });
  });
};

async function main() {
  //   logger.log("[main]");
  try {
    const accounts = await TwitchAccount.find({ recording: false });
    console.log("[main] accounts", accounts);
    const liveAndNotAlreadyStartedRecordingAccounts = await Promise.all(
      accounts.map(checkIfLive)
    );
    console.log(
      "[main] liveAndNotAlreadyStartedRecordingAccounts",
      liveAndNotAlreadyStartedRecordingAccounts
    );
    const beingStreamedAndRecorded = await Promise.all(
      liveAndNotAlreadyStartedRecordingAccounts.map(record)
    );
    console.log("[main] beingStreamedAndRecorded", beingStreamedAndRecorded);
  } catch (err) {
    console.error("[main]", err);
  }
}

main();

// const testUrl2 = "https://www.twitch.tv/anthonywritescode";

// var stream = new Streamlink(link).output("./" + Date.now() + ".flv").start();

// stream.getQualities();

// stream.on("quality", (data) => {
//   console.log(data);
// });

// stream.on("log", (data) => {
//   console.log(data);
// });

// console.log(eval);
module.exports = {};
