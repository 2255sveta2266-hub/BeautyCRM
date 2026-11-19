// типы данных, которые используются в приложении
// возможные статусы записи
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
// карточка клиента
export interface Client { id: number; name: string; phone: string; email?: string; isVip: boolean; }
// данные мастера салона
export interface Master { id: number; name: string; specialization: string; }
// услуга с ценой и длительностью
export interface Service { id: number; name: string; price: number; duration: number; }
// запись связывает клиента, мастера и выбранную услугу
export interface Appointment { id: number; clientId: number; masterId: number; serviceId: number; date: string; time: string; status: AppointmentStatus; comment?: string; }
// тип сущности нужен общей форме добавления и редактирования
export type EntityKind = "client" | "master" | "service" | "appointment";
