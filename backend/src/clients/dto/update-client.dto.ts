import { PartialType } from "@nestjs/swagger";
import { CreateClientDto } from "./create-client.dto";

// при изменении все поля необязательные
export class UpdateClientDto extends PartialType(CreateClientDto) {}
