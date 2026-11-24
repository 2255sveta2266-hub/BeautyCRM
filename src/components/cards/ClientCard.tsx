import { Link } from "react-router-dom";
import { CardActions } from "./CardActions";
import type { Client } from "../../types";

interface ClientCardProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVip: () => void;
}

// карточка клиента со звездой vip и ссылкой на подробную страницу
export function ClientCard({ client, onEdit, onDelete, onToggleVip }: ClientCardProps) {
  return (
    <article className="data-card">
      <div className="card-top">
        <h3>{client.name}</h3>
        <button className={`star ${client.isVip ? "active" : ""}`} type="button" title="Переключить VIP" onClick={onToggleVip}>
          ★
        </button>
      </div>
      <p>Телефон: {client.phone}</p>
      <p>Email: {client.email || "не указан"}</p>
      <CardActions onEdit={onEdit} onDelete={onDelete}>
        <Link className="link-button" to={`/clients/${client.id}`}>
          Подробнее
        </Link>
      </CardActions>
    </article>
  );
}
