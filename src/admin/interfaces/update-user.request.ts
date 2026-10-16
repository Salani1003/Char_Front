import type { CreateUserRequest } from "./create-user.request";

/** Campos editables de un usuario; `password` solo se envía si se cambia. */
export type UpdateUserRequest = Partial<CreateUserRequest>;
