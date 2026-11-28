import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsOptional, IsPositive, IsString, Matches, MaxLength } from "class-validator";
import { AppointmentStatus, appointmentStatuses } from "../entities/appointment.entity";

// данные для создания записи
export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  clientId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  masterId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  serviceId: number;

  @ApiProperty({ example: "2026-12-01" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "дата должна быть в формате гггг-мм-дд" })
  date: string;

  @ApiProperty({ example: "14:30" })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "время должно быть в формате чч:мм" })
  time: string;

  @ApiPropertyOptional({ enum: appointmentStatuses, default: "pending" })
  @IsOptional()
  @IsIn(appointmentStatuses)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: "красный лак" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
