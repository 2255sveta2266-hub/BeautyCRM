import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AppointmentsService } from "./appointments.service";
import { Appointment } from "./entities/appointment.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

// контроллер только принимает запрос и передаёт работу сервису
@ApiTags("appointments")
@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: "Получить список записей" })
  @ApiOkResponse({ type: [Appointment] })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить запись по id" })
  @ApiOkResponse({ type: Appointment })
  @ApiNotFoundResponse({ description: "Запись не найдена" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Создать запись" })
  @ApiCreatedResponse({ type: Appointment })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Изменить запись" })
  @ApiOkResponse({ type: Appointment })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  @ApiNotFoundResponse({ description: "Запись не найдена" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Удалить запись" })
  @ApiNoContentResponse({ description: "Удалено" })
  @ApiNotFoundResponse({ description: "Запись не найдена" })
  remove(@Param("id", ParseIntPipe) id: number) {
    this.appointmentsService.remove(id);
  }
}
