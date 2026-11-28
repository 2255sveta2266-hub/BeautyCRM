import { Injectable } from "@nestjs/common";
import { InMemoryService } from "../common/in-memory.service";
import { Service } from "./entities/service.entity";

@Injectable()
export class ServicesService extends InMemoryService<Service> {
  constructor() {
    super("Услуга");
  }
}
