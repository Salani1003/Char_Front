import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Combobox } from "./combobox";

interface Category {
  id: number;
  label: string;
  group: string;
}

const CATEGORIES: Category[] = [
  { id: 1, label: "Indumentaria › Blazers", group: "Indumentaria" },
  { id: 2, label: "Indumentaria › Blusas", group: "Indumentaria" },
  { id: 3, label: "Vestidos › Cortos", group: "Vestidos" },
  { id: 4, label: "Vestidos › Largos", group: "Vestidos" },
  { id: 5, label: "Vestidos › Midi", group: "Vestidos" },
  { id: 6, label: "Accesorios", group: "Accesorios" },
];

type Props = {
  initial?: Category | null;
  withCreate?: boolean;
  disabled?: boolean;
  error?: string;
  forceLoading?: boolean;
  /** Si es `true` simula una API con demora (modo remoto). */
  remote?: boolean;
};

/** Arnés: modo local, o remoto con una API simulada de 600 ms y respuestas fuera de orden descartadas. */
function Harness({
  initial = null,
  withCreate,
  disabled,
  error,
  forceLoading,
  remote,
}: Props) {
  const [value, setValue] = useState<Category | null>(initial);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Category[]>(CATEGORIES);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);

  useEffect(() => {
    if (!remote) return;
    const id = ++request.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const timer = setTimeout(() => {
      if (id !== request.current) return;
      const q = query.trim().toLowerCase();
      setOptions(CATEGORIES.filter((c) => c.label.toLowerCase().includes(q)));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [query, remote]);

  return (
    <div className="w-80">
      <Combobox<Category>
        aria-label="Categoría"
        value={value}
        onChange={setValue}
        options={remote ? options : CATEGORIES}
        getOptionKey={(c) => c.id}
        getOptionLabel={(c) => c.label}
        getOptionGroup={(c) => c.group}
        onInputChange={remote ? setQuery : undefined}
        loading={forceLoading || loading}
        placeholder="Buscá una categoría"
        clearable
        disabled={disabled}
        error={error}
        onCreate={withCreate ? (q) => alert(`Crear «${q}»`) : undefined}
        createLabel={(q) => `Crear categoría «${q}»`}
        createButtonLabel="Nueva categoría"
        emptyMessage={(q) => `No hay categorías que coincidan con «${q}»`}
      />
    </div>
  );
}

const meta = {
  title: "Char/Combobox",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Escribí "la": resultados agrupados y resaltados, con la fila "Crear…" al final. */
export const ConResultadosAgrupados: Story = { args: { withCreate: true } };
/** Escribí "zzz": mensaje de sin resultados y fila de crear. */
export const SinResultados: Story = { args: { withCreate: true } };
export const Remoto: Story = { args: { remote: true, withCreate: true } };
export const Cargando: Story = {
  args: { remote: true, forceLoading: true, initial: null },
};
export const ConValorElegido: Story = { args: { initial: CATEGORIES[3] } };
export const ConError: Story = { args: { error: "Elegí una categoría" } };
export const Deshabilitado: Story = {
  args: { disabled: true, initial: CATEGORIES[3] },
};
export const ConBotonMas: Story = { args: { withCreate: true } };
