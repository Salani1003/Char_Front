import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "./data-table";
import type { DataTableColumn } from "./data-table";

interface Row {
  id: number;
  name: string;
  email: string;
  origin: string;
}

const ROWS: Row[] = [
  {
    id: 1,
    name: "Lucía Fernández",
    email: "lucia@mail.com",
    origin: "Instagram",
  },
  { id: 2, name: "Martín Gómez", email: "martin@mail.com", origin: "Google" },
  {
    id: 3,
    name: "Sofía Ramos",
    email: "sofia@mail.com",
    origin: "Local físico",
  },
];

const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "Nombre", sortable: true, cell: (row) => row.name },
  { key: "email", header: "Email", sortable: true, cell: (row) => row.email },
  { key: "origin", header: "Origen", cell: (row) => row.origin },
];

const meta = {
  title: "Char/DataTable",
  component: DataTable<Row>,
  parameters: { layout: "padded" },
  args: {
    caption: "Listado de ejemplo",
    columns: COLUMNS,
    rows: ROWS,
    getRowKey: (row) => row.id,
    ordering: "name",
  },
  render: (args) => {
    const [ordering, setOrdering] = useState(args.ordering);
    return (
      <DataTable {...args} ordering={ordering} onOrderingChange={setOrdering} />
    );
  },
} satisfies Meta<typeof DataTable<Row>>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Clic en un encabezado ordenable: asc → desc (`-campo`). */
export const Default: Story = {};
export const Loading: Story = { args: { loading: true, skeletonRows: 4 } };
export const Dimmed: Story = { args: { dimmed: true } };
