import { useQuery } from "@tanstack/react-query";
import { getClientAction } from "../actions/get-client.action";
import type { Client } from "../interfaces/client.interface";

/**
 * Detalle de un cliente (`GET /clients/:id/`). Con `placeholder` (la fila del
 * listado) se muestra al instante mientras se trae la versión actualizada.
 * `id: null` no hace ningún request.
 */
export const useClient = (id: number | null, placeholder?: Client | null) => {
  return useQuery({
    queryKey: ["clients", "detail", id],
    queryFn: () => getClientAction(id as number),
    enabled: id !== null,
    placeholderData: placeholder ?? undefined,
  });
};
