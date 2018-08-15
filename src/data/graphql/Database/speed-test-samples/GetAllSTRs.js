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
  SpeedTestResults(input: SpeedTestResultsInput): SpeedTestResults
  `
];

export const resolvers = {
  RootQuery: {
    async SpeedTestResults(parent, { input }) {

      console.log('******************************************************************************************')
      console.log('Input Variables: ', input)
      console.log('******************************************************************************************')

      const {start: startDate, end: endDate, resample: resamplePeriod} = input || {};

      const findQuery = {
        attributes: {
          include: ['download', 'upload', 'timestamp', 'index']
        }
      };

      if (startDate || endDate) {
        set(findQuery, 'where', {
          [Op.and]: compact([
            startDate && {
              timestamp: {
                [Op.gte]: toNumber(startDate)
              }
            },
            endDate && {
              timestamp: {
                [Op.lte]: toNumber(endDate)
              }
            }
          ])
        });
      }
      let data = await SpeedTestResult.findAll(findQuery);
      const start = new Date().getTime();
      if (resamplePeriod !== 'none') {
        data = chain(data)
          .groupBy(({ timestamp }) =>
            toNumber(
              moment(timestamp)
                .endOf(resamplePeriod)
                .format('x')
            )
          )
          .transform((acum, gSamples, gName) => {
            const [gSampleBase, ...restSamples] = gSamples;
            // eslint-disable-next-line consistent-return
            const sum = mergeWith(gSampleBase, restSamples, (objV, srcV, key) => {
              if (key === 'download' || key === 'upload') {
                return objV + srcV;
              }
            });
            acum.push({
              upload: sum.upload / (gSamples.length + 1),
              download: sum.download / (gSamples.length + 1),
              timestamp: gName
            });
          }, [])
          .value();
      }
      const end = new Date().getTime();
      return {
        data,
        timing: (end - start) / 1000
      };
    }
  },
  SpeedTestResults: {
    count({ data }) {
      return data.length;
    }
  }
};
