import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserAction } from "../actions/update-user.action";
import type { UpdateUserRequest } from "../interfaces/update-user.request";

/** Actualiza un usuario e invalida el listado `["users"]`. */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRequest }) =>
      updateUserAction(id, payload),
    // No conservar el payload (incluye la contraseña) en el caché de mutaciones.
    gcTime: 0,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
