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

// Usage example:
const sb = new StringBuilder();
sb.append('Hello, ');
sb.append('world!');
const result = sb.toString();
console.log(result); // Output: Hello, world!
