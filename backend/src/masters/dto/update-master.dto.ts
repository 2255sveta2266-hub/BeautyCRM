import { PartialType } from "@nestjs/swagger";
import { CreateMasterDto } from "./create-master.dto";

// при изменении все поля необязательные
export class UpdateMasterDto extends PartialType(CreateMasterDto) {}
