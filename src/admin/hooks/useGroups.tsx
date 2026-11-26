import { useQuery } from "@tanstack/react-query";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { getGroupsAction } from "../actions/get-groups.actions";

/**
 * Grupos disponibles para asignar a un usuario. Solo pide `GET /groups/` si
 * el usuario tiene `auth.view_group`; sin ese permiso no llama al endpoint
 * (queda `data` sin definir) y la UI no muestra el selector de grupos.
 */
export const useGroups = () => {
  const canViewGroups = useCan()(PERMISSIONS.groups.view);
  return useQuery({
    queryKey: ["groups"],
    queryFn: getGroupsAction,
    enabled: canViewGroups,
  });
};
