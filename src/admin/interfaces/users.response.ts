import type {User} from "./user.interface";

export interface UsersResponse {
  count: number;
  next: null;
  previous: null;
  results: User[];
}
