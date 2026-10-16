import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserAction } from "../actions/delete-user.action";

/** Elimina un usuario e invalida el listado `["users"]`. */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
