import { Module } from "@nestjs/common";
import { MastersController } from "./masters.controller";
import { MastersService } from "./masters.service";

// модуль объединяет контроллер и сервис, сервис экспортируется для модуля записей
@Module({
  controllers: [MastersController],
  providers: [MastersService],
  exports: [MastersService],
})
export class MastersModule {}
