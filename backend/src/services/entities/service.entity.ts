import { ApiProperty } from "@nestjs/swagger";

// услуга салона
export class Service {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Маникюр" })
  name: string;

  @ApiProperty({ example: 1500, description: "цена в рублях" })
  price: number;

  @ApiProperty({ example: 60, description: "длительность в минутах" })
  duration: number;
}
