import { merge } from 'lodash';

/** * Schjemas ** */
import {
  schema as GetAllUsers,
  queries as GetAllUsersQueries,
  resolvers as GetAllUsersResolver
} from './users/GetAllUsers';
/** * Queries ** */
import { queries as GetLoggedInUserQueries, resolvers as GetLoggedInUserResolver } from './users/GetLoggedInUser';
import {
  schema as GetAllSTRs,
  queries as GetAllSTRsQueries,
  resolvers as CreateSTRResolves
} from './speed-test-samples/GetAllSTRs';

/** * Mutations ** */
import { schema as CreateUserInput, mutation as CreateUser, resolvers as CreateUserResolver } from './users/CreateUser';

export const schema = [...GetAllUsers, ...CreateUserInput, ...GetAllSTRs];

export const queries = [...GetAllUsersQueries, ...GetLoggedInUserQueries, ...GetAllSTRsQueries];

export const mutations = [...CreateUser];

export const resolvers = merge(GetAllUsersResolver, GetLoggedInUserResolver, CreateUserResolver, CreateSTRResolves);
