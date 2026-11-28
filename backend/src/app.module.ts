import { Module } from "@nestjs/common";
import { ClientsModule } from "./clients/clients.module";
import { MastersModule } from "./masters/masters.module";
import { ServicesModule } from "./services/services.module";
import { AppointmentsModule } from "./appointments/appointments.module";

// корневой модуль только подключает модули сущностей
@Module({
  imports: [ClientsModule, MastersModule, ServicesModule, AppointmentsModule],
})
export class AppModule {}
