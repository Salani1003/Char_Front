// El diseño que tengan todas las paginas que pasen por pantallas de administracion

import {Outlet} from "react-router";

const CharAdminLayout = () => {
  return (
    <div>
      CharAdminLayout
      <Outlet />
    </div>
  );
};

export default CharAdminLayout;
