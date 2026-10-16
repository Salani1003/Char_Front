import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/char/button";
import { SearchBar } from "@/components/char/search-bar";
import { PageHeader } from "@/components/char/page-header";
import { useDebounce } from "@/hooks/useDebounce";
import { CreateUserDialog } from "@/admin/components/CreateUserDialog";
import { UserCard } from "@/admin/components/UserCard";
import { useUsers } from "@/admin/hooks/useUsers";

export const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { data } = useUsers({ search: debouncedSearch });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios"
        description="Gestioná los usuarios del sistema y sus permisos de acceso."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Nuevo usuario
          </Button>
        }
      />
      <SearchBar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nombre, email o usuario…"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.results.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};
