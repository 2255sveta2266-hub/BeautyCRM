import { useCRM } from "../context/CRMContext";
import { SectionHeading } from "./SectionHeading";

// цвета для круговой диаграммы
const colors = ["#9A603C", "#D9B18D", "#5E361F", "#C99C76", "#B77A4D", "#8A6749"];

// раздел аналитики: общие числа и популярные услуги
export function AnalyticsSection() {
  const crm = useCRM();

  // считаем, сколько раз каждая услуга есть в неотменённых записях
  const popular = crm.services
    .map((s) => ({ name: s.name, count: crm.appointments.filter((a) => a.serviceId === s.id && a.status !== "cancelled").length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const total = popular.reduce((s, x) => s + x.count, 0);

  // собираем градиент для диаграммы
  let progress = 0;
  const gradient = popular
    .map((x, i) => {
      const from = progress;
      progress += (x.count / total) * 100;
      return `${colors[i]} ${from}% ${progress}%`;
    })
    .join(", ");

  const items = [
    { label: "Всего записей", value: crm.appointments.length },
    { label: "Клиенты", value: crm.clients.length },
    { label: "Услуги", value: crm.services.length },
  ];

  return (
    <section className="panel extra-section" id="analytics">
      <SectionHeading kicker="ПОКАЗАТЕЛИ" title="Аналитика" />
      <div className="analytics-grid">
        {items.map((item) => (
          <article className="analytics-item" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <h3 className="subheading">Популярные услуги</h3>
      {popular.length ? (
        <div className="pie-block">
          <div className="pie" style={{ background: `conic-gradient(${gradient})` }} />
          <ul className="pie-legend">
            {popular.map((x, i) => (
              <li key={x.name}>
                <span className="legend-color" style={{ background: colors[i] }} />
                <span className="legend-name">{x.name}</span>
                <span className="legend-value">
                  {x.count} · {Math.round((x.count / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="empty-state">Данных для аналитики пока недостаточно.</p>
      )}
    </section>
  );
}
