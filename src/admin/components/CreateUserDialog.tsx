import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateUser } from "@/admin/hooks/useCreateUser";
import { useGroups } from "@/admin/hooks/useGroups";
import { applyApiErrors } from "@/lib/applyApiErrors";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Dialog } from "@/components/char/dialog";
import { toast } from "@/components/char/sonner";
import { FormCheckboxGroup } from "@/components/forms/FormCheckboxGroup";
import { FormInput } from "@/components/forms/FormInput";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";

const newUserSchema = z.object({
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Ingresá un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  groups: z.array(z.number()).min(1, "Seleccioná al menos un grupo"),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

const EMPTY_VALUES: NewUserFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  groups: [],
};

/**
 * Modal de alta de usuario, abierto desde `UsersPage`. Formulario con
 * `react-hook-form` + `zod`: nombre, apellido, email, contraseña y grupos
 * (checkboxes cargados con `useGroups`). Al enviar crea el usuario con
 * `useCreateUser`; si sale bien muestra un toast y se cierra, y si falla
 * muestra el error y queda abierto: los errores de campo del backend (ej.
 * `{ "email": ["..."] }`) se muestran bajo el campo, y cualquier otro error
 * en un `AlertDialog`, siempre con el texto que devolvió el backend. El formulario se
 * limpia cada vez que el modal se cierra.
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado cuando se abre o cierra.
 */
export function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: groups = [] } = useGroups();
  const { mutateAsync: createUser } = useCreateUser();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: EMPTY_VALUES,
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(EMPTY_VALUES);
    onOpenChange(next);
  };

  const onSubmit = async (values: NewUserFormValues) => {
    try {
      await createUser(values);
      toast.success("Usuario creado");
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
      title="Nuevo usuario"
      description="Completá los datos para dar de alta un usuario."
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
        <FormPasswordInput
          label="Contraseña"
          name="password"
          control={control}
          autoComplete="new-password"
        />
        <FormCheckboxGroup
          label="Grupos"
          name="groups"
          control={control}
          options={groups.map((g) => ({ value: g.id, label: g.name }))}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Crear usuario
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
