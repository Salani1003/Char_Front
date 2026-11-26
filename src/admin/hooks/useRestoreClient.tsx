import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreClientAction } from "../actions/restore-client.action";

/**
 * Restaura un cliente eliminado (`POST /clients/:id/restore/`) e invalida los
 * listados `["clients"]` para que vuelva a aparecer.
 */
export const useRestoreClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreClientAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
};
