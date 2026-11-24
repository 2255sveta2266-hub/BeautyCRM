import type { AppointmentStatus } from "../types";

// подписи статусов, которые показываем в таблице
export const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
};

// css-классы статусов
export const statusClasses: Record<AppointmentStatus, string> = {
  pending: "pending",
  confirmed: "confirmed",
  completed: "done",
  cancelled: "cancelled",
};

// дата в формате год-месяц-день, так её удобно сравнивать с датами записей
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// цена с пробелами и знаком рубля
export function money(n: number): string {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

// ищем имя по id, если объект уже удалили, показываем запасной текст
export function nameById(list: { id: number; name: string }[], id: number, fallback: string): string {
  return list.find((item) => item.id === id)?.name ?? fallback;
}
