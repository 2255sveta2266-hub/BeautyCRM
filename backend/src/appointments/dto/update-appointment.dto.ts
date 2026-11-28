import { PartialType } from "@nestjs/swagger";
import { CreateAppointmentDto } from "./create-appointment.dto";

// при изменении все поля необязательные, например можно поменять только статус
export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}
