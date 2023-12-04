import { EventEmitter } from 'events';

export class GenericEventEmitter<T, S extends string> extends EventEmitter {
  on(event: S, listener: (args: T) => void): this {
    return super.on(event, listener);
  }

  emit(event: S, args: T): boolean {
    return super.emit(event, args);
  }
}
