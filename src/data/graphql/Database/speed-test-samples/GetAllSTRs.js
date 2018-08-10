import { SpeedTestResult } from 'data/models';

import gql from 'graphql-tag';

export const schema = [
  gql`
    # Speed Test Sample
    type SpeedTestResult {
      # Download Speed in MBs
      download: Float
      # Upload Speed in MBs
      upload: Float
      # Upload Speed in Mbs
      originalUpload: Int
      # Download Speed in Mbs
      originalDownload: Int
      createdAt: String
      updatedAt: String
      # Unix Timestamp
      timestamp: Int
      index: Int
      somethingElse: String
    }
  `
];

export const queries = [
  `
  # Retrieves all users stored in the local database
  databaseGetAllSTRs: [SpeedTestResult]
  `
];

export const resolvers = {
  RootQuery: {
    async databaseGetAllSTRs(parent, queryArgs, context) {
      const str = await SpeedTestResult.findAll();
      return str;
    }
  },
  SpeedTestResult: {
    async somethingElse() {
      return 'Something else';
    }
  }
};
