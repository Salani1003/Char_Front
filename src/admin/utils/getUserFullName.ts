import type { User } from "../interfaces/user.interface";

/** Nombre y apellido del usuario, o su email si ambos vienen vacíos. */
export const getUserFullName = (user: User) =>
  `${user.first_name} ${user.last_name}`.trim() || user.email;
