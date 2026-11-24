import { CardActions } from "./CardActions";
import { money } from "../../utils/format";
import type { Service } from "../../types";

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}

// карточка услуги с ценой и длительностью
export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <article className="data-card">
      <div className="card-top">
        <h3>{service.name}</h3>
      </div>
      <p className="price">{money(service.price)}</p>
      <p>Длительность: {service.duration} мин.</p>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}
