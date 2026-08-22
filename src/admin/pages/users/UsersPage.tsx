import {useUsers} from "@/admin/hooks/useUsers";

export const UsersPage = () => {
  const {data} = useUsers();

  console.log(data);

  return (
    <div>
      <h1>UsersPage</h1>
    </div>
  );
};
