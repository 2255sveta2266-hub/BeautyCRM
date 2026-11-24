import type { ReactNode } from "react";

interface CardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

// кнопки изменить и удалить, общие для всех карточек
export function CardActions({ onEdit, onDelete, children }: CardActionsProps) {
  return (
    <div className="card-actions">
      {children}
      <button className="link-button" type="button" onClick={onEdit}>
        Изменить
      </button>
      <button className="link-button danger" type="button" onClick={onDelete}>
        Удалить
      </button>
    </div>
  );
}
