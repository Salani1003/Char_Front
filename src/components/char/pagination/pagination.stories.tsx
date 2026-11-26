import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./pagination";

const meta = {
  title: "Char/Pagination",
  component: Pagination,
  parameters: { layout: "padded" },
  args: {
    page: 1,
    pageSize: 10,
    total: 87,
    onPageChange: () => {},
    onPageSizeChange: () => {},
    itemLabel: { singular: "usuario", plural: "usuarios" },
  },
  render: (args) => {
    const [page, setPage] = useState(args.page);
    const [pageSize, setPageSize] = useState(args.pageSize);
    return (
      <Pagination
        {...args}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPage(1);
          setPageSize(size);
        }}
      />
    );
  },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleResult: Story = { args: { total: 1 } };
export const Disabled: Story = { args: { disabled: true } };
