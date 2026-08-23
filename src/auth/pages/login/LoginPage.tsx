import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { useAuthStore } from "@/auth/store/auth.store";
import { Button } from "@/components/char/button";
import { toast } from "@/components/char/sonner";
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
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
});
type LoginFormValues = z.infer<typeof loginSchema>;
/**
 * Pantalla de login del panel de administración. Renderiza una tarjeta con
 * los campos de email y contraseña (con toggle para mostrar/ocultar) y un
 * botón de envío, validados con `react-hook-form` + `zod`. Al enviar,
 * invoca `login` del `useAuthStore`; si falla muestra el `errorMessage`
 * del store como toast (`@/components/char/sonner`), y si tiene éxito
 * navega a `/admin`. Se renderiza dentro del `Outlet` de `AuthLayout`.
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const success = await login(values.email, values.password);
    if (success) {
      navigate("/admin", { replace: true });
      return;
    }
    toast.error(useAuthStore.getState().errorMessage);
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
