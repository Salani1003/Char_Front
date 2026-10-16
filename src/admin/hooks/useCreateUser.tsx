import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserAction } from "../actions/create-user.action";

/** Crea un usuario e invalida el listado `["users"]` para que se refresque. */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserAction,
    // No conservar el payload (incluye la contraseña) en el caché de mutaciones.
    gcTime: 0,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};
