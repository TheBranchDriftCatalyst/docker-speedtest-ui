import _SpeedTest from 'speedtest-net';
import { scheduleJob } from 'node-schedule';
import Promise from 'bluebird';

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

  static schedule(everyMinutes, onTestComplete, onTestFailure) {
    const SpeedTestInstance = new SpeedTest();
    // Right now just use minutes, can write a more complex config if its ever needed
    console.log(`Scheduling Speedtest every ${everyMinutes} - Updating DB with results`);
    const schedule = scheduleJob(`00,15,30,45 * * * *`, () => {
      SpeedTestInstance.runTest()
        .then(onTestComplete)
        .catch(onTestFailure);
    });
    SpeedTestInstance.schedule = schedule;
    return SpeedTestInstance;
  }
}

// Speedtest is a singleton outside of here
export { SpeedTest as default };
