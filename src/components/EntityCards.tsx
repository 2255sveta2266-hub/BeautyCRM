import { useState } from "react";
import { Link } from "react-router-dom";
import { useCRM } from "../context/CRMContext";
import type { EntityKind } from "../types";
// карточки для списков клиентов, мастеров и услуг
export function EntityCards({kind, search = ""}: {kind: Exclude<EntityKind, "appointment">; search?: string}) {
  const crm = useCRM(); const [error,setError] = useState("");
  // выбираем нужный список из общего хранилища
  const list = kind === "client" ? crm.clients : kind === "master" ? crm.masters : crm.services;
  const filtered = list.filter(item => Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase()));
  // перед удалением спрашиваем подтверждение
  async function remove(id:number,name:string) { if (!window.confirm(`Удалить «${name}»?`)) return; setError(""); try { await crm.remove(kind,id); } catch(e) { setError(e instanceof Error ? e.message : "Не удалось удалить."); } }
  return <>{error && <p className="form-message" role="alert">{error}</p>}{filtered.length === 0 ? <p className="empty-state">{search ? "Ничего не найдено." : kind === "client" ? "Клиентская база пока пуста." : kind === "master" ? "Мастера пока не добавлены." : "Каталог услуг пока пуст."}</p> : <div className="data-list">{filtered.map(item => <article className="data-card" key={item.id}><div className="card-top"><h3>{item.name}</h3>{"isVip" in item && <button className={`star ${item.isVip ? "active" : ""}`} type="button" title="Переключить VIP" onClick={async()=>{try { await crm.save("client",{isVip:!item.isVip},item.id); }catch(e){setError(e instanceof Error?e.message:"Ошибка.");}}}>★</button>}</div>{"phone" in item && <><p>Телефон: {item.phone}</p><p>Email: {item.email || "не указан"}</p></>}{"specialization" in item && <p>{item.specialization}</p>}{"price" in item && <><p className="price">{item.price.toLocaleString("ru-RU")} ₽</p><p>Длительность: {item.duration} мин.</p></>}<div className="card-actions">{kind === "client" && <Link className="link-button" to={`/clients/${item.id}`}>Подробнее</Link>}<button className="link-button" type="button" onClick={()=>crm.openForm(kind,item.id)}>Изменить</button><button className="link-button danger" type="button" onClick={()=>void remove(item.id,item.name)}>Удалить</button></div></article>)}</div>}</>;
}
