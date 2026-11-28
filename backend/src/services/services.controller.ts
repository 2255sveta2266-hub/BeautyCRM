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
import { ServicesService } from "./services.service";
import { Service } from "./entities/service.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

// контроллер только принимает запрос и передаёт работу сервису
@ApiTags("services")
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: "Получить список услуг" })
  @ApiOkResponse({ type: [Service] })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить услугу по id" })
  @ApiOkResponse({ type: Service })
  @ApiNotFoundResponse({ description: "Услуга не найдена" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Создать услугу" })
  @ApiCreatedResponse({ type: Service })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Изменить услугу" })
  @ApiOkResponse({ type: Service })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  @ApiNotFoundResponse({ description: "Услуга не найдена" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Удалить услугу" })
  @ApiNoContentResponse({ description: "Удалено" })
  @ApiNotFoundResponse({ description: "Услуга не найдена" })
  remove(@Param("id", ParseIntPipe) id: number) {
    this.servicesService.remove(id);
  }
}
