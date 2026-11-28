import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// клиент салона
export class Client {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Анна Иванова" })
  name: string;

  @ApiProperty({ example: "+79991234567" })
  phone: string;

  @ApiPropertyOptional({ example: "anna@example.com" })
  email?: string;

  @ApiProperty({ example: false })
  isVip: boolean;
}
