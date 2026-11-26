import type { ComponentProps } from "react";
import {
  Tabs as BaseTabs,
  TabsContent as BaseTabsContent,
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
} from "@/components/ui/tabs";

/**
 * Pestañas de Char (accesibles: `role="tablist"` / `tab` / `tabpanel`,
 * `aria-selected`, navegación con ← → y Inicio/Fin). Se componen con
 * `TabsList` + `TabsTrigger` (uno por pestaña) y un `TabsContent` por
 * pestaña, enlazados por `value`.
 *
 * Puede ser controlado (`value` + `onValueChange`) o no (`defaultValue`).
 * El panel de una pestaña inactiva no se renderiza: el estado que deba
 * conservarse al cambiar de pestaña tiene que vivir en el padre.
 *
 * @param value Pestaña activa (modo controlado).
 * @param defaultValue Pestaña inicial (modo no controlado).
 * @param onValueChange Se llama con el `value` de la pestaña elegida.
 */
export function Tabs(props: ComponentProps<typeof BaseTabs>) {
  return <BaseTabs {...props} />;
}

/** Barra de pestañas; con poco ancho se desplaza horizontalmente. Lleva un `aria-label` si hay más de un grupo de pestañas en la página. */
export function TabsList(props: ComponentProps<typeof BaseTabsList>) {
  return <BaseTabsList {...props} />;
}

/**
 * Pestaña. `children` puede llevar, además del texto, un dato como la
 * cantidad (ej. un `Badge`).
 *
 * @param value Identifica la pestaña; coincide con el de su `TabsContent`.
 * @param disabled Deshabilita la pestaña.
 */
export function TabsTrigger(props: ComponentProps<typeof BaseTabsTrigger>) {
  return <BaseTabsTrigger {...props} />;
}

/**
 * Panel de una pestaña.
 *
 * @param value `value` de la pestaña a la que pertenece.
 * @param keepMounted Mantiene el panel montado aunque esté inactivo.
 */
export function TabsContent(props: ComponentProps<typeof BaseTabsContent>) {
  return <BaseTabsContent {...props} />;
}
