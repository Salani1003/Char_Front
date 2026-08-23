import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "@/components/char/button";
const meta = {
  title: "Char/Card",
  component: Card,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Título de la tarjeta</CardTitle>
        <CardDescription>Descripción breve de contenido.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Contenido principal de la tarjeta.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Aceptar</Button>
      </CardFooter>
    </Card>
  ),
};
