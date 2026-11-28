import { Injectable } from "@nestjs/common";
import { InMemoryService } from "../common/in-memory.service";
import { Master } from "./entities/master.entity";

@Injectable()
export class MastersService extends InMemoryService<Master> {
  constructor() {
    super("Мастер");
  }
}
