import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Max, MaxLength, Min } from "class-validator";

// данные для создания услуги
export class CreateServiceDto {
  @ApiProperty({ example: "Маникюр" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  // цена не может быть отрицательной или нулевой
  @ApiProperty({ example: 1500, description: "цена в рублях, больше нуля" })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 60, description: "длительность от 5 до 480 минут" })
  @IsInt()
  @Min(5)
  @Max(480)
  duration: number;
}
