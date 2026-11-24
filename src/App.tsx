
import { useEffect, useState } from "react";
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CRMProvider, useCRM } from "./context/CRMContext";
import { CRMModal } from "./components/CRMModal";
import HomePage from "./pages/HomePage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import type { EntityKind } from "./types";
import "./App.css";

// общая часть сайта: боковое меню, шапка и панель быстрого доступа
function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const crm = useCRM();
  const [active, setActive] = useState("home");

  // после перехода по пункту меню прокручиваем страницу к нужному разделу
  useEffect(() => {
    if (location.pathname !== "/") return;
    const id = location.hash.slice(1) || "home";
    const jump = () => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      setActive(id);
    };
    const timer = window.setTimeout(jump, crm.loading ? 150 : 40);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash, crm.loading]);

  // эта функция нужна для меню, чтобы не открывать отдельные страницы
  function go(id: string) {
    if (location.pathname === "/" && location.hash === `#${id}`) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setActive(id);
    } else {
      navigate(id === "home" ? "/" : `/#${id}`);
    }
  }

  // открываем одну общую форму, меняется только её содержимое
  function open(kind: EntityKind) {
    crm.openForm(kind);
  }

  const links = [
    ["home", "⌂", "Главная"],
    ["appointments", "▦", "Записи"],
    ["clients", "♙", "Клиенты"],
    ["masters", "✂", "Мастера"],
    ["services", "◇", "Услуги"],
    ["finances", "▤", "Финансы"],
    ["analytics", "◷", "Аналитика"]
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/" className="logo">
          BeautyCRM<span>.</span>
        </Link>
        <p className="sidebar-caption">УПРАВЛЕНИЕ САЛОНОМ</p>

        <nav className="navigation">
          {links.map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              className={`nav-link ${location.pathname === "/" && active === id ? "active" : ""}`}
              onClick={() => go(id)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </button>
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
        <button type="button" className="dock-action" onClick={() => go("analytics")}>
          <span className="dock-icon">▥</span>
          <span>Аналитика</span>
        </button>
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

// маршруты нужны для главной страницы, списка и отдельной карточки клиента
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <CRMProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailsPage />} />
          </Route>
        </Routes>
      </CRMProvider>
    </BrowserRouter>
  );
}
