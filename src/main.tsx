import {StrictMode, Suspense} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import {CharApp} from "./CharApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <CharApp />
    </Suspense>
  </StrictMode>,
);
