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
import { MastersService } from "./masters.service";
import { Master } from "./entities/master.entity";
import { CreateMasterDto } from "./dto/create-master.dto";
import { UpdateMasterDto } from "./dto/update-master.dto";

// контроллер только принимает запрос и передаёт работу сервису
@ApiTags("masters")
@Controller("masters")
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get()
  @ApiOperation({ summary: "Получить список мастеров" })
  @ApiOkResponse({ type: [Master] })
  findAll() {
    return this.mastersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить мастера по id" })
  @ApiOkResponse({ type: Master })
  @ApiNotFoundResponse({ description: "Мастер не найден" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.mastersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Создать мастера" })
  @ApiCreatedResponse({ type: Master })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  create(@Body() dto: CreateMasterDto) {
    return this.mastersService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Изменить мастера" })
  @ApiOkResponse({ type: Master })
  @ApiBadRequestResponse({ description: "Некорректные данные" })
  @ApiNotFoundResponse({ description: "Мастер не найден" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMasterDto) {
    return this.mastersService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Удалить мастера" })
  @ApiNoContentResponse({ description: "Удалено" })
  @ApiNotFoundResponse({ description: "Мастер не найден" })
  remove(@Param("id", ParseIntPipe) id: number) {
    this.mastersService.remove(id);
  }
}
