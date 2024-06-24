export class StringBuilder {
  private value: string;

  constructor() {
    this.value = '';
  }

  append(str: string): void {
    this.value += str;
  }

  toString(): string {
    return this.value;
  }
}
