/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import DataType from 'sequelize';
import Model from '../sequelize';

const SpeedTestResult = Model.define('SpeedTestResult', {
  download: { type: DataType.FLOAT },
  upload: { type: DataType.FLOAT },
  originalDownload: { type: DataType.INTEGER },
  originalUpload: { type: DataType.INTEGER },
  index: { type: DataType.INTEGER, autoIncrement: true, primaryKey: true }
});

export default SpeedTestResult;
