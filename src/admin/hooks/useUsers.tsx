import {useQuery} from "@tanstack/react-query";
import {getUsersAction} from "../actions/get-users.actions";

export const useUsers = () => {
  // todo : logica

  return useQuery({
    queryKey: ["users"],
    queryFn: getUsersAction,
  });
};
