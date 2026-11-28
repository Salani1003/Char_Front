import { Combobox } from "@/components/char/combobox";
import { useClients } from "../hooks/useClients";
import { useComboboxSearch } from "../hooks/useComboboxSearch";
import type { Client } from "../interfaces/client.interface";
import { getClientFullName } from "../utils/getClientFullName";

/**
 * Autocompletado de cliente para la venta (opcional: sin cliente es
 * "Consumidor final"). Pide `GET /clients/?search=` (nombre, apellido o email;
 * retraso de 250 ms). Con `onCreate` muestra el "+" y la fila "Crear…", que el
 * padre resuelve abriendo el alta de cliente.
 *
 * @param value Cliente elegido, o `null` (consumidor final).
 * @param onChange Cliente elegido o `null` al quitarlo.
 * @param onCreate Habilita "+ Nuevo cliente"; recibe lo escrito.
 * @param disabled Deshabilita el campo.
 * @param id `id` del campo (para un `<Label htmlFor>`).
 * @param aria-label Nombre accesible del campo.
 */
export function ClientCombobox({
  value,
  onChange,
  onCreate,
  disabled,
  id,
  ...rest
}: {
  value: Client | null;
  onChange: (client: Client | null) => void;
  onCreate?: (query: string) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}) {
  const { setQuery, search, pending } = useComboboxSearch();
  const list = useClients({ search, page_size: 20 });

  return (
    <Combobox<Client>
      {...rest}
      id={id}
      value={value}
      onChange={onChange}
      options={list.data?.results ?? []}
      getOptionKey={(c) => c.id}
      getOptionLabel={getClientFullName}
      renderOption={(client) => (
        <span className="flex min-w-0 flex-col py-0.5">
          <span className="truncate font-medium">
            {getClientFullName(client)}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {client.email}
          </span>
        </span>
      )}
      onInputChange={setQuery}
      onCreate={onCreate}
      createLabel={(q) => (q ? `Crear cliente «${q}»` : "Nuevo cliente")}
      createButtonLabel="Nuevo cliente"
      loading={list.isFetching || pending}
      placeholder="Consumidor final"
      clearable
      clearLabel="Quitar cliente"
      disabled={disabled}
      emptyMessage={(q) =>
        q ? `No hay clientes que coincidan con «${q}»` : "No hay clientes"
      }
    />
  );
}
