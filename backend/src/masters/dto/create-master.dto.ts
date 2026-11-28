import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

// данные для создания мастера
export class CreateMasterDto {
  @ApiProperty({ example: "Мария Петрова" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: "мастер маникюра" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  specialization: string;
}
