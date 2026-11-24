import { useState } from "react";
import { useCRM } from "../context/CRMContext";
import { EntityCards } from "../components/EntityCards";
import { SectionHeading } from "../components/SectionHeading";
import { StatsCards } from "../components/StatsCards";
import { AppointmentsSection } from "../components/AppointmentsSection";
import { CalendarPanel } from "../components/CalendarPanel";
import { DayPanel } from "../components/DayPanel";
import { FinanceSection } from "../components/FinanceSection";
import { AnalyticsSection } from "../components/AnalyticsSection";
import { dateKey } from "../utils/format";

// главная страница только собирает готовые компоненты, данные берут они сами из контекста
export default function HomePage() {
  const crm = useCRM();
  // выбранный день нужен и календарю, и панели дня, поэтому хранится здесь
  const [selected, setSelected] = useState(() => dateKey(new Date()));

  return (
    <>
      <section className="welcome-section" id="home">
        <div className="welcome-copy">
          <p className="welcome-kicker">РАДЫ ТЕБЯ ВИДЕТЬ</p>
          <h2>Добро пожаловать!</h2>
          <p>Управляй записями, клиентами и командой салона в одном месте.</p>
        </div>
      </section>

      {crm.loading ? (
        <section className="panel extra-section">
          <p className="empty-state">Загружаем данные...</p>
        </section>
      ) : crm.error ? (
        <section className="panel extra-section">
          <p className="form-message" role="alert">
            {crm.error}
          </p>
          <button className="button button-primary" onClick={() => void crm.refresh()}>
            Повторить
          </button>
        </section>
      ) : (
        <>
          <StatsCards />

          <div className="dashboard-grid">
            <AppointmentsSection />
            <aside className="right-column">
              <CalendarPanel selected={selected} onSelect={setSelected} />
              <DayPanel selected={selected} />
            </aside>
          </div>

          <section className="panel extra-section" id="clients">
            <SectionHeading kicker="КЛИЕНТСКАЯ БАЗА" title="Клиенты" subtitle="Клиенты твоего салона" kind="client" />
            <EntityCards kind="client" />
          </section>

          <section className="panel extra-section" id="masters">
            <SectionHeading kicker="КОМАНДА" title="Мастера" subtitle="Сотрудники салона" kind="master" />
            <EntityCards kind="master" />
          </section>

          <section className="panel extra-section" id="services">
            <SectionHeading kicker="КАТАЛОГ" title="Услуги" subtitle="Каталог услуг салона" kind="service" />
            <EntityCards kind="service" />
          </section>

          <FinanceSection />
          <AnalyticsSection />
        </>
      )}
    </>
  );
}
