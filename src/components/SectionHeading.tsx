import { useCRM } from "../context/CRMContext";
import type { EntityKind } from "../types";

// подписи кнопок добавления для каждого раздела
const addLabels: Record<EntityKind, string> = {
  client: "Добавить клиента",
  master: "Добавить мастера",
  service: "Добавить услугу",
  appointment: "Новая запись",
};

interface SectionHeadingProps {
  kicker: string;
  title: string;
  subtitle?: string;
  kind?: EntityKind;
}

// одинаковая шапка разделов, чтобы не повторять одну и ту же разметку
export function SectionHeading({ kicker, title, subtitle, kind }: SectionHeadingProps) {
  const crm = useCRM();

  return (
    <div className="section-heading">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {kind && (
        <button type="button" className="button button-primary" onClick={() => crm.openForm(kind)}>
          + {addLabels[kind]}
        </button>
      )}
    </div>
  );
}
