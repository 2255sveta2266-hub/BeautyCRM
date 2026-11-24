import { useCRM } from "../context/CRMContext";
import { dateKey } from "../utils/format";

// четыре карточки со статистикой салона
export function StatsCards() {
  const crm = useCRM();
  const today = dateKey(new Date());
  const todays = crm.appointments.filter((a) => a.date === today && a.status !== "cancelled");

  const stats = [
    { title: "Клиенты", value: crm.clients.length, icon: "♙", note: "Клиентская база" },
    { title: "Записи на сегодня", value: todays.length, icon: "▦", note: "Запланированные визиты" },
    { title: "Мастера", value: crm.masters.length, icon: "✂", note: "В команде салона" },
    { title: "Услуги", value: crm.services.length, icon: "◇", note: "В каталоге" },
  ];

  return (
    <section className="stats-section">
      {stats.map((stat) => (
        <article className="stat-card" key={stat.title}>
          <div className="stat-top">
            <span>{stat.title}</span>
            <span className="stat-icon">{stat.icon}</span>
          </div>
          <h2>{stat.value}</h2>
          <p className="stat-note">{stat.note}</p>
        </article>
      ))}
    </section>
  );
}
