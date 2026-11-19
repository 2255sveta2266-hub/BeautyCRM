import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Appointment, Client, EntityKind, Master, Service } from "../types";
import { appointmentsApi, clientsApi, mastersApi, servicesApi } from "../services/api";

// здесь хранится, какую карточку сейчас добавляем или редактируем
type Editing = { kind: EntityKind; id?: number } | null;
type CRMContextType = {
  clients: Client[]; masters: Master[]; services: Service[]; appointments: Appointment[];
  loading: boolean; error: string; notice: string; editing: Editing;
  refresh: () => Promise<void>; openForm: (kind: EntityKind, id?: number) => void;
  closeForm: () => void; clearError: () => void; clearNotice: () => void;
  save: (kind: EntityKind, values: Record<string, unknown>, id?: number) => Promise<void>;
  remove: (kind: EntityKind, id: number) => Promise<void>;
};
// общий контекст, чтобы не передавать одни и те же данные через все компоненты
const Context = createContext<CRMContextType | null>(null);
export function CRMProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  // загружаем все списки одновременно, так страница открывается быстрее
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [c, m, s, a] = await Promise.all([clientsApi.getAll(), mastersApi.getAll(), servicesApi.getAll(), appointmentsApi.getAll()]);
      setClients(c); setMasters(m); setServices(s); setAppointments(a);
    } catch (e) { setError(e instanceof Error ? e.message : "Не удалось загрузить данные."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const openForm = (kind: EntityKind, id?: number) => { setError(""); setEditing({kind, id}); };
  const closeForm = () => setEditing(null);
  // в зависимости от типа формы отправляем данные в нужный раздел api
  const save = async (kind: EntityKind, values: Record<string, unknown>, id?: number) => {
    if (kind === "client") {
      const data = values as unknown as Omit<Client, "id">;
      if (id === undefined) await clientsApi.create(data); else await clientsApi.update(id, data);
    } else if (kind === "master") {
      const data = values as unknown as Omit<Master, "id">;
      if (id === undefined) await mastersApi.create(data); else await mastersApi.update(id, data);
    } else if (kind === "service") {
      const data = values as unknown as Omit<Service, "id">;
      if (id === undefined) await servicesApi.create(data); else await servicesApi.update(id, data);
    } else {
      const data = values as unknown as Omit<Appointment, "id">;
      if (id === undefined) await appointmentsApi.create(data); else await appointmentsApi.update(id, data);
    }
    setEditing(null); await refresh(); setNotice(id === undefined ? "Данные добавлены." : "Изменения сохранены.");
  };
  // не даём удалить объект, если на него уже ссылаются записи
  const remove = async (kind: EntityKind, id: number) => {
    if (kind === "client") {
      if (appointments.some(a => a.clientId === id)) throw new Error("У клиента есть записи. Сначала удали их.");
      await clientsApi.delete(id);
    } else if (kind === "master") {
      if (appointments.some(a => a.masterId === id)) throw new Error("У мастера есть записи. Сначала удали их.");
      await mastersApi.delete(id);
    } else if (kind === "service") {
      if (appointments.some(a => a.serviceId === id)) throw new Error("У услуги есть записи. Сначала удали их.");
      await servicesApi.delete(id);
    } else await appointmentsApi.delete(id);
    await refresh(); setNotice("Данные удалены.");
  };
  return <Context.Provider value={{clients, masters, services, appointments, loading, error, notice, editing, refresh, openForm, closeForm, clearError:()=>setError(""), clearNotice:()=>setNotice(""), save, remove}}>{children}</Context.Provider>;
}
export function useCRM() { const context = useContext(Context); if (!context) throw new Error("CRMProvider не подключён"); return context; }
