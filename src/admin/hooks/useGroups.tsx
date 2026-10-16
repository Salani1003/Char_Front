import { useQuery } from "@tanstack/react-query";
import { getGroupsAction } from "../actions/get-groups.actions";

/** Grupos disponibles para asignar a un usuario. */
export const useGroups = () =>
  useQuery({ queryKey: ["groups"], queryFn: getGroupsAction });
