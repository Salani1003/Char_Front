import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientAction } from "../actions/create-client.action";

/** Crea un cliente e invalida los listados `["clients"]` para que se refresquen. */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClientAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
};
