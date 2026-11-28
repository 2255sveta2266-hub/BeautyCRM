import { ApiProperty } from "@nestjs/swagger";

// мастер салона
export class Master {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Мария Петрова" })
  name: string;

  @ApiProperty({ example: "мастер маникюра" })
  specialization: string;
}
