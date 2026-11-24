import { useCRM } from "../context/CRMContext";
import { nameById } from "../utils/format";

interface DayPanelProps {
  selected: string;
}

// список записей на выбранный в календаре день
export function DayPanel({ selected }: DayPanelProps) {
  const crm = useCRM();
  const dayAppointments = crm.appointments
    .filter((a) => a.date === selected && a.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section className="panel today-panel">
      <p className="section-kicker">ВЫБРАННЫЙ ДЕНЬ</p>
      <h2>{new Date(`${selected}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</h2>
      <div className="today-line">
        <span className="mini-icon">▦</span>
        <span>{dayAppointments.length} записей</span>
      </div>
      <div className="today-line">
        <span className="mini-icon">♙</span>
        <span>{new Set(dayAppointments.map((a) => a.clientId)).size} клиентов</span>
      </div>
      {dayAppointments.length ? (
        <ul className="day-list">
          {dayAppointments.map((a) => (
            <li key={a.id}>
              <strong>{a.time}</strong> {nameById(crm.clients, a.clientId, "Клиент удалён")}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">На этот день записей нет.</p>
      )}
    </section>
  );
}
