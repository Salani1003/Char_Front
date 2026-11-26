import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientAction } from "../actions/update-client.action";
import type { UpdateClientRequest } from "../interfaces/client.request";

/** Edita un cliente e invalida los listados y detalles `["clients"]`. */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateClientRequest;
    }) => updateClientAction(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
};
