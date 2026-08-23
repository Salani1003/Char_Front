import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/char/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import { FormInput } from "@/components/forms/FormInput";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Ingresá un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
type LoginFormValues = z.infer<typeof loginSchema>;
/**
 * Pantalla de login del panel de administración. Renderiza una tarjeta con
 * los campos de email y contraseña (con toggle para mostrar/ocultar) y un
 * botón de envío, validados con `react-hook-form` + `zod`. Se renderiza
 * dentro del `Outlet` de `AuthLayout`.
 */
export const LoginPage = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const onSubmit = async (values: LoginFormValues) => {
    console.log(values);
  };
  return (
    <Card className="w-full max-w-2xl [--card-spacing:--spacing(10)]">
      <CardHeader className="gap-3">
        <CardTitle className="text-4xl font-montserrat">
          Iniciar sesión
        </CardTitle>
        <CardDescription className="text-lg">
          Ingresá con tu cuenta para acceder al panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-7"
        >
          <FormInput
            label="Email"
            name="email"
            control={control}
            type="email"
            autoComplete="email"
            placeholder="tu@chartienda.com"
            className="h-14 px-5 text-lg md:text-lg"
          />
          <FormPasswordInput
            label="Contraseña"
            name="password"
            control={control}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-14 pr-12 pl-5 text-lg md:text-lg"
          />
          <Button
            type="submit"
            size="lg"
            className="mt-2 h-14 w-full text-lg"
            disabled={isSubmitting}
          >
            Ingresar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
