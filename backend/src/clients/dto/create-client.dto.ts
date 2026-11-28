import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from "class-validator";

// данные для создания клиента
export class CreateClientDto {
  @ApiProperty({ example: "Анна Иванова", description: "имя, минимум 2 символа" })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: "+79991234567", description: "от 7 до 20 символов: цифры, пробелы, +, -, скобки" })
  @IsString()
  @Matches(/^[+\d\s()-]{7,20}$/, { message: "некорректный номер телефона" })
  phone: string;

  // пустой email допускается, проверяем формат только если он указан
  @ApiPropertyOptional({ example: "anna@example.com" })
  @ValidateIf((client: CreateClientDto) => !!client.email)
  @IsEmail({}, { message: "некорректный email" })
  email?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isVip?: boolean;
}
