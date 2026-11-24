import { useMemo, useState } from "react";
import { useCRM } from "../context/CRMContext";
import { SectionHeading } from "./SectionHeading";
import { AppointmentsTable } from "./AppointmentsTable";
import { statusLabels, nameById } from "../utils/format";
import type { AppointmentStatus } from "../types";

// кнопки фильтра по статусу
const filters = [
  ["all", "Все"],
  ["confirmed", "Подтверждены"],
  ["pending", "Ожидают"],
  ["completed", "Завершены"],
  ["cancelled", "Отменены"],
] as const;

type StatusFilter = "all" | AppointmentStatus;
type SortOrder = "asc" | "desc";

// раздел записей: заголовок, поиск, фильтр, сортировка и таблица
export function AppointmentsSection() {
  const crm = useCRM();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOrder>("asc");

  // сначала применяем фильтр и поиск, потом сортируем записи по дате
  const visible = useMemo(() => {
    const query = search.toLowerCase();
    return crm.appointments
      .filter((a) => filter === "all" || a.status === filter)
      .filter((a) => {
        const text = [
          nameById(crm.clients, a.clientId, "Клиент удалён"),
          nameById(crm.masters, a.masterId, "Мастер удалён"),
          nameById(crm.services, a.serviceId, "Услуга удалена"),
          statusLabels[a.status],
        ].join(" ");
        return text.toLowerCase().includes(query);
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) * (sort === "asc" ? 1 : -1));
  }, [crm.appointments, crm.clients, crm.masters, crm.services, filter, search, sort]);

  return (
    <section className="panel appointments-section" id="appointments">
      <SectionHeading kicker="РАСПИСАНИЕ" title="Записи" subtitle="Предстоящие визиты клиентов" kind="appointment" />

      <div className="toolbar">
        <div className="chips">
          {filters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`chip ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="sort-box">
          Сортировка{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
            <option value="asc">Сначала ранние</option>
            <option value="desc">Сначала поздние</option>
          </select>
        </label>
      </div>

      <div className="toolbar">
        <input
          className="crm-search"
          type="search"
          placeholder="Поиск по записям..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AppointmentsTable appointments={visible} />
    </section>
  );
}
