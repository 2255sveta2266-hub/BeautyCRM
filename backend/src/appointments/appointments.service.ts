import { BadRequestException, Injectable } from "@nestjs/common";
import { InMemoryService } from "../common/in-memory.service";
import { ClientsService } from "../clients/clients.service";
import { MastersService } from "../masters/masters.service";
import { ServicesService } from "../services/services.service";
import { Appointment } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

// салон работает с 09:00 до 21:00
const WORK_START = "09:00";
const WORK_END = "21:00";

@Injectable()
export class AppointmentsService extends InMemoryService<Appointment> {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly mastersService: MastersService,
    private readonly servicesService: ServicesService,
  ) {
    super("Запись");
  }

  create(dto: CreateAppointmentDto): Appointment {
    const data = { ...dto, status: dto.status ?? "pending" };
    this.checkRules(data);
    return super.create(data);
  }

  // для проверки объединяем старую запись с новыми полями
  update(id: number, dto: UpdateAppointmentDto): Appointment {
    this.checkRules({ ...this.findOne(id), ...dto }, id);
    return super.update(id, dto);
  }

  // проверяем связанные объекты, часы работы и занятость мастера
  private checkRules(data: Omit<Appointment, "id">, selfId?: number): void {
    if (!this.clientsService.has(data.clientId)) {
      throw new BadRequestException(`клиента с id ${data.clientId} не существует`);
    }
    if (!this.mastersService.has(data.masterId)) {
      throw new BadRequestException(`мастера с id ${data.masterId} не существует`);
    }
    if (!this.servicesService.has(data.serviceId)) {
      throw new BadRequestException(`услуги с id ${data.serviceId} не существует`);
    }
    if (data.time < WORK_START || data.time > WORK_END) {
      throw new BadRequestException(`время работы салона: ${WORK_START}–${WORK_END}`);
    }

    // у отменённой записи время уже не занято
    if (data.status === "cancelled") return;
    const busy = this.items.some(
      (a) =>
        a.id !== selfId &&
        a.masterId === data.masterId &&
        a.date === data.date &&
        a.time === data.time &&
        a.status !== "cancelled",
    );
    if (busy) {
      throw new BadRequestException("у этого мастера уже есть запись на выбранное время");
    }
  }
}
