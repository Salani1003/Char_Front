import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateUser } from "@/admin/hooks/useCreateUser";
import { useGroups } from "@/admin/hooks/useGroups";
import { useUpdateUser } from "@/admin/hooks/useUpdateUser";
import { PERMISSIONS, useCan, useCanAssignGroup } from "@/auth/lib/permissions";
import { applyApiErrors } from "@/lib/applyApiErrors";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Dialog } from "@/components/char/dialog";
import { toast } from "@/components/char/sonner";
import { FormCheckboxGroup } from "@/components/forms/FormCheckboxGroup";
import { FormInput } from "@/components/forms/FormInput";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import type { User } from "../interfaces/user.interface";

const PASSWORD_MESSAGE = "La contraseña debe tener al menos 8 caracteres";

/** En edición la contraseña es opcional: vacía significa "no cambiarla". */
const makeUserSchema = (isEdit: boolean, requireGroups: boolean) =>
  z.object({
    first_name: z.string().min(1, "El nombre es obligatorio"),
    last_name: z.string().min(1, "El apellido es obligatorio"),
    email: z
      .string()
      .min(1, "El email es obligatorio")
      .email("Ingresá un email válido"),
    password: isEdit
      ? z.string().refine((v) => v === "" || v.length >= 8, PASSWORD_MESSAGE)
      : z.string().min(8, PASSWORD_MESSAGE),
    groups: requireGroups
      ? z.array(z.number()).min(1, "Seleccioná al menos un grupo")
      : z.array(z.number()),
  });

type UserFormValues = z.infer<ReturnType<typeof makeUserSchema>>;

const EMPTY_VALUES: UserFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  groups: [],
};

const toFormValues = (user: User): UserFormValues => ({
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  password: "",
  groups: [...user.groups].sort((a, b) => a - b),
});

/**
 * Modal de alta y edición de usuario, abierto desde `UsersPage`. Formulario
 * con `react-hook-form` + `zod`: nombre, apellido, email, contraseña y grupos
 * (checkboxes cargados con `useGroups`, al menos uno). El selector de grupos
 * solo aparece con `auth.view_group` (sin él no se llama a `GET /groups/` ni
 * se envían grupos), y un no superusuario solo puede elegir los grupos que él
 * mismo tiene (`useCanAssignGroup`).
 *
 * - Sin `user`: modo alta ("Nuevo usuario"), la contraseña es obligatoria y
 *   se crea con `useCreateUser`.
 * - Con `user`: modo edición ("Editar usuario"), el formulario se carga con
 *   sus datos, la contraseña es opcional (vacía = no se cambia) y el botón de
 *   guardar solo se habilita si hubo algún cambio. Se actualiza con
 *   `useUpdateUser`.
 *
 * Si sale bien muestra un toast y se cierra; si falla queda abierto: los
 * errores de campo del backend (ej. `{ "email": ["..."] }`) se muestran bajo
 * el campo y cualquier otro error en un `AlertDialog`, siempre con el texto
 * del backend. El formulario se restablece cada vez que el modal se cierra.
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado cuando se abre o cierra.
 * @param user Usuario a editar; si se omite, el modal crea uno nuevo.
 */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}) {
  const isEdit = !!user;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const can = useCan();
  const canAssignGroup = useCanAssignGroup();
  const { data: allGroups = [] } = useGroups();
  // Sin `auth.view_group` no se muestra el selector (ni se llama al endpoint).
  const showGroups = can(PERMISSIONS.groups.view);
  const groups = allGroups.filter((g) => canAssignGroup(g.id));
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(makeUserSchema(isEdit, showGroups)),
    values: user ? toFormValues(user) : EMPTY_VALUES,
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (user) {
        const { password, groups: selected, ...rest } = values;
        await updateUser({
          id: user.id,
          payload: {
            ...rest,
            ...(password ? { password } : {}),
            ...(showGroups ? { groups: selected } : {}),
          },
        });
        toast.success("Usuario actualizado");
      } else {
        const { groups: selected, ...rest } = values;
        await createUser(showGroups ? { ...rest, groups: selected } : rest);
        toast.success("Usuario creado");
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
      title={isEdit ? "Editar usuario" : "Nuevo usuario"}
      description={
        isEdit
          ? "Modificá los datos del usuario."
          : "Completá los datos para dar de alta un usuario."
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
        <FormPasswordInput
          label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
          name="password"
          control={control}
          autoComplete="new-password"
        />
        {showGroups ? (
          <FormCheckboxGroup
            label="Grupos"
            name="groups"
            control={control}
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
          />
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || (isEdit && !isDirty)}>
            {isEdit ? "Guardar cambios" : "Crear usuario"}
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
