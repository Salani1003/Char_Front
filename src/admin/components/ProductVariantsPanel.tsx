import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { AlertDialog } from "@/components/char/alert-dialog";
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
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import { RadioGroup, RadioGroupItem } from "@/components/char/radio-group";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { toast } from "@/components/char/sonner";
import { useAllColors } from "../hooks/useColors";
import { useCreateProductVariant } from "../hooks/useProductVariantMutations";
import { useAllSizes } from "../hooks/useSizes";
import type { Color } from "../interfaces/color.interface";
import type { ProductVariantItem } from "../interfaces/product.interface";
import type { Size } from "../interfaces/size.interface";
import {
  buildVariantPreview,
  createVariantsSequentially,
  groupSizes,
  type VariantCreateResult,
} from "../utils/variantPlan";
import { ColorCreateDialog } from "./ColorCreateDialog";
import { SizeCreateDialog } from "./SizeCreateDialog";
import { VariantColor } from "./VariantColor";

const variantsText = (count: number) =>
  `${count} ${count === 1 ? "variante" : "variantes"}`;

/**
 * Panel "Agregar variantes" de un producto: va **dentro de la página**, arriba
 * de la tabla (no es un modal). Pasos: 1) un color (selección única) con
 * "+ Nuevo color"; 2) uno o varios talles agrupados en "Letras" y "Números"
 * con "+ Nuevo talle"; 3) vista previa calculada en el front
 * (`buildVariantPreview`) que marca cada combinación como **Nueva** o
 * **"Ya existe · se omite"** (estas no se envían).
 *
 * - **Crear**: un `POST /product-variants/` por combinación nueva, **de a uno y
 *   en orden** (`createVariantsSequentially`), con progreso "Creando 2 de 3…".
 *   Si alguno falla sigue con los demás y el panel queda abierto con un
 *   resumen (creadas con su SKU, fallidas con el mensaje del backend); las
 *   fallidas quedan marcadas en la vista previa y "Crear" reintenta solo las
 *   pendientes. Si todo sale bien se cierra y avisa "Se crearon N variantes".
 * - **Color y talle nuevos**: abren su modal (uno a la vez) y lo creado queda
 *   elegido/tildado sin perder el resto de la selección. Solo con `add_color`
 *   / `add_size`.
 * - **Permisos**: sin `view_color` / `view_size` no se puede armar y se avisa.
 * - **Cerrar** con elecciones sin crear pide confirmación.
 *
 * @param productId Producto al que se agregan las variantes.
 * @param existing Variantes que el producto ya tiene (para la vista previa).
 * @param onClose Cierra el panel (después de crear o de confirmar el descarte).
 */
