export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  /** Se omite si el usuario no tiene `auth.view_group`. */
  groups?: number[];
}
