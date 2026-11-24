import { useState } from "react";
import { useCRM } from "../context/CRMContext";
import { statusClasses, statusLabels, nameById } from "../utils/format";
import type { Appointment, AppointmentStatus } from "../types";

interface AppointmentsTableProps {
  appointments: Appointment[];
}

// порядок, в котором меняется статус по нажатию
const statusOrder: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

// таблица записей со сменой статуса, изменением и удалением
export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const crm = useCRM();
  const [actionError, setActionError] = useState("");

  // удаление записи с подтверждением
  async function removeAppointment(id: number) {
    if (!window.confirm("Удалить запись?")) return;
    try {
      setActionError("");
      await crm.remove("appointment", id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Ошибка удаления.");
    }
  }

  // по нажатию на статус переключаем его на следующий
  async function cycleStatus(id: number, status: AppointmentStatus) {
    const next = statusOrder[(statusOrder.indexOf(status) + 1) % statusOrder.length];
    try {
      setActionError("");
      await crm.save("appointment", { status: next }, id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Ошибка изменения статуса.");
    }
  }

  return (
    <>
      {actionError && (
        <p className="form-message" role="alert">
          {actionError}
        </p>
      )}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Дата и время</th>
              <th>Клиент</th>
              <th>Услуга</th>
              <th>Мастер</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <p className="empty-state">
                    {crm.appointments.length ? "Записей по фильтру нет." : "Записей пока нет. Создай первую запись."}
                  </p>
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    {new Date(`${a.date}T00:00:00`).toLocaleDateString("ru-RU")} · {a.time}
                  </td>
                  <td>{nameById(crm.clients, a.clientId, "Клиент удалён")}</td>
                  <td>{nameById(crm.services, a.serviceId, "Услуга удалена")}</td>
                  <td>{nameById(crm.masters, a.masterId, "Мастер удалён")}</td>
                  <td>
                    <button
                      type="button"
                      title="Сменить статус"
                      className={`status ${statusClasses[a.status]}`}
                      onClick={() => void cycleStatus(a.id, a.status)}
                    >
                      {statusLabels[a.status]}
                    </button>
                  </td>
                  <td className="row-actions">
                    <button type="button" className="icon-button" title="Изменить" onClick={() => crm.openForm("appointment", a.id)}>
                      ✎
                    </button>
                    <button type="button" className="icon-button danger" title="Удалить" onClick={() => void removeAppointment(a.id)}>
                      ×
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
