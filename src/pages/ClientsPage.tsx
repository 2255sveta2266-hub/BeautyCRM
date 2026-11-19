import { useState } from "react";
import { useCRM } from "../context/CRMContext";
import { EntityCards } from "../components/EntityCards";
// отдельная страница клиентов нужна для маршрута из задания
export default function ClientsPage() {
  // данные берём из общего контекста, поэтому после сохранения список обновится сам
  const crm=useCRM(); const [search,setSearch]=useState("");
  return <section className="panel extra-section"><div className="section-heading"><div><p className="section-kicker">КЛИЕНТСКАЯ БАЗА</p><h2>Клиенты</h2><p>Управление клиентами салона</p></div><button type="button" className="button button-primary" onClick={()=>crm.openForm("client")}>+ Добавить клиента</button></div><div className="toolbar"><input className="crm-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по имени, телефону или email..."/></div>{crm.loading?<p className="empty-state">Загрузка...</p>:crm.error?<p className="form-message">{crm.error}</p>:<EntityCards kind="client" search={search}/>}</section>;
}