export function ProductVariantsPanel({
  productId,
  existing,
  onClose,
}: {
  productId: number;
  existing: readonly ProductVariantItem[];
  onClose: () => void;
}) {
  const uid = useId();
  const can = useCan();
  const canViewColors = can(PERMISSIONS.products.color.view);
  const canViewSizes = can(PERMISSIONS.products.size.view);
  const canAddColor = can(PERMISSIONS.products.color.add);
  const canAddSize = can(PERMISSIONS.products.size.add);
  const colors = useAllColors({ enabled: canViewColors });
  const sizes = useAllSizes({ enabled: canViewSizes });
  const { mutateAsync: createVariant } = useCreateProductVariant();

  const [colorId, setColorId] = useState<number | null>(null);
  const [sizeIds, setSizeIds] = useState<number[]>([]);
  const [dialog, setDialog] = useState<"color" | "size" | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [lastResults, setLastResults] = useState<VariantCreateResult[]>([]);
  const [createdBefore, setCreatedBefore] = useState(0);

  const running = progress !== null;
  const preview = buildVariantPreview(
    colorId,
    sizeIds,
    existing,
    colors.data ?? [],
    sizes.data ?? [],
  );
  const failures = new Map(
    lastResults.flatMap((r) => (r.ok ? [] : [[r.item.key, r.message]])),
  );
  const createdNow = lastResults.filter((r) => r.ok);
  const hasChoices = colorId !== null || sizeIds.length > 0;
  const toCreateCount = preview.toCreate.length;

  const requestClose = () => {
    if (running) return;
    if (hasChoices) setConfirmClose(true);
    else onClose();
  };

  const toggleSize = (id: number, checked: boolean) =>
    setSizeIds((current) =>
      checked ? [...current, id] : current.filter((s) => s !== id),
    );

  const submit = async () => {
    setLastResults([]);
    const results = await createVariantsSequentially(
      preview.toCreate,
      (item) =>
        createVariant({
          product: productId,
          color: item.colorId,
          size: item.sizeId,
        }),
      (current, total) => setProgress({ current, total }),
    );
    setProgress(null);
    const created = createdBefore + results.filter((r) => r.ok).length;
    if (results.every((r) => r.ok)) {
      toast.success(`Se crearon ${variantsText(created)}`);
      onClose();
      return;
    }
    setCreatedBefore(created);
    setLastResults(results);
  };

  const sizeGroups = groupSizes(sizes.data ?? []);

  const renderSizeGroup = (title: string, group: Size[]) =>
    group.length === 0 ? null : (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
          {group.map((size) => {
            const id = `${uid}-size-${size.id}`;
            return (
              <div key={size.id} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={sizeIds.includes(size.id)}
                  disabled={running}
                  onCheckedChange={(checked) => toggleSize(size.id, checked)}
                />
                <Label htmlFor={id} className="cursor-pointer">
                  {size.name}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    );

  const renderColors = (list: Color[]) => (
    <RadioGroup
      aria-labelledby={`${uid}-color-legend`}
      value={colorId === null ? "" : String(colorId)}
      onValueChange={(value) => setColorId(Number(value))}
      disabled={running}
      className="flex flex-wrap gap-x-6 gap-y-2.5"
    >
      {list.map((color) => {
        const id = `${uid}-color-${color.id}`;
        return (
          <div key={color.id} className="flex items-center gap-2">
            <RadioGroupItem id={id} value={String(color.id)} />
            <Label htmlFor={id} className="cursor-pointer">
              {color.hex ? (
                <VariantColor name={color.name} hex={color.hex} />
              ) : (
                color.name
              )}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Agregar variantes</CardTitle>
            <CardDescription>
              Elegí un color y uno o varios talles.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar panel de variantes"
            disabled={running}
            onClick={requestClose}
          >
            <X />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend
            id={`${uid}-color-legend`}
            className="mb-1 text-sm font-medium"
          >
            1. Color (uno por vez)
          </legend>
          {!canViewColors ? (
            <Notice variant="warning">
              No tenés permiso para ver colores.
            </Notice>
          ) : colors.isPending ? (
            <Skeleton className="h-8 w-full" />
          ) : colors.error ? (
            <StateMessage
              variant="error"
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void colors.refetch()}
                >
                  Reintentar
                </Button>
              }
            >
              No se pudieron cargar los colores.
            </StateMessage>
          ) : colors.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay colores cargados.
            </p>
          ) : (
            renderColors(colors.data)
          )}
          {canAddColor && canViewColors ? (
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={running}
                onClick={() => setDialog("color")}
              >
                <Plus /> Nuevo color
              </Button>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">
            2. Talles (uno o varios)
          </legend>
          {!canViewSizes ? (
            <Notice variant="warning">No tenés permiso para ver talles.</Notice>
          ) : sizes.isPending ? (
            <Skeleton className="h-8 w-full" />
          ) : sizes.error ? (
            <StateMessage
              variant="error"
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void sizes.refetch()}
                >
                  Reintentar
                </Button>
              }
            >
              No se pudieron cargar los talles.
            </StateMessage>
          ) : sizes.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay talles cargados.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {renderSizeGroup("Letras", sizeGroups.letters)}
              {renderSizeGroup("Números", sizeGroups.numbers)}
            </div>
          )}
          {canAddSize && canViewSizes ? (
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={running}
                onClick={() => setDialog("size")}
              >
                <Plus /> Nuevo talle
              </Button>
            </div>
          ) : null}
        </fieldset>

        <section aria-live="polite" className="flex flex-col gap-3">
          <h3 className="font-sans text-sm font-medium">Vista previa</h3>
          {preview.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no elegiste color ni talles. Elegí un color y al menos un
              talle para ver qué variantes se van a crear.
            </p>
          ) : (
            <>
              <p className="text-sm">
                {toCreateCount === 0
                  ? "No hay variantes nuevas para crear."
                  : `Se van a crear ${variantsText(toCreateCount)}`}
              </p>
              <ul className="flex flex-col gap-2">
                {preview.items.map((item) => {
                  const failure = failures.get(item.key);
                  return (
                    <li
                      key={item.key}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span>{item.label}</span>
                      {item.status === "exists" ? (
                        <Badge variant="secondary">Ya existe · se omite</Badge>
                      ) : failure ? (
                        <Badge variant="danger">No se pudo crear</Badge>
                      ) : (
                        <Badge variant="success">Nueva</Badge>
                      )}
                      {failure && item.status === "new" ? (
                        <span className="text-danger">{failure}</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <p className="text-sm text-muted-foreground">
            El SKU (CHAR-0004, CHAR-0005…) lo asigna el sistema al guardar.
          </p>
        </section>

        {lastResults.length > 0 ? (
          <Notice
            variant="warning"
            title={`Se crearon ${createdNow.length} de ${lastResults.length}`}
          >
            <ul className="flex flex-col gap-1">
              {createdNow.map((r) => (
                <li key={r.item.key}>
                  {r.item.label} · {r.ok ? r.sku : ""}
                </li>
              ))}
              {lastResults.flatMap((r) =>
                r.ok
                  ? []
                  : [
                      <li key={r.item.key}>
                        {r.item.label}: {r.message}
                      </li>,
                    ],
              )}
            </ul>
            Podés reintentar solo las que faltan con «Crear».
          </Notice>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {progress ? (
          <p role="status" className="text-sm text-muted-foreground sm:mr-auto">
            Creando {progress.current} de {progress.total}…
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={running}
          onClick={requestClose}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={running || toCreateCount === 0}
          onClick={() => void submit()}
        >
          {toCreateCount === 0
            ? "Crear variantes"
            : `Crear ${variantsText(toCreateCount)}`}
        </Button>
      </CardFooter>

      <ColorCreateDialog
        open={dialog === "color"}
        onOpenChange={(open) => !open && setDialog(null)}
        onCreated={(color) => setColorId(color.id)}
      />
      <SizeCreateDialog
        open={dialog === "size"}
        onOpenChange={(open) => !open && setDialog(null)}
        onCreated={(size) =>
          setSizeIds((current) =>
            current.includes(size.id) ? current : [...current, size.id],
          )
        }
      />
      <AlertDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        variant="warning"
        title="¿Cerrar sin crear?"
        description="Si cerrás ahora se pierde lo que elegiste."
        confirmLabel="Cerrar"
        cancelLabel="Seguir editando"
        onConfirm={onClose}
      />
    </Card>
  );
}
