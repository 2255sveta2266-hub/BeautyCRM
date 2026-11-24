
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useCRM } from "../context/CRMContext";
import type { AppointmentStatus, EntityKind } from "../types";

// подписи для заголовка общего окна
const titles: Record<EntityKind, string> = {
  client: "клиента",
  master: "мастера",
  service: "услугу",
  appointment: "запись",
};

// в форме могут быть пустые значения, поэтому отдельно разрешаем undefined
type FormValues = Record<
  string,
  string | number | boolean | undefined
>;

type SearchOption = {
  id: number;
  name: string;
  details?: string;
};

// при редактировании подставляем в поля то, что уже сохранено
function getInitial(
  kind: EntityKind,
  id: number | undefined,
  crm: ReturnType<typeof useCRM>,
): FormValues {
  if (kind === "client") {
    const x = crm.clients.find((v) => v.id === id);
    return {
      name: x?.name ?? "",
      phone: x?.phone ?? "",
      email: x?.email ?? "",
      isVip: x?.isVip ?? false,
    };
  }

  if (kind === "master") {
    const x = crm.masters.find((v) => v.id === id);
    return {
      name: x?.name ?? "",
      specialization: x?.specialization ?? "",
    };
  }

  if (kind === "service") {
    const x = crm.services.find((v) => v.id === id);
    return {
      name: x?.name ?? "",
      price: x?.price ?? "",
      duration: x?.duration ?? "",
    };
  }

  const x = crm.appointments.find((v) => v.id === id);
  return {
    clientId: x?.clientId ?? "",
    masterId: x?.masterId ?? "",
    serviceId: x?.serviceId ?? "",
    date: x?.date ?? "",
    time: x?.time ?? "",
    status: x?.status ?? "pending",
    comment: x?.comment ?? "",
  };
}

// поиск по списку клиентов, мастеров и услуг
function SearchableSelect({
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  options: SearchOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find(
    (option) => String(option.id) === value,
  );

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return options;

    return options.filter((option) => {
      const text = `${option.name} ${option.details ?? ""}`.toLowerCase();
      return text.includes(search);
    });
  }, [options, query]);

  return (
    <div className="form-field search-select" key={name}>
      <label htmlFor={`crm-${name}`}>{label}</label>

      <div style={{ position: "relative" }}>
        <input
          id={`crm-${name}`}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={query || selected?.name || ""}
          onFocus={() => {
            setQuery("");
            setIsOpen(true);
          }}
          onBlur={() => setIsOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange("");
            setIsOpen(true);
          }}
          aria-expanded={isOpen}
          aria-controls={`crm-${name}-options`}
          aria-autocomplete="list"
          required={!value}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
              setIsOpen(true);
            }}
            aria-label={`Очистить поле ${label}`}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "#98613f",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        )}

        {isOpen && (
          <div
            id={`crm-${name}-options`}
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              left: 0,
              right: 0,
              zIndex: 20,
              maxHeight: "190px",
              overflowY: "auto",
              background: "#fffdf9",
              border: "1px solid #e8d4c1",
              borderRadius: "9px",
              boxShadow: "0 8px 20px rgba(65, 38, 23, 0.14)",
              padding: "5px",
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={String(option.id) === value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(String(option.id));
                    setQuery("");
                    setIsOpen(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                    padding: "9px 10px",
                    border: "none",
                    borderRadius: "6px",
                    background:
                      String(option.id) === value
                        ? "#f3e3d4"
                        : "transparent",
                    color: "#493020",
                    cursor: "pointer",
                    textAlign: "left",
                    font: "inherit",
                  }}
                >
                  <span>{option.name}</span>
                  {option.details && (
                    <small style={{ color: "#987b68", marginTop: "3px" }}>
                      {option.details}
                    </small>
                  )}
                </button>
              ))
            ) : (
              <p
                style={{
                  padding: "10px",
                  margin: 0,
                  color: "#987b68",
                  fontSize: "13px",
                }}
              >
                Ничего не найдено
              </p>
            )}
          </div>
        )}
      </div>

      {selected && !query && (
        <small style={{ color: "#987b68", marginTop: "4px" }}>
          Выбрано: {selected.name}
        </small>
      )}
    </div>
  );
}

