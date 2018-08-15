import _SpeedTest from 'speedtest-net';
import { scheduleJob } from 'node-schedule';
import { set, chain, random, round, toNumber } from 'lodash';
import moment from 'moment';
import { SpeedTestResult } from 'data/models';
import Promise from 'bluebird';
// import Flatpickr from 'react-flatpickr'

const runSpeedTest = () =>
  new Promise((res, rej) => {
    _SpeedTest({ maxTime: 5000 })
      .on('data', res)
      .on('error', rej);
  });

class SpeedTest {
  runTest = () =>
    runSpeedTest().then(
      data => {
        ++this.count;
        return data;
      },
      err => err
    );

  static applyExtraMetaDataToTestResults(data) {
    return set(data, 'meta', {
      timestamp: toNumber(moment().format('x'))
    });
  }

  static schedule(cron, onTestComplete, onTestFailure) {
    const SpeedTestInstance = new SpeedTest();
    // Right now just use minutes, can write a more complex config if its ever needed
    console.info(`Scheduling Speedtest every ${cron} - Updating DB with results`);
    const schedule = scheduleJob(cron, () => {
      SpeedTestInstance.runTest()
        .then(SpeedTest.applyExtraMetaDataToTestResults)
        .then(onTestComplete)
        .catch(onTestFailure);
    });
    SpeedTestInstance.schedule = schedule;
    return SpeedTestInstance;
  }
}

export const seed = count =>
  chain(count)
    .times(() =>
      toNumber(
        moment()
          .subtract(random(0, 300), 'days')
          .subtract(random(0, 23), 'hours')
          .subtract(random(0, 59), 'minutes')
          .format('x')
      )
    )
    .uniq()
    .forEach((timestamp, idx) => {
      setTimeout(() => {
        SpeedTestResult.create({
          upload: round(random(0, 50, true), 3),
          download: round(random(0, 100, true), 3),
          timestamp
        });
      }, idx * 20);
    })
    .value();

// seed(1000);

// Speedtest is a singleton outside of here
export { SpeedTest as default };
