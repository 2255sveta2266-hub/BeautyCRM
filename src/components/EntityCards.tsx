import { useState } from "react";
import { useCRM } from "../context/CRMContext";
import { ClientCard } from "./cards/ClientCard";
import { MasterCard } from "./cards/MasterCard";
import { ServiceCard } from "./cards/ServiceCard";
import type { Client, EntityKind } from "../types";

interface EntityCardsProps {
  kind: Exclude<EntityKind, "appointment">;
  search?: string;
}

// тексты для пустого списка в каждом разделе
const emptyTexts = {
  client: "Клиентская база пока пуста.",
  master: "Мастера пока не добавлены.",
  service: "Каталог услуг пока пуст.",
};

// список карточек клиентов, мастеров или услуг
export function EntityCards({ kind, search = "" }: EntityCardsProps) {
  const crm = useCRM();
  const [error, setError] = useState("");

  // поиск по всем полям объекта сразу
  const query = search.toLowerCase();
  const match = (item: object) => Object.values(item).join(" ").toLowerCase().includes(query);

  const clients = crm.clients.filter(match);
  const masters = crm.masters.filter(match);
  const services = crm.services.filter(match);
  const count = kind === "client" ? clients.length : kind === "master" ? masters.length : services.length;

  // перед удалением спрашиваем подтверждение
  async function remove(id: number, name: string) {
    if (!window.confirm(`Удалить «${name}»?`)) return;
    setError("");
    try {
      await crm.remove(kind, id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить.");
    }
  }

  // звезда меняет только поле isVip
  async function toggleVip(client: Client) {
    try {
      await crm.save("client", { isVip: !client.isVip }, client.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка.");
    }
  }

  return (
    <>
      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
      {count === 0 ? (
        <p className="empty-state">{search ? "Ничего не найдено." : emptyTexts[kind]}</p>
      ) : (
        <div className="data-list">
          {kind === "client" &&
            clients.map((c) => (
              <ClientCard
                key={c.id}
                client={c}
                onEdit={() => crm.openForm("client", c.id)}
                onDelete={() => void remove(c.id, c.name)}
                onToggleVip={() => void toggleVip(c)}
              />
            ))}
          {kind === "master" &&
            masters.map((m) => (
              <MasterCard key={m.id} master={m} onEdit={() => crm.openForm("master", m.id)} onDelete={() => void remove(m.id, m.name)} />
            ))}
          {kind === "service" &&
            services.map((s) => (
              <ServiceCard key={s.id} service={s} onEdit={() => crm.openForm("service", s.id)} onDelete={() => void remove(s.id, s.name)} />
            ))}
        </div>
      )}
    </>
  );
}
