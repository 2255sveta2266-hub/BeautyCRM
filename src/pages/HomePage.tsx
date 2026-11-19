import { useMemo, useState } from "react";
import { useCRM } from "../context/CRMContext";
import { EntityCards } from "../components/EntityCards";
import type { AppointmentStatus } from "../types";
// подписи статусов, которые показываем в таблице
const labels: Record<AppointmentStatus,string> = {pending:"Ожидает",confirmed:"Подтверждена",completed:"Завершена",cancelled:"Отменена"};
const classes: Record<AppointmentStatus,string> = {pending:"pending",confirmed:"confirmed",completed:"done",cancelled:"cancelled"};
// дата в формате год-месяц-день, так её удобно сравнивать с датами записей
const dateKey = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const money = (n:number) => `${n.toLocaleString("ru-RU")} ₽`;
// главная страница собирает статистику из данных, загруженных с api
export default function HomePage() {
  const crm = useCRM();
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState<"all"|AppointmentStatus>("all");
  const [sort,setSort] = useState<"asc"|"desc">("asc");
  const [visibleMonth,setVisibleMonth] = useState(() => new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const [selected,setSelected] = useState(() => dateKey(new Date()));
  const [actionError,setActionError] = useState("");
  const today = dateKey(new Date());
  const todays = crm.appointments.filter(a=>a.date===today && a.status!=="cancelled");
  const client = (id:number) => crm.clients.find(x=>x.id===id)?.name ?? "Клиент удалён";
  const master = (id:number) => crm.masters.find(x=>x.id===id)?.name ?? "Мастер удалён";
  const service = (id:number) => crm.services.find(x=>x.id===id)?.name ?? "Услуга удалена";
  // сначала применяем фильтр и поиск, потом сортируем записи по дате
  const appointments = useMemo(() => crm.appointments.filter(a=>filter==="all"||a.status===filter).filter(a=>`${client(a.clientId)} ${master(a.masterId)} ${service(a.serviceId)} ${labels[a.status]}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time)*(sort==="asc"?1:-1)),[crm.appointments,crm.clients,crm.masters,crm.services,filter,search,sort]);
  const completed = crm.appointments.filter(a=>a.status==="completed");
  const planned = crm.appointments.filter(a=>a.status==="pending"||a.status==="confirmed");
  const sum = (items: typeof crm.appointments) => items.reduce((acc,a)=>acc+(crm.services.find(s=>s.id===a.serviceId)?.price ?? 0),0);
  const revenue = sum(completed);
  const selectedAppointments = crm.appointments.filter(a=>a.date===selected && a.status!=="cancelled").sort((a,b)=>a.time.localeCompare(b.time));
  // календарь всегда начинается с понедельника и показывает шесть недель
  const offset = (visibleMonth.getDay()+6)%7;
  const days = Array.from({length:42},(_,i)=>new Date(visibleMonth.getFullYear(),visibleMonth.getMonth(),i-offset+1));
  const monthLabel = visibleMonth.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
  const popular = crm.services.map(s=>({name:s.name,count:crm.appointments.filter(a=>a.serviceId===s.id&&a.status!=="cancelled").length})).filter(s=>s.count>0).sort((a,b)=>b.count-a.count).slice(0,6);
  const colors = ["#9A603C","#D9B18D","#5E361F","#C99C76","#B77A4D","#8A6749"];
  const total = popular.reduce((s,x)=>s+x.count,0);
  let progress=0;
  const gradient = popular.map((x,i)=>{const from=progress;progress+=x.count/total*100;return `${colors[i]} ${from}% ${progress}%`;}).join(", ");
  // удаление записи с подтверждением
  async function removeAppointment(id:number) { if (!window.confirm("Удалить запись?"))return; try {setActionError("");await crm.remove("appointment",id);}catch(e){setActionError(e instanceof Error?e.message:"Ошибка удаления.");} }
  // по нажатию на статус переключаем его на следующий
  async function cycleStatus(id:number,status:AppointmentStatus) { const seq:AppointmentStatus[]=["pending","confirmed","completed","cancelled"];try {setActionError("");await crm.save("appointment",{status:seq[(seq.indexOf(status)+1)%seq.length]},id);}catch(e){setActionError(e instanceof Error?e.message:"Ошибка изменения статуса.");} }
  // одинаковая шапка разделов, чтобы не повторять одну и ту же разметку
  const sectionHeading=(kicker:string,title:string,subtitle:string,kind?:"client"|"master"|"service"|"appointment")=><div className="section-heading"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{kind && <button type="button" className="button button-primary" onClick={()=>crm.openForm(kind)}>+ {kind==="client"?"Добавить клиента":kind==="master"?"Добавить мастера":kind==="service"?"Добавить услугу":"Новая запись"}</button>}</div>;
  return <>
    <section className="welcome-section" id="home"><div className="welcome-copy"><p className="welcome-kicker">РАДЫ ТЕБЯ ВИДЕТЬ</p><h2>Добро пожаловать!</h2><p>Управляй записями, клиентами и командой салона в одном месте.</p></div></section>
    {crm.loading ? <section className="panel extra-section"><p className="empty-state">Загружаем данные...</p></section> : crm.error ? <section className="panel extra-section"><p className="form-message" role="alert">{crm.error}</p><button className="button button-primary" onClick={()=>void crm.refresh()}>Повторить</button></section> : <>
      <section className="stats-section">{[["Клиенты",crm.clients.length,"♙","Клиентская база"],["Записи на сегодня",todays.length,"▦","Запланированные визиты"],["Мастера",crm.masters.length,"✂","В команде салона"],["Услуги",crm.services.length,"◇","В каталоге"]].map(([title,value,icon,note])=><article className="stat-card" key={title}><div className="stat-top"><span>{title}</span><span className="stat-icon">{icon}</span></div><h2>{value}</h2><p className="stat-note">{note}</p></article>)}</section>
      <div className="dashboard-grid"><section className="panel appointments-section" id="appointments">{sectionHeading("РАСПИСАНИЕ","Записи","Предстоящие визиты клиентов","appointment")}<div className="toolbar"><div className="chips">{([ ["all","Все"],["confirmed","Подтверждены"],["pending","Ожидают"],["completed","Завершены"],["cancelled","Отменены"] ] as const).map(([key,label])=><button key={key} type="button" className={`chip ${filter===key?"active":""}`} onClick={()=>setFilter(key)}>{label}</button>)}</div><label className="sort-box">Сортировка <select value={sort} onChange={e=>setSort(e.target.value as "asc"|"desc")}><option value="asc">Сначала ранние</option><option value="desc">Сначала поздние</option></select></label></div><div className="toolbar"><input className="crm-search" type="search" placeholder="Поиск по записям..." value={search} onChange={e=>setSearch(e.target.value)}/></div>{actionError && <p className="form-message" role="alert">{actionError}</p>}<div className="table-wrapper"><table><thead><tr><th>Дата и время</th><th>Клиент</th><th>Услуга</th><th>Мастер</th><th>Статус</th><th>Действия</th></tr></thead><tbody>{appointments.length===0?<tr><td colSpan={6}><p className="empty-state">{crm.appointments.length?"Записей по фильтру нет.":"Записей пока нет. Создай первую запись."}</p></td></tr>:appointments.map(a=><tr key={a.id}><td>{new Date(`${a.date}T00:00:00`).toLocaleDateString("ru-RU")} · {a.time}</td><td>{client(a.clientId)}</td><td>{service(a.serviceId)}</td><td>{master(a.masterId)}</td><td><button type="button" title="Сменить статус" className={`status ${classes[a.status]}`} onClick={()=>void cycleStatus(a.id,a.status)}>{labels[a.status]}</button></td><td className="row-actions"><button type="button" className="icon-button" title="Изменить" onClick={()=>crm.openForm("appointment",a.id)}>✎</button><button type="button" className="icon-button danger" title="Удалить" onClick={()=>void removeAppointment(a.id)}>×</button></td></tr>)}</tbody></table></div></section>
      <aside className="right-column"><section className="panel calendar-panel"><div className="calendar-heading"><div><p className="section-kicker">ПЛАНИРОВАНИЕ</p><h2>{monthLabel}</h2></div><div className="calendar-controls"><button type="button" aria-label="Предыдущий месяц" onClick={()=>setVisibleMonth(new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()-1,1))}>‹</button><button type="button" aria-label="Следующий месяц" onClick={()=>setVisibleMonth(new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()+1,1))}>›</button></div></div><div className="calendar-weekdays">{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d=><span key={d}>{d}</span>)}</div><div className="calendar-days">{days.map(d=>{const key=dateKey(d);return <button key={key} type="button" className={[d.getMonth()!==visibleMonth.getMonth()?"outside-month":"",key===today?"today":"",key===selected?"selected":"",crm.appointments.some(a=>a.date===key&&a.status!=="cancelled")?"has-appointments":""].join(" ")} onClick={()=>setSelected(key)}>{d.getDate()}</button>;})}</div><div className="calendar-legend"><span/> Есть записи</div></section><section className="panel today-panel"><p className="section-kicker">ВЫБРАННЫЙ ДЕНЬ</p><h2>{new Date(`${selected}T00:00:00`).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}</h2><div className="today-line"><span className="mini-icon">▦</span><span>{selectedAppointments.length} записей</span></div><div className="today-line"><span className="mini-icon">♙</span><span>{new Set(selectedAppointments.map(a=>a.clientId)).size} клиентов</span></div>{selectedAppointments.length?<ul className="day-list">{selectedAppointments.map(a=><li key={a.id}><strong>{a.time}</strong> {client(a.clientId)}</li>)}</ul>:<p className="empty-state">На этот день записей нет.</p>}</section></aside></div>
      <section className="panel extra-section" id="clients">{sectionHeading("КЛИЕНТСКАЯ БАЗА","Клиенты","Клиенты твоего салона","client")}<EntityCards kind="client" /></section>
      <section className="panel extra-section" id="masters">{sectionHeading("КОМАНДА","Мастера","Сотрудники салона","master")}<EntityCards kind="master" /></section>
      <section className="panel extra-section" id="services">{sectionHeading("КАТАЛОГ","Услуги","Каталог услуг салона","service")}<EntityCards kind="service" /></section>
      <section className="panel extra-section" id="finances">{sectionHeading("ФИНАНСЫ","Финансы","")}<div className="analytics-grid"><article className="analytics-item"><span>Выручка</span><strong>{money(revenue)}</strong></article><article className="analytics-item"><span>Ожидаемая выручка</span><strong>{money(sum(planned))}</strong></article><article className="analytics-item"><span>Средний чек</span><strong>{money(completed.length?Math.round(revenue/completed.length):0)}</strong></article></div></section>
      <section className="panel extra-section" id="analytics">{sectionHeading("ПОКАЗАТЕЛИ","Аналитика","")}<div className="analytics-grid"><article className="analytics-item"><span>Всего записей</span><strong>{crm.appointments.length}</strong></article><article className="analytics-item"><span>Клиенты</span><strong>{crm.clients.length}</strong></article><article className="analytics-item"><span>Услуги</span><strong>{crm.services.length}</strong></article></div><h3 className="subheading">Популярные услуги</h3>{popular.length?<div className="pie-block"><div className="pie" style={{background:`conic-gradient(${gradient})`}}/><ul className="pie-legend">{popular.map((x,i)=><li key={x.name}><span className="legend-color" style={{background:colors[i]}}/><span className="legend-name">{x.name}</span><span className="legend-value">{x.count} · {Math.round(x.count/total*100)}%</span></li>)}</ul></div>:<p className="empty-state">Данных для аналитики пока недостаточно.</p>}</section>
    </>}
  </>;
}
