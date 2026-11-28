import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // разрешаем запросы с адреса фронтенда (vite)
  app.enableCors({ origin: ["http://localhost:5173"] });

  // проверка dto: лишние поля отбрасываем с ошибкой, при неверных данных будет 400
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // swagger открывается по адресу /api/docs
  const config = new DocumentBuilder()
    .setTitle("BeautyCRM API")
    .setDescription("серверная часть crm для салона красоты: клиенты, мастера, услуги и записи")
    .setVersion("1.0")
    .build();
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
