import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { applyApiErrors } from "@/lib/applyApiErrors";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Dialog } from "@/components/char/dialog";
import { toast } from "@/components/char/sonner";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import {
  CLIENT_ORIGIN_OPTIONS,
  isClientOrigin,
} from "../config/client-origins";
import { useCreateClient } from "../hooks/useCreateClient";
import { useUpdateClient } from "../hooks/useUpdateClient";
import type { Client } from "../interfaces/client.interface";

const clientSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre admite hasta 150 caracteres"),
  last_name: z
    .string()
    .trim()
    .min(1, "El apellido es obligatorio")
    .max(150, "El apellido admite hasta 150 caracteres"),
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio")
    .email("Ingresá un email válido"),
  phone: z.string().trim().max(30, "El teléfono admite hasta 30 caracteres"),
  origin: z
    .string()
    .refine(
      (value): boolean => isClientOrigin(value),
      "Elegí el origen del cliente",
    ),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const EMPTY_VALUES: ClientFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  origin: "",
};

const toFormValues = (client: Client): ClientFormValues => ({
  first_name: client.first_name,
  last_name: client.last_name,
  email: client.email,
  phone: client.phone ?? "",
  origin: client.origin,
});

/**
 * Modal de alta y edición de cliente, abierto desde `ClientsPage`. Formulario
 * con `react-hook-form` + `zod`: nombre y apellido (obligatorios, hasta 150
 * caracteres), email (obligatorio, con formato válido; se envía en minúsculas
 * como lo guarda el backend), teléfono (opcional, hasta 30) y origen
 * (obligatorio, desplegable con las etiquetas en español).
 *
 * - Sin `client`: modo alta ("Nuevo cliente"), se crea con `useCreateClient`; "Cancelar"
 *   usa la variante `danger` (roja) y "Crear cliente" la `success` (verde).
 *   Si el email era de un cliente eliminado el backend lo restaura con estos
 *   datos y responde igual que un alta: no es un error.
 * - Con `client`: modo edición ("Editar cliente"), el formulario se carga con
 *   sus datos y "Guardar cambios" solo se habilita si hubo algún cambio. Un
 *   teléfono vacío se envía como `null` para borrarlo. Se actualiza con
 *   `useUpdateClient`.
 *
 * Si sale bien muestra un toast y se cierra; si falla queda abierto: cada
 * error 400 del backend (ej. "Ya existe un cliente con este email.") se
 * muestra bajo su campo y cualquier otro (403, 429, red, ...) en un
 * `AlertDialog`, siempre con el texto del backend. El formulario se
 * restablece cada vez que el modal se cierra.
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado cuando se abre o cierra.
 * @param client Cliente a editar; si se omite, el modal crea uno nuevo.
 */
export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}) {
  const isEdit = !!client;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: createClient } = useCreateClient();
  const { mutateAsync: updateClient } = useUpdateClient();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    values: client ? toFormValues(client) : EMPTY_VALUES,
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = async (values: ClientFormValues) => {
    const { phone, origin, email, ...rest } = values;
    const base = {
      ...rest,
      email: email.toLowerCase(),
      origin: origin as Client["origin"],
    };
    try {
      if (client) {
        await updateClient({
          id: client.id,
          payload: { ...base, phone: phone || null },
        });
        toast.success("Cliente actualizado");
      } else {
        await createClient(phone ? { ...base, phone } : base);
        toast.success("Cliente creado");
      }
      handleOpenChange(false);
    } catch (error) {
      const alertMessage = applyApiErrors(
        error,
        setError,
        Object.keys(EMPTY_VALUES),
      );
      if (alertMessage) setErrorMessage(alertMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Editar cliente" : "Nuevo cliente"}
      description={
        isEdit
          ? "Modificá los datos del cliente."
          : "Completá los datos para dar de alta un cliente."
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            label="Nombre"
            name="first_name"
            control={control}
            autoComplete="off"
          />
          <FormInput
            label="Apellido"
            name="last_name"
            control={control}
            autoComplete="off"
          />
        </div>
        <FormInput
          label="Email"
          name="email"
          control={control}
          type="email"
          autoComplete="off"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            label="Teléfono (opcional)"
            name="phone"
            control={control}
            type="tel"
            autoComplete="off"
          />
          <FormSelect
            label="Origen"
            name="origin"
            control={control}
            options={CLIENT_ORIGIN_OPTIONS}
            placeholder="Elegí un origen"
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant={isEdit ? "secondary" : "danger"}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={isEdit ? "primary" : "success"}
            disabled={isSubmitting || (isEdit && !isDirty)}
          >
            {isEdit ? "Guardar cambios" : "Crear cliente"}
          </Button>
        </div>
      </form>
      <AlertDialog
        open={errorMessage !== null}
        onOpenChange={(next) => !next && setErrorMessage(null)}
        variant="danger"
        title={errorMessage ?? ""}
      />
    </Dialog>
  );
}
