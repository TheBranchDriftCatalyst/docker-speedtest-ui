/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import DataType, { Op } from 'sequelize';
import { set, assign, compact, toNumber, chain, mergeWith } from 'lodash';
import { moment } from 'moment';
import Model from '../sequelize';

const SpeedTestResult = Model.define('SpeedTestResult', {
  download: { type: DataType.FLOAT },
  upload: { type: DataType.FLOAT },
  // originalDownload: { type: DataType.INTEGER },
  // originalUpload: { type: DataType.INTEGER },
  timestamp: { type: DataType.INTEGER },
  index: { type: DataType.INTEGER, autoIncrement: true, primaryKey: true }
});

SpeedTestResult.helpers = assign(SpeedTestResult.helpers, {
  resample: resamplePeriod => data =>
    chain(data)
      .groupBy(({ timestamp }) =>
        moment(timestamp)
          .endOf(resamplePeriod)
          .format('x')
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
          timestamp: gName,
          index: gSampleBase.index
        });
      }, [])
      .value(),
  /**
   * Default interface for the dataset get
   * @param  {[type]}  startDate unix ms timestamp as a string
   * @param  {[type]}  endDate   unix ms timestamp as a string
   * @return {Promise}
   */
  defaultGetAll: async (startDate, endDate) => {
    const findQuery = {
      attributes: {
        include: ['download', 'upload', 'timestamp', 'index']
      },
      // Always want ascending order for time series data
      order: [['index', 'ASC']]
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
    return SpeedTestResult.findAll(findQuery);
  }
});

export default SpeedTestResult;
