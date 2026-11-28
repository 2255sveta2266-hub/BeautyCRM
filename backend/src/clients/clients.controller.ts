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
import { ClientsService } from "./clients.service";
import { Client } from "./entities/client.entity";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

// контроллер только принимает запрос и передаёт работу сервису
@ApiTags("clients")
@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: "Получить список клиентов" })
  @ApiOkResponse({ type: [Client] })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить клиента по id" })
  @ApiOkResponse({ type: Client })
  @ApiNotFoundResponse({ description: "Клиент не найден" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Создать клиента" })
  @ApiCreatedResponse({ type: Client })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Изменить клиента" })
  @ApiOkResponse({ type: Client })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  @ApiNotFoundResponse({ description: "Клиент не найден" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Удалить клиента" })
  @ApiNoContentResponse({ description: "Удалено" })
  @ApiNotFoundResponse({ description: "Клиент не найден" })
  remove(@Param("id", ParseIntPipe) id: number) {
    this.clientsService.remove(id);
  }
}
