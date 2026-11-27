import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Search, Trash2 } from "lucide-react";
import { ActionsMenu } from "@/components/char/actions-menu";
import { AlertDialog } from "@/components/char/alert-dialog";
import type { CharAlertDialogVariant } from "@/components/char/alert-dialog";
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
import { Combobox } from "@/components/char/combobox";
import { DataTable } from "@/components/char/data-table";
import { Dialog } from "@/components/char/dialog";
import { EntityCard } from "@/components/char/entity-card";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import { PageHeader, PageHeaderAction } from "@/components/char/page-header";
import { SearchBar } from "@/components/char/search-bar";
import { RadioGroup, RadioGroupItem } from "@/components/char/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { Textarea } from "@/components/char/textarea";
import { Breadcrumb } from "@/components/char/breadcrumb";
import { CopyableId } from "@/components/char/copyable-id";
import { FiltersPopover } from "@/components/char/filters-popover";
import type { FilterValues } from "@/components/char/filters-popover";
import { Pagination } from "@/components/char/pagination";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/char/tabs";
import { Switch } from "@/components/char/switch";
import { toast } from "@/components/char/sonner";
import { FormInput } from "@/components/forms/FormInput";
import { FormMoneyInput } from "@/components/forms/FormMoneyInput";
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

interface DemoOption {
  id: number;
  label: string;
  group: string;
}
const DEMO_OPTIONS: DemoOption[] = [
  { id: 1, label: "Indumentaria › Blazers", group: "Indumentaria" },
  { id: 2, label: "Indumentaria › Blusas", group: "Indumentaria" },
  { id: 3, label: "Vestidos › Cortos", group: "Vestidos" },
  { id: 4, label: "Vestidos › Largos", group: "Vestidos" },
];
/** Instancia de ejemplo del `Combobox` (modo local) para el catálogo. */
function ComboboxDemo({
  initial = null,
  withCreate,
  loading,
  error,
  disabled,
}: {
  initial?: DemoOption | null;
  withCreate?: boolean;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<DemoOption | null>(initial);
  return (
    <div className="w-72">
      <Combobox<DemoOption>
        aria-label="Categoría de ejemplo"
        value={value}
        onChange={setValue}
        options={loading ? [] : DEMO_OPTIONS}
        getOptionKey={(o) => o.id}
        getOptionLabel={(o) => o.label}
        getOptionGroup={(o) => o.group}
        placeholder="Buscá una categoría"
        clearable
        loading={loading}
        error={error}
        disabled={disabled}
        onCreate={withCreate ? () => {} : undefined}
        createLabel={(q) => `Crear categoría «${q}»`}
        createButtonLabel="Nueva categoría"
        emptyMessage={(q) => `No hay categorías que coincidan con «${q}»`}
      />
    </div>
  );
}
/** Ejemplos de los campos de formulario de dinero y con prefijo (`FormMoneyInput`, `FormInput prefix`). */
function FormFieldsDemo() {
  const { control } = useForm({
    defaultValues: { price: "90.000,00", empty: "", slug: "" },
  });
  return (
    <div className="flex flex-wrap gap-6">
      <div className="w-60">
        <FormMoneyInput
          label="Precio de venta"
          name="price"
          control={control}
          required
          description="Acepta 90.000,00; se envía como 90000.00"
        />
      </div>
      <div className="w-60">
        <FormMoneyInput
          label="Precio de costo"
          name="empty"
          control={control}
        />
      </div>
      <div className="w-72">
        <FormInput
          label="Dirección (slug)"
          name="slug"
          control={control}
          prefix="/productos/"
          placeholder="vestido-largo"
        />
      </div>
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
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState("-created_at");
  const [alertVariant, setAlertVariant] =
    useState<CharAlertDialogVariant | null>(null);
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
          <Example label="magenta">
            <Button variant="magenta">Agregar</Button>
          </Example>
          <Example label="success">
            <Button variant="success">Confirmar</Button>
          </Example>
          <Example label="vivid">
            <Button variant="vivid">Auxiliar</Button>
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
        <DocSubheading>Combobox</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="con resultados agrupados (escribí «la»)">
            <ComboboxDemo />
          </Example>
          <Example label="con «+» y fila «Crear…»">
            <ComboboxDemo withCreate />
          </Example>
          <Example label="con valor elegido">
            <ComboboxDemo initial={DEMO_OPTIONS[3]} />
          </Example>
          <Example label="cargando">
            <ComboboxDemo loading />
          </Example>
          <Example label="error">
            <ComboboxDemo error="Elegí una categoría" />
          </Example>
          <Example label="disabled">
            <ComboboxDemo disabled initial={DEMO_OPTIONS[3]} />
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
        <DocSubheading>Notice</DocSubheading>
        <div className="flex max-w-xl flex-col gap-3">
          <Notice variant="info">Aviso informativo.</Notice>
          <Notice variant="success">La operación se completó.</Notice>
          <Notice variant="warning" title="Atención">
            Este producto está publicado.
          </Notice>
          <Notice variant="danger">No se pudo completar la acción.</Notice>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Tabs</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="con cantidad (← → para recorrer)">
            <Tabs defaultValue="data" className="w-96 max-w-full">
              <TabsList aria-label="Ejemplo de pestañas">
                <TabsTrigger value="data">Datos y precios</TabsTrigger>
                <TabsTrigger value="variants">
                  Variantes <Badge variant="secondary">12</Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="data">
                Contenido de datos y precios.
              </TabsContent>
              <TabsContent value="variants">
                Contenido de variantes.
              </TabsContent>
            </Tabs>
          </Example>
          <Example label="con una pestaña deshabilitada">
            <Tabs defaultValue="a" className="w-96 max-w-full">
              <TabsList aria-label="Ejemplo con pestaña deshabilitada">
                <TabsTrigger value="a">Primera</TabsTrigger>
                <TabsTrigger value="b" disabled>
                  Deshabilitada
                </TabsTrigger>
              </TabsList>
              <TabsContent value="a">Primera.</TabsContent>
            </Tabs>
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

      <div className="flex flex-col gap-3">
        <DocSubheading>Breadcrumb</DocSubheading>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/admin" },
            { label: "Usuarios", to: "/admin/users" },
            { label: "María Pérez" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>PageHeader</DocSubheading>
        <div className="flex flex-col gap-8">
          <PageHeader
            title="Usuarios"
            description="Gestioná los usuarios del sistema y sus permisos de acceso."
            actions={<Button>Nuevo usuario</Button>}
          />
          <PageHeader title="Solo título" />
          <PageHeader
            title="María Pérez"
            description="Con acción de solo ícono."
            actions={<PageHeaderAction icon={<Pencil />} label="Editar" />}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>SearchBar</DocSubheading>
        <SearchBar
          value={query}
          onValueChange={setQuery}
          placeholder="Buscar por nombre, email o usuario…"
        />
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>EntityCard</DocSubheading>
        <div className="max-w-xs">
          <EntityCard
            title="María Pérez"
            subtitle="maria.perez@char.com"
            badge={<Badge variant="success">Activo</Badge>}
            details={[
              { label: "Rol", value: "Staff" },
              { label: "Alta", value: "12/03/2025" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>AlertDialog</DocSubheading>
        <div className="flex flex-wrap gap-3">
          {(["success", "warning", "danger", "info"] as const).map((v) => (
            <Button
              key={v}
              variant="secondary"
              onClick={() => setAlertVariant(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        <AlertDialog
          open={alertVariant !== null}
          onOpenChange={(open) => !open && setAlertVariant(null)}
          variant={alertVariant ?? "info"}
          title="Título de la alerta"
          description="Descripción breve de lo que pasó o de lo que se va a hacer."
          cancelLabel="Cancelar"
        />
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>Dialog</DocSubheading>
        <div>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Abrir modal
          </Button>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Título del modal"
          description="Descripción breve de lo que se hace acá."
        >
          <p className="text-sm">Contenido del modal.</p>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>ActionsMenu</DocSubheading>
        <div>
          <ActionsMenu
            label="Acciones"
            items={[
              { label: "Editar", icon: <Pencil />, onSelect: () => {} },
              {
                label: "Eliminar",
                icon: <Trash2 />,
                onSelect: () => {},
                variant: "danger",
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>Campos de dinero y con prefijo</DocSubheading>
        <FormFieldsDemo />
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>Switch</DocSubheading>
        <div className="flex flex-wrap gap-6">
          <Example label="off">
            <Switch aria-label="Apagado" />
          </Example>
          <Example label="on">
            <Switch aria-label="Encendido" defaultChecked />
          </Example>
          <Example label="disabled">
            <Switch aria-label="Deshabilitado" disabled />
          </Example>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>FiltersPopover</DocSubheading>
        <div>
          <FiltersPopover
            filters={[
              {
                key: "status",
                type: "chips",
                label: "Estado",
                options: [
                  { value: "active", label: "Activos" },
                  { value: "inactive", label: "Inactivos" },
                ],
              },
              {
                key: "origin",
                type: "multiselect",
                label: "Origen",
                options: [
                  { value: "instagram", label: "Instagram" },
                  { value: "google", label: "Google" },
                  { value: "other", label: "Otro" },
                ],
              },
              { key: "since", type: "date", label: "Desde" },
              { key: "verified", type: "checkbox", label: "Solo verificados" },
            ]}
            value={filters}
            onChange={setFilters}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>DataTable</DocSubheading>
        <DataTable
          caption="Clientes de ejemplo"
          ordering={ordering}
          onOrderingChange={setOrdering}
          getRowKey={(row) => row.email}
          rows={[
            {
              name: "Lucía Fernández",
              email: "lucia@mail.com",
              origin: "Instagram",
            },
            {
              name: "Martín Gómez",
              email: "martin@mail.com",
              origin: "Google",
            },
          ]}
          columns={[
            {
              key: "name",
              header: "Nombre",
              sortable: true,
              cell: (row) => row.name,
            },
            {
              key: "email",
              header: "Email",
              sortable: true,
              cell: (row) => row.email,
            },
            {
              key: "origin",
              header: "Origen",
              cell: (row) => <Badge variant="outline">{row.origin}</Badge>,
            },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>Pagination</DocSubheading>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={87}
          itemLabel={{ singular: "usuario", plural: "usuarios" }}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPage(1);
            setPageSize(size);
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>StateMessage</DocSubheading>
        <div className="grid gap-4 sm:grid-cols-3">
          <StateMessage variant="loading">Cargando usuarios…</StateMessage>
          <StateMessage variant="empty">
            No se encontraron usuarios.
          </StateMessage>
          <StateMessage variant="error">
            No se pudo conectar con el servidor.
          </StateMessage>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>Skeleton</DocSubheading>
        <div role="status" className="flex max-w-xs flex-col gap-3">
          <span className="sr-only">Cargando…</span>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>CopyableId</DocSubheading>
        <div>
          <CopyableId value="PAY-8f3a1c92" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DocSubheading>Toast</DocSubheading>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast("Notificación")}>
            default
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.success("Cambios guardados")}
          >
            success
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info("Hay una novedad")}
          >
            info
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.warning("Revisá los datos")}
          >
            warning
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error("No se pudo guardar")}
          >
            error
          </Button>
        </div>
      </div>
    </DocSection>
  );
}
