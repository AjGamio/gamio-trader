import { Socket } from 'net';
import { EventEmitter } from 'events';
import { processSocketData } from '../common/data.helper';

class CancellationToken {
  private isCancellationRequested: boolean = false;
  private eventEmitter: EventEmitter = new EventEmitter();

  public get isCancellation(): boolean {
    return this.isCancellationRequested;
  }

  public cancel(): void {
    this.isCancellationRequested = true;
    this.eventEmitter.emit('cancellationRequested');
  }

  public onCancellationRequested(callback: () => void): void {
    this.eventEmitter.on('cancellationRequested', callback);
  }
}

class ResponseProcessor {
  private cancellationToken: CancellationToken;

  constructor(cancellationToken: CancellationToken) {
    this.cancellationToken = cancellationToken;
  }

  async listenAsync(stream: Socket): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const onData = (data: Buffer) => {
        const receivedData = data.toString();
        this.triggerEvent(receivedData);
      };

      const onError = (err: Error) => {
        console.error('Error:', err.message);
        reject(err);
        this.stopListening();
      };

      const onClose = () => {
        console.log('Connection closed');
        this.stopListening();
        resolve();
      };

      // Attach event listeners
      stream.on('data', onData);
      stream.on('error', onError);
      stream.on('close', onClose);

      // const stopListening = () => {
      //   // Remove event listeners
      //   stream.off('data', onData);
      //   stream.off('error', onError);
      //   stream.off('close', onClose);
      // };

      // // Set up cancellation
      // this.cancellationToken?.onCancellationRequested(() => {
      //   console.log('Cancellation requested');
      //   stopListening();
      //   resolve();
      // });
    });
  }

  private triggerEvent(data: string) {
    // Implement your logic to handle the received data, e.g., trigger an event
    // console.log('Triggering event with data:', data);
    if (data.indexOf('#POS') > -1) {
      const positions = processSocketData(data);
      console.log(
        '🚀 ~ file: response.processor.ts:37 ~ ResponseProcessor ~ onData ~ positions:',
        JSON.stringify(positions),
      );
    }
  }

  private stopListening() {
    // Implement cleanup logic or additional actions when stopping listening
    console.log('Stopping listening');
  }
}

export { ResponseProcessor, CancellationToken };
