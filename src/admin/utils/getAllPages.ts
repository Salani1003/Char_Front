import { charApi } from "@/lib/charApi";
import type { Paginated } from "../interfaces/paginated.interface";
import { toSearchParams, type QueryParamValue } from "./toSearchParams";

/** Máximo de resultados por página que admite el backend. */
export const MAX_PAGE_SIZE = 100;

/**
 * Trae TODOS los resultados de un listado paginado de DRF: pide la página 1
 * con `page_size` y sigue pidiendo la siguiente mientras `next` exista.
 * Devuelve los resultados concatenados **en el orden de la API** (nunca los
 * reordena). Pensado para catálogos chicos (colores, talles); para los
 * grandes usar `?search=`.
 *
 * @param url Ruta relativa a `VITE_API_URL` (ej. `/colors/`).
 * @param params Filtros extra (`search`, `brand`…); los vacíos no se envían.
 * @param pageSize Tamaño de página (por defecto 100; uno chico sirve para
 * probar el recorrido con pocos datos).
 */
export async function getAllPages<T>(
  url: string,
  params: Record<string, QueryParamValue> = {},
  pageSize: number = MAX_PAGE_SIZE,
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  for (;;) {
    const query = toSearchParams({ ...params, page_size: pageSize, page });
    const { data } = await charApi.get<Paginated<T>>(url, { params: query });
    results.push(...data.results);
    if (!data.next) return results;
    page += 1;
  }
}
