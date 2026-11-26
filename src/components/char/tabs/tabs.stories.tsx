import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@/components/char/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Char/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Dos pestañas; ← → las recorren y Tab entra al panel. */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="data">
      <TabsList aria-label="Secciones del producto">
        <TabsTrigger value="data">Datos y precios</TabsTrigger>
        <TabsTrigger value="variants">Variantes</TabsTrigger>
      </TabsList>
      <TabsContent value="data">Contenido de datos y precios.</TabsContent>
      <TabsContent value="variants">Contenido de variantes.</TabsContent>
    </Tabs>
  ),
};

/** La pestaña lleva la cantidad de elementos. */
export const WithCount: Story = {
  render: () => (
    <Tabs defaultValue="data">
      <TabsList aria-label="Secciones del producto">
        <TabsTrigger value="data">Datos y precios</TabsTrigger>
        <TabsTrigger value="variants">
          Variantes <Badge variant="secondary">12</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="data">Contenido de datos y precios.</TabsContent>
      <TabsContent value="variants">Contenido de variantes.</TabsContent>
    </Tabs>
  ),
};

/** Una pestaña deshabilitada se saltea con el teclado. */
export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList aria-label="Ejemplo">
        <TabsTrigger value="a">Primera</TabsTrigger>
        <TabsTrigger value="b" disabled>
          Deshabilitada
        </TabsTrigger>
        <TabsTrigger value="c">Tercera</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Primera.</TabsContent>
      <TabsContent value="b">Deshabilitada.</TabsContent>
      <TabsContent value="c">Tercera.</TabsContent>
    </Tabs>
  ),
};

/** Modo controlado: el padre guarda la pestaña activa. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>("b");
    return (
      <Tabs value={value} onValueChange={setValue}>
        <TabsList aria-label="Ejemplo">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A.</TabsContent>
        <TabsContent value="b">Panel B (activa: {String(value)}).</TabsContent>
      </Tabs>
    );
  },
};
