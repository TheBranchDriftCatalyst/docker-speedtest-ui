import { SpeedTestResult } from 'data/models';
import { chain, mergeWith, toNumber, set, compact } from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';
import gql from 'graphql-tag';

export const schema = [
  gql`
    # These should be moment moment().day|hour|month etc
    # only hour and day are currently supported
    enum AllowedResamplings {
      none
      hour
      day
    }
    # String formatted unix timestamp MS
    input SpeedTestResultsInput {
      start: String
      end: String
      resample: AllowedResamplings
    }
    # Speed Test Sample
    type SpeedTestResult {
      # Download Speed in MBs
      download: Float
      # Upload Speed in MBs
      upload: Float
      # Unix Timestamp
      timestamp: String
      index: Int
    }
    type SpeedTestResults {
      data: [SpeedTestResult]
      count: Int
      timing: Float
    }
  `
];

export const queries = [
  `
  # Retrieves all speed test result samples with optional grouping strategy
  SpeedTestResults(resample: AllowedResamplings, end: String, start: String): SpeedTestResults
  `
];

export const resolvers = {
  RootQuery: {
    async SpeedTestResults(parent, { start: startDate, end: endDate, resample: resamplePeriod }) {
      let data = await SpeedTestResult.helpers.defaultGetAll(startDate, endDate);
      let [t0, t1] = [0, 0];
      if (resamplePeriod !== 'none') {
        t0 = new Date().getTime();
        data = SpeedTestResult.helpers.resample(resamplePeriod);
        t1 = new Date().getTime();
        console.info('SpeedTestResampling took', t1 - t0);
      }
      return {
        data,
        timing: (t1 - t0) / 1000
      };
    }
  },
  SpeedTestResults: {
    count({ data }) {
      return data.length;
    }
  }
};
