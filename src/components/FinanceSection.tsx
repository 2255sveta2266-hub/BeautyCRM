import { useCRM } from "../context/CRMContext";
import { SectionHeading } from "./SectionHeading";
import { money } from "../utils/format";
import type { Appointment } from "../types";

// раздел финансов: выручка, ожидаемая выручка и средний чек
export function FinanceSection() {
  const crm = useCRM();

  // сумма цен услуг по списку записей
  const sum = (items: Appointment[]) =>
    items.reduce((acc, a) => acc + (crm.services.find((s) => s.id === a.serviceId)?.price ?? 0), 0);

  const completed = crm.appointments.filter((a) => a.status === "completed");
  const planned = crm.appointments.filter((a) => a.status === "pending" || a.status === "confirmed");
  const revenue = sum(completed);
  const average = completed.length ? Math.round(revenue / completed.length) : 0;

  const items = [
    { label: "Выручка", value: money(revenue) },
    { label: "Ожидаемая выручка", value: money(sum(planned)) },
    { label: "Средний чек", value: money(average) },
  ];

  return (
    <section className="panel extra-section" id="finances">
      <SectionHeading kicker="ФИНАНСЫ" title="Финансы" />
      <div className="analytics-grid">
        {items.map((item) => (
          <article className="analytics-item" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
