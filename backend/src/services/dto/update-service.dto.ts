import { PartialType } from "@nestjs/swagger";
import { CreateServiceDto } from "./create-service.dto";

// при изменении все поля необязательные
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
