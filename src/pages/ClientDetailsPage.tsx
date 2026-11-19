
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCRM } from "../context/CRMContext";
import { clientsApi } from "../services/api";
import type { Client } from "../types";

// страница одной карточки клиента
export default function ClientDetailsPage() {
  const { id } = useParams();
  const crm = useCRM();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  // получаем одного клиента непосредственно через REST API
  useEffect(() => {
    let cancelled = false;

    async function loadClient() {
      const clientId = Number(id);

      if (!Number.isInteger(clientId) || clientId <= 0) {
        setClient(null);
        setError("Некорректный идентификатор клиента.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await clientsApi.getById(clientId);

        if (!cancelled) {
          setClient(data);
        }
      } catch (err) {
        if (!cancelled) {
          setClient(null);
          setError(
            err instanceof Error
              ? err.message
              : "Не удалось загрузить карточку клиента.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadClient();

    return () => {
      cancelled = true;
    };
  }, [id, retry, crm.clients]);

  if (loading) {
    return (
      <section className="panel extra-section">
        <p className="empty-state">Загрузка карточки клиента...</p>
      </section>
    );
  }

  if (error || !client) {
    return (
      <section className="panel extra-section">
        <h2>Не удалось открыть карточку</h2>
        <p className="form-message">
          {error || "Клиент не найден."}
        </p>

        <div className="form-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => setRetry((value) => value + 1)}
          >
            Повторить
          </button>

          <Link
            className="button button-outline"
            to="/#clients"
          >
            К списку клиентов
          </Link>
        </div>
      </section>
    );
  }

  // собираем историю посещений только выбранного клиента
  const visits = crm.appointments.filter(
    (appointment) => appointment.clientId === client.id,
  );

  return (
    <section className="panel extra-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">КАРТОЧКА КЛИЕНТА</p>
          <h2>{client.name}</h2>
        </div>

        <button
          className="button button-primary"
          type="button"
          onClick={() => crm.openForm("client", client.id)}
        >
          Изменить
        </button>
      </div>

      <dl className="details-list">
        <dt>Телефон</dt>
        <dd>{client.phone}</dd>

        <dt>Email</dt>
        <dd>{client.email || "Не указан"}</dd>

        <dt>Статус</dt>
        <dd>{client.isVip ? "VIP" : "Обычный"}</dd>

        <dt>Всего записей</dt>
        <dd>{visits.length}</dd>
      </dl>

      <h3 className="subheading">История записей</h3>

      {visits.length > 0 ? (
        <ul className="history-list">
          {visits.map((appointment) => (
            <li key={appointment.id}>
              <span>
                {appointment.date} в {appointment.time} ·{" "}
                {crm.services.find(
                  (service) => service.id === appointment.serviceId,
                )?.name ?? "Услуга удалена"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">История пока пуста.</p>
      )}

      <p style={{ marginTop: 20 }}>
        <Link className="button button-outline" to="/#clients">
          ← Назад к клиентам
        </Link>
      </p>
    </section>
  );
}
