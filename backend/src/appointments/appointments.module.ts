import { Module } from "@nestjs/common";
import { ClientsModule } from "../clients/clients.module";
import { MastersModule } from "../masters/masters.module";
import { ServicesModule } from "../services/services.module";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";

// записи зависят от клиентов, мастеров и услуг, поэтому подключаем их модули
@Module({
  imports: [ClientsModule, MastersModule, ServicesModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
