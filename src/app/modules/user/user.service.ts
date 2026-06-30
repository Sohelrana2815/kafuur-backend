/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { userSearchableFields } from "./user.constant.js";

// const createUser = async () => {

// };

const getAllUsers = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.user, {
    ...query,
  });
  const usersQuery = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();
  // Concurrently fetch catalog payload data and total counter metadata
  const [data, meta] = await Promise.all([
    usersQuery.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};

export const UserServices = {
  getAllUsers,
};
