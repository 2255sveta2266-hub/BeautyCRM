# BeautyCRM backend

Серверная часть BeautyCRM на Node.js, NestJS и TypeScript. Данные хранятся в памяти приложения.

## Запуск

```
npm install
npm run start:dev
```

Сервер: `http://localhost:3000`, документация Swagger: `http://localhost:3000/api/docs`.

## Структура

- `src/clients`, `src/masters`, `src/services`, `src/appointments` — модули сущностей (контроллер, сервис, dto, entity).
- `src/common/in-memory.service.ts` — общий сервис хранения в памяти, от него наследуются сервисы сущностей.
- `src/main.ts` — запуск, cors, проверка dto и swagger.

## Маршруты

Для каждого ресурса (`/clients`, `/masters`, `/services`, `/appointments`):

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| GET | /ресурс | получить список |
| GET | /ресурс/:id | получить объект (404, если нет) |
| POST | /ресурс | создать объект (400 при неверных данных) |
| PATCH | /ресурс/:id | изменить объект |
| DELETE | /ресурс/:id | удалить объект (204) |
