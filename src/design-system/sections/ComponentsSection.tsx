import { Search } from "lucide-react";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import { Checkbox } from "@/components/char/checkbox";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { RadioGroup, RadioGroupItem } from "@/components/char/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { Textarea } from "@/components/char/textarea";
import { DocSection, DocSubheading } from "../components/DocSection";
function Example({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex min-h-9 items-center">{children}</div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
/**
 * Documenta los componentes reutilizables del Design System de Char
 * (`src/components/char`), con sus variantes, tamaños y estados. Son
 * instancias reales de los componentes — hover, foco (tab) y click
 * funcionan igual que en cualquier pantalla.
 */
export function ComponentsSection() {
  return (
    <DocSection
      id="components"
      title="Components"
      description="Instancias reales de src/components/char — probá hover, foco (tab) y click para ver esos estados."
    >
      <div className="flex flex-col gap-3">
        <DocSubheading>Button</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="primary">
            <Button variant="primary">Ingresar</Button>
          </Example>
          <Example label="secondary">
            <Button variant="secondary">Cancelar</Button>
          </Example>
          <Example label="ghost">
            <Button variant="ghost">Ghost</Button>
          </Example>
          <Example label="danger">
            <Button variant="danger">Eliminar</Button>
          </Example>
          <Example label="link">
            <Button variant="link">¿La olvidaste?</Button>
          </Example>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <Example label="size sm">
            <Button size="sm">Guardar</Button>
          </Example>
          <Example label="size md">
            <Button size="md">Guardar</Button>
          </Example>
          <Example label="size lg">
            <Button size="lg">Guardar</Button>
          </Example>
          <Example label="size icon">
            <Button size="icon" aria-label="Buscar">
              <Search />
            </Button>
          </Example>
        </div>
        <div className="flex flex-wrap gap-6">
          <Example label="primary disabled">
            <Button variant="primary" disabled>
              Ingresar
            </Button>
          </Example>
          <Example label="secondary disabled">
            <Button variant="secondary" disabled>
              Cancelar
            </Button>
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Input</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="size sm">
            <Input size="sm" placeholder="tu@chartienda.com" />
          </Example>
          <Example label="size md">
            <Input size="md" placeholder="tu@chartienda.com" />
          </Example>
          <Example label="size lg">
            <Input size="lg" placeholder="tu@chartienda.com" />
          </Example>
          <Example label="con ícono">
            <Input icon={<Search className="size-4" />} placeholder="Buscar…" />
          </Example>
          <Example label="disabled">
            <Input placeholder="Deshabilitado" disabled />
          </Example>
          <Example label="inválido (error)">
            <Input placeholder="Email inválido" aria-invalid />
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Label</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="normal">
            <Label htmlFor="ds-label-normal">Email</Label>
          </Example>
          <Example label="required">
            <Label htmlFor="ds-label-required" required>
              Email
            </Label>
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Select</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="default">
            <Select defaultValue="clientes">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Elegí una sección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clientes">Clientes</SelectItem>
                <SelectItem value="productos">Productos</SelectItem>
                <SelectItem value="ventas">Ventas</SelectItem>
              </SelectContent>
            </Select>
          </Example>
          <Example label="size sm">
            <Select defaultValue="clientes">
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clientes">Clientes</SelectItem>
                <SelectItem value="productos">Productos</SelectItem>
              </SelectContent>
            </Select>
          </Example>
          <Example label="disabled">
            <Select disabled>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Deshabilitado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clientes">Clientes</SelectItem>
              </SelectContent>
            </Select>
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Textarea</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="normal">
            <Textarea placeholder="Notas del pedido…" className="w-64" />
          </Example>
          <Example label="disabled">
            <Textarea placeholder="Deshabilitado" disabled className="w-64" />
          </Example>
          <Example label="inválido (error)">
            <Textarea
              placeholder="Campo requerido"
              aria-invalid
              className="w-64"
            />
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Checkbox</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="unchecked">
            <div className="flex items-center gap-2">
              <Checkbox id="ds-check-1" />
              <Label htmlFor="ds-check-1">Notificarme por email</Label>
            </div>
          </Example>
          <Example label="checked">
            <div className="flex items-center gap-2">
              <Checkbox id="ds-check-2" defaultChecked />
              <Label htmlFor="ds-check-2">Notificarme por email</Label>
            </div>
          </Example>
          <Example label="disabled">
            <div className="flex items-center gap-2">
              <Checkbox id="ds-check-3" disabled />
              <Label htmlFor="ds-check-3">Deshabilitado</Label>
            </div>
          </Example>
          <Example label="inválido (error)">
            <div className="flex items-center gap-2">
              <Checkbox id="ds-check-4" aria-invalid />
              <Label htmlFor="ds-check-4">Campo requerido</Label>
            </div>
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Radio</DocSubheading>
        <div className="flex flex-wrap gap-10">
          <Example label="grupo">
            <RadioGroup defaultValue="efectivo" className="gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="efectivo" id="ds-radio-1" />
                <Label htmlFor="ds-radio-1">Efectivo</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="transferencia" id="ds-radio-2" />
                <Label htmlFor="ds-radio-2">Transferencia</Label>
              </div>
            </RadioGroup>
          </Example>
          <Example label="disabled">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="disabled" id="ds-radio-3" disabled />
              <Label htmlFor="ds-radio-3">Deshabilitado</Label>
            </div>
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Badge</DocSubheading>
        <div className="flex flex-wrap gap-3">
          <Example label="primary">
            <Badge variant="primary">Nuevo</Badge>
          </Example>
          <Example label="secondary">
            <Badge variant="secondary">Borrador</Badge>
          </Example>
          <Example label="success">
            <Badge variant="success">Pagado</Badge>
          </Example>
          <Example label="warning">
            <Badge variant="warning">Pendiente</Badge>
          </Example>
          <Example label="danger">
            <Badge variant="danger">Vencido</Badge>
          </Example>
          <Example label="outline">
            <Badge variant="outline">Archivado</Badge>
          </Example>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Card</DocSubheading>
        <div className="flex flex-wrap items-start gap-6">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Card default</CardTitle>
              <CardDescription>size="default"</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contenido de ejemplo dentro de la tarjeta.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Acción</Button>
            </CardFooter>
          </Card>
          <Card size="sm" className="w-72">
            <CardHeader>
              <CardTitle>Card sm</CardTitle>
              <CardDescription>size="sm"</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Versión compacta de la tarjeta.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DocSection>
  );
}
