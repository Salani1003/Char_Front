import {charApi} from "../charApi";
import type {UsersResponse} from "../interfaces/users.response";

export const getUsersAction = async () => {
  const {data} = await charApi.get<UsersResponse>("/users");
  console.log(data);
  return data;
};