// одно окно используется для клиентов, мастеров, услуг и записей
export function CRMModal() {
  const crm = useCRM();
  const { editing, closeForm } = crm;

  const [form, setForm] = useState<FormValues>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm(getInitial(editing.kind, editing.id, crm));
      setError("");
    }
  }, [
    editing,
    crm.clients,
    crm.masters,
    crm.services,
    crm.appointments,
  ]);

  useEffect(() => {
    if (!editing) return;

    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeForm();
    };

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [editing, closeForm]);

  if (!editing) return null;

  // сохраняем текущую форму отдельно, чтобы она оставалась доступна внутри submit
  const currentEditing = editing;
  const kind = currentEditing.kind;

  const set = (key: string, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const input = (
    label: string,
    name: string,
    type = "text",
    opts: {
      required?: boolean;
      min?: number;
      max?: number;
      placeholder?: string;
      full?: boolean;
    } = {},
  ) => (
    <div className={`form-field ${opts.full ? "full-width" : ""}`} key={name}>
      <label htmlFor={`crm-${name}`}>{label}</label>
      <input
        id={`crm-${name}`}
        name={name}
        type={type}
        required={opts.required ?? true}
        min={opts.min}
        max={opts.max}
        minLength={name === "name" ? 2 : undefined}
        placeholder={opts.placeholder}
        value={String(form[name] ?? "")}
        onChange={(event) => set(name, event.target.value)}
      />
    </div>
  );

  // перед отправкой проверяем поля и собираем данные нужного типа
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (kind === "client") {
        const name = String(form.name ?? "").trim();
        const phone = String(form.phone ?? "").trim();

        if (name.length < 2 || !/^[+\d\s()-]{7,20}$/.test(phone)) {
          throw new Error("Укажи имя и корректный телефон.");
        }

        // сразу отправляем данные клиента в нужный раздел api
        await crm.save(
          "client",
          {
            name,
            phone,
            email: String(form.email ?? "").trim(),
            isVip: Boolean(form.isVip),
          },
          currentEditing.id,
        );
      } else if (kind === "master") {
        const name = String(form.name ?? "").trim();
        const specialization = String(form.specialization ?? "").trim();

        if (!name || !specialization) {
          throw new Error("Заполни имя и специализацию.");
        }

        await crm.save("master", { name, specialization }, currentEditing.id);
      } else if (kind === "service") {
        const price = Number(form.price);
        const duration = Number(form.duration);
        const name = String(form.name ?? "").trim();

        if (!name) {
          throw new Error("Укажи название услуги.");
        }

        if (
          !Number.isFinite(price) ||
          price <= 0 ||
          !Number.isInteger(duration) ||
          duration < 5 ||
          duration > 480
        ) {
          throw new Error("Проверь стоимость и длительность (5–480 минут).");
        }

        await crm.save("service", { name, price, duration }, currentEditing.id);
      } else {
        const clientId = Number(form.clientId);
        const masterId = Number(form.masterId);
        const serviceId = Number(form.serviceId);

        if (!clientId || !masterId || !serviceId || !form.date || !form.time) {
          throw new Error("Заполни все обязательные поля.");
        }

        const date = String(form.date);
        const time = String(form.time);

        if (time < "09:00" || time > "21:00") {
          throw new Error("Время работы салона: 09:00–21:00.");
        }

        if (
          crm.appointments.some(
            (appointment) =>
              appointment.id !== currentEditing.id &&
              appointment.masterId === masterId &&
              appointment.date === date &&
              appointment.time === time &&
              appointment.status !== "cancelled",
          )
        ) {
          throw new Error("У этого мастера уже есть запись на выбранное время.");
        }

        await crm.save(
          "appointment",
          {
            clientId,
            masterId,
            serviceId,
            date,
            time,
            status: form.status as AppointmentStatus,
            comment: String(form.comment ?? "").trim(),
          },
          currentEditing.id,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения.");
    } finally {
      setSaving(false);
    }
  }

  // готовим списки с дополнительными данными для поиска
  const clientOptions: SearchOption[] = crm.clients.map((client) => ({
    id: client.id,
    name: client.name,
    details: client.phone,
  }));

  const masterOptions: SearchOption[] = crm.masters.map((master) => ({
    id: master.id,
    name: master.name,
    details: master.specialization,
  }));

  const serviceOptions: SearchOption[] = crm.services.map((service) => ({
    id: service.id,
    name: service.name,
    details: `${service.price} ₽ · ${service.duration} мин.`,
  }));

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) closeForm();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <div className="modal-heading">
          <div>
            <p className="section-kicker">НОВАЯ КАРТОЧКА</p>
            <h2 id="modalTitle">
              {currentEditing.id === undefined ? "Добавить" : "Изменить"}{" "}
              {titles[kind]}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={closeForm}
            disabled={saving}
            aria-label="Закрыть окно"
          >
            ×
          </button>
        </div>

        <form className="crm-form" onSubmit={submit}>
          {kind === "client" && (
            <>
              {input("Имя и фамилия", "name", "text", {
                placeholder: "Например, Анна Смирнова",
              })}

              {input("Телефон", "phone", "tel", {
                placeholder: "+7 900 000-00-00",
              })}

              {input("Email", "email", "email", {
                required: false,
                full: true,
                placeholder: "client@example.com",
              })}

              <div className="form-field full-width">
                <label className="vip-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isVip)}
                    onChange={(event) => set("isVip", event.target.checked)}
                  />
                  VIP-клиент
                </label>
              </div>
            </>
          )}

          {kind === "master" && (
            <>
              {input("Имя и фамилия", "name", "text", {
                placeholder: "Например, Анна Смирнова",
              })}

              {input("Специализация", "specialization", "text", {
                placeholder: "Например, мастер маникюра",
              })}
            </>
          )}

          {kind === "service" && (
            <>
              {input("Название услуги", "name", "text", {
                full: true,
                placeholder: "Например, Маникюр",
              })}

              {input("Стоимость, ₽", "price", "number", { min: 1 })}

              {input("Длительность, минут", "duration", "number", {
                min: 5,
                max: 480,
              })}
            </>
          )}

          {kind === "appointment" && (
            <>
              <SearchableSelect
                name="clientId"
                label="Клиент"
                placeholder="Поиск по имени или телефону..."
                options={clientOptions}
                value={String(form.clientId ?? "")}
                onChange={(value) => set("clientId", value)}
              />

              <SearchableSelect
                name="masterId"
                label="Мастер"
                placeholder="Поиск по имени или специализации..."
                options={masterOptions}
                value={String(form.masterId ?? "")}
                onChange={(value) => set("masterId", value)}
              />

              <SearchableSelect
                name="serviceId"
                label="Услуга"
                placeholder="Поиск по названию услуги..."
                options={serviceOptions}
                value={String(form.serviceId ?? "")}
                onChange={(value) => set("serviceId", value)}
              />

              {input("Дата", "date", "date")}
              {input("Время", "time", "time")}

              <div className="form-field">
                <label htmlFor="crm-status">Статус</label>
                <select
                  id="crm-status"
                  value={String(form.status ?? "pending")}
                  onChange={(event) => set("status", event.target.value)}
                >
                  <option value="pending">Ожидает</option>
                  <option value="confirmed">Подтверждена</option>
                  <option value="completed">Завершена</option>
                  <option value="cancelled">Отменена</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label htmlFor="crm-comment">Комментарий</label>
                <textarea
                  id="crm-comment"
                  rows={3}
                  value={String(form.comment ?? "")}
                  onChange={(event) => set("comment", event.target.value)}
                />
              </div>

              {(!crm.clients.length ||
                !crm.masters.length ||
                !crm.services.length) && (
                <p className="form-message full-width">
                  Для записи сначала добавь клиента, мастера и услугу.
                </p>
              )}
            </>
          )}

          {error && (
            <p className="form-message full-width" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={closeForm}
              disabled={saving}
            >
              Отмена
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={
                saving ||
                (kind === "appointment" &&
                  (!crm.clients.length ||
                    !crm.masters.length ||
                    !crm.services.length))
              }
            >
              {saving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
