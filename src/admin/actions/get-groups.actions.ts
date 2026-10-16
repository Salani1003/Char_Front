import { charApi } from "@/lib/charApi";
import type { Group } from "../interfaces/group.interface";

/**
 * Lista los grupos disponibles para asignar a un usuario. Acepta tanto una
 * respuesta paginada (`{ results }`) como un arreglo plano.
 */
export const getGroupsAction = async () => {
  const { data } = await charApi.get<Group[] | { results: Group[] }>(
    "/groups/",
  );

  return Array.isArray(data) ? data : data.results;
};
