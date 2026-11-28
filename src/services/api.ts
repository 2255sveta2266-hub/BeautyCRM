import type { Client, Master, Service, Appointment } from "../types";
// адрес api можно поменять через переменную VITE_API_URL, по умолчанию локальный json-server
const BASE: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
// общая функция для http-запросов, чтобы не повторять fetch в каждом разделе
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(BASE + path, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } }); }
  catch { throw new Error("Нет соединения с API. Проверь, что json-server запущен (npm run api)."); }
  if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
  if (response.status === 204) return undefined as T;
  const raw = await response.text();
  return (raw ? JSON.parse(raw) : undefined) as T;
}
// у всех четырёх сущностей одинаковые операции: получить, добавить, изменить и удалить
function resource<T extends {id: number}>(path: string) {
  return {
    getAll: () => request<T[]>(path),
    getById: (id: number) => request<T>(`${path}/${id}`),
    create: (data: Omit<T, "id">) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Omit<T, "id">>) => request<T>(`${path}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`${path}/${id}`, { method: "DELETE" }),
  };
}
export const clientsApi = resource<Client>("/clients");
export const mastersApi = resource<Master>("/masters");
export const servicesApi = resource<Service>("/services");
export const appointmentsApi = resource<Appointment>("/appointments");
