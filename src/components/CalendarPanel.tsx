import { useState } from "react";
import { useCRM } from "../context/CRMContext";
import { dateKey } from "../utils/format";

interface CalendarPanelProps {
  selected: string;
  onSelect: (date: string) => void;
}

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// календарь месяца, дни с записями подсвечиваются
export function CalendarPanel({ selected, onSelect }: CalendarPanelProps) {
  const crm = useCRM();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const today = dateKey(new Date());

  // календарь всегда начинается с понедельника и показывает шесть недель
  const offset = (visibleMonth.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, i) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), i - offset + 1));
  const monthLabel = visibleMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  // сдвиг на месяц назад или вперёд
  const shiftMonth = (step: number) => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + step, 1));

  return (
    <section className="panel calendar-panel">
      <div className="calendar-heading">
        <div>
          <p className="section-kicker">ПЛАНИРОВАНИЕ</p>
          <h2>{monthLabel}</h2>
        </div>
        <div className="calendar-controls">
          <button type="button" aria-label="Предыдущий месяц" onClick={() => shiftMonth(-1)}>
            ‹
          </button>
          <button type="button" aria-label="Следующий месяц" onClick={() => shiftMonth(1)}>
            ›
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((d) => {
          const key = dateKey(d);
          const hasAppointments = crm.appointments.some((a) => a.date === key && a.status !== "cancelled");
          const className = [
            d.getMonth() !== visibleMonth.getMonth() ? "outside-month" : "",
            key === today ? "today" : "",
            key === selected ? "selected" : "",
            hasAppointments ? "has-appointments" : "",
          ].join(" ");
          return (
            <button key={key} type="button" className={className} onClick={() => onSelect(key)}>
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span /> Есть записи
      </div>
    </section>
  );
}
