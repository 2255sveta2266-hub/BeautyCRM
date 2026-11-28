import { useState } from "react";
import { StatsCards } from "../components/StatsCards";
import { AppointmentsSection } from "../components/AppointmentsSection";
import { CalendarPanel } from "../components/CalendarPanel";
import { DayPanel } from "../components/DayPanel";
import { dateKey } from "../utils/format";

export default function HomePage() {
  return (
    <>
      <section className="welcome-section" id="home">
        <div className="welcome-copy">
          <p className="welcome-kicker">РАДЫ ТЕБЯ ВИДЕТЬ</p>
          <h2>Добро пожаловать!</h2>
          <p>Управляй записями, клиентами и командой салона в одном месте.</p>
        </div>
      </section>
      <StatsCards />
    </>
  );
}

export function AppointmentsPage() {
  const [selected, setSelected] = useState(() => dateKey(new Date()));

  return (
    <div className="dashboard-grid">
      <AppointmentsSection />
      <aside className="right-column">
        <CalendarPanel selected={selected} onSelect={setSelected} />
        <DayPanel selected={selected} />
      </aside>
    </div>
  );
}
