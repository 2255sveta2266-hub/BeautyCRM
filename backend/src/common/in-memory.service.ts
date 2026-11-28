import { NotFoundException } from "@nestjs/common";

// общий сервис хранения в памяти, чтобы не повторять crud в каждом модуле
// позже вместо массива будет база postgresql, а сервисы сущностей почти не изменятся
export abstract class InMemoryService<T extends { id: number }> {
  protected items: T[] = [];
  private nextId = 1;

  // entityName нужно только для понятных сообщений об ошибках
  constructor(private readonly entityName: string) {}

  findAll(): T[] {
    return this.items;
  }

  // если объекта нет, возвращаем 404, а не пустой успешный ответ
  findOne(id: number): T {
    const item = this.items.find((x) => x.id === id);
    if (!item) {
      throw new NotFoundException(`${this.entityName}: объект с id ${id} не найден`);
    }
    return item;
  }

  // нужно другим сервисам, чтобы проверить, что связанный объект существует
  has(id: number): boolean {
    return this.items.some((x) => x.id === id);
  }

  create(data: Omit<T, "id">): T {
    const item = { ...data, id: this.nextId++ } as T;
    this.items.push(item);
    return item;
  }

  update(id: number, data: Partial<Omit<T, "id">>): T {
    const item = this.findOne(id);
    Object.assign(item, data);
    return item;
  }

  remove(id: number): void {
    const item = this.findOne(id);
    this.items = this.items.filter((x) => x !== item);
  }
}
