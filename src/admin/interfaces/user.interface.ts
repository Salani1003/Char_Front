export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  groups: number[];
  /** Nombres de los grupos. Solo informativo: no se usa para decidir acceso. */
  group_names?: string[];
  date_joined: Date;
  last_login: Date | null;
}

/**
 * Usuario autenticado (`GET /users/me/`): suma la lista de permisos
 * (`<app>.<accion>_<modelo>`, ordenada) con la que `can()` decide el acceso.
 */
export interface CurrentUser extends User {
  permissions: string[];
}
