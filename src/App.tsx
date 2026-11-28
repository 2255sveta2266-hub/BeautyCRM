
import { useEffect } from "react";
import { HashRouter, Link, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { CRMProvider, useCRM } from "./context/CRMContext";
import { CRMModal } from "./components/CRMModal";
import HomePage, { AppointmentsPage } from "./pages/HomePage";
import { EntityCards } from "./components/EntityCards";
import { SectionHeading } from "./components/SectionHeading";
import { FinanceSection } from "./components/FinanceSection";
import { AnalyticsSection } from "./components/AnalyticsSection";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import type { EntityKind } from "./types";
import "./App.css";

// общая часть сайта: боковое меню, шапка и панель быстрого доступа
function Layout() {
  const { pathname } = useLocation();
  const crm = useCRM();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // открываем одну общую форму, меняется только её содержимое
  function open(kind: EntityKind) {
    crm.openForm(kind);
  }

  const links = [
    ["/", "⌂", "Главная"],
    ["/appointments", "▦", "Записи"],
    ["/clients", "♙", "Клиенты"],
    ["/masters", "✂", "Мастера"],
    ["/services", "◇", "Услуги"],
    ["/finances", "▤", "Финансы"],
    ["/analytics", "◷", "Аналитика"]
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/" className="logo">
          BeautyCRM<span>.</span>
        </Link>
        <p className="sidebar-caption">УПРАВЛЕНИЕ САЛОНОМ</p>

        <nav className="navigation">
          {links.map(([path, icon, label]) => (
            <NavLink key={path} to={path} className="nav-link">
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">СИСТЕМА УПРАВЛЕНИЯ</p>
            <h1>Панель управления</h1>
          </div>
          <div className="topbar-actions">
            <div className="profile">
              <div className="profile-avatar">А</div>
              <span>Администратор</span>
            </div>
          </div>
        </header>
        <Outlet />
      </main>

      {/* кнопки снизу вызывают те же формы, что и кнопки в разделах */}
      <nav className="quick-dock" aria-label="Быстрый доступ">
        <span className="quick-dock-title">Быстрый доступ</span>
        <button type="button" className="dock-action" onClick={() => open("appointment")}>
          <span className="dock-icon">+</span>
          <span>Новая запись</span>
        </button>
        <button type="button" className="dock-action" onClick={() => open("client")}>
          <span className="dock-icon">♙</span>
          <span>Добавить клиента</span>
        </button>
        <button type="button" className="dock-action" onClick={() => open("service")}>
          <span className="dock-icon">◇</span>
          <span>Добавить услугу</span>
        </button>
        <Link className="dock-action" to="/analytics">
          <span className="dock-icon">▥</span>
          <span>Аналитика</span>
        </Link>
      </nav>

      {crm.notice && (
        <button
          type="button"
          className="toast"
          onClick={crm.clearNotice}
          aria-label="Закрыть уведомление"
        >
          {crm.notice} ×
        </button>
      )}

      <CRMModal />
    </div>
  );
}

function CRMDataLayout() {
  const crm = useCRM();

  if (crm.loading) {
    return <section className="panel extra-section"><p className="empty-state">Загружаем данные...</p></section>;
  }

  if (crm.error) {
    return (
      <section className="panel extra-section">
        <p className="form-message" role="alert">{crm.error}</p>
        <button className="button button-primary" onClick={() => void crm.refresh()}>Повторить</button>
      </section>
    );
  }

  return <Outlet />;
}

function CatalogPage({ kind }: { kind: "master" | "service" }) {
  const heading = kind === "master"
    ? { kicker: "КОМАНДА", title: "Мастера", subtitle: "Сотрудники салона" }
    : { kicker: "КАТАЛОГ", title: "Услуги", subtitle: "Каталог услуг салона" };

  return (
    <section className="panel extra-section">
      <SectionHeading {...heading} kind={kind} />
      <EntityCards kind={kind} />
    </section>
  );
}

export default function App() {
  return (
    <HashRouter>
      <CRMProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<CRMDataLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/masters" element={<CatalogPage kind="master" />} />
              <Route path="/services" element={<CatalogPage kind="service" />} />
              <Route path="/finances" element={<FinanceSection />} />
              <Route path="/analytics" element={<AnalyticsSection />} />
            </Route>
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailsPage />} />
          </Route>
        </Routes>
      </CRMProvider>
    </HashRouter>
  );
}
