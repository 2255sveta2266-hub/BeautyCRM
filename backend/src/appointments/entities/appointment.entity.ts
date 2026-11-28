import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// возможные статусы записи
export const appointmentStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

// запись связывает клиента, мастера и услугу через идентификаторы
export class Appointment {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1, description: "id клиента" })
  clientId: number;

  @ApiProperty({ example: 1, description: "id мастера" })
  masterId: number;

  @ApiProperty({ example: 1, description: "id услуги" })
  serviceId: number;

  @ApiProperty({ example: "2026-12-01", description: "дата в формате гггг-мм-дд" })
  date: string;

  @ApiProperty({ example: "14:30", description: "время в формате чч:мм" })
  time: string;

  @ApiProperty({ enum: appointmentStatuses, example: "pending" })
  status: AppointmentStatus;

  @ApiPropertyOptional({ example: "красный лак" })
  comment?: string;
}
