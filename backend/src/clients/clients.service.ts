import { Injectable } from "@nestjs/common";
import { InMemoryService } from "../common/in-memory.service";
import { Client } from "./entities/client.entity";
import { CreateClientDto } from "./dto/create-client.dto";

@Injectable()
export class ClientsService extends InMemoryService<Client> {
  constructor() {
    super("Клиент");
  }

  // по умолчанию клиент не vip
  create(dto: CreateClientDto): Client {
    return super.create({ ...dto, isVip: dto.isVip ?? false });
  }
}
