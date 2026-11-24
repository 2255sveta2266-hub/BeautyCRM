import { CardActions } from "./CardActions";
import type { Master } from "../../types";

interface MasterCardProps {
  master: Master;
  onEdit: () => void;
  onDelete: () => void;
}

// карточка мастера
export function MasterCard({ master, onEdit, onDelete }: MasterCardProps) {
  return (
    <article className="data-card">
      <div className="card-top">
        <h3>{master.name}</h3>
      </div>
      <p>{master.specialization}</p>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}
