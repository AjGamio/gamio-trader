import { Socket } from 'net';
import { promisify } from 'util';

/**
 * Represents a network stream based on Node.js net.Socket.
 */
export class NetworkStream {
  /**
   * The underlying net.Socket instance.
   * @type {Socket}
   * @private
   */
  private socket: Socket;

  /**
   * @param {Socket} socket - The underlying net.Socket instance.
   */
  constructor(socket: Socket) {
    /**
     * The underlying net.Socket instance.
     * @type {Socket}
     * @private
     */
    this.socket = socket;
  }

  /**
   * Reads data from the network stream.
   * @returns {Promise<Buffer>} A promise that resolves to the read data.
   */
  readData(): Promise<Buffer> {
    return new Promise((resolve) => {
      /**
       * Event emitted when data is received on the network stream.
       * @event NetworkStream#data
       * @type {Buffer} The received data.
       */
      this.socket.once('data', (data) => {
        resolve(data);
      });
    });
  }

  /**
   * Writes data to the network stream.
   * @param {Buffer} data - The data to write to the stream.
   */
  writeData(data: Buffer): void {
    /**
     * Writes data to the network stream.
     * @event NetworkStream#write
     * @type {Buffer} The data to write.
     */
    this.socket.write(data);
  }

  /**
   * Reads data from the network stream asynchronously.
   * @param {Buffer} buffer - The buffer to store the read data.
   * @param {number} offset - The offset in the buffer to start writing.
   * @param {number} length - The number of bytes to read.
   * @returns {Promise<number>} A promise that resolves to the number of bytes read.
   */
  readAsync(buffer: Buffer, offset: number, length: number): Promise<number> {
    const readAsync = promisify(this.socket.read).bind(this.socket);
    return readAsync(buffer, offset, length);
  }

  /**
   * Checks whether the network stream is readable.
   * @returns {boolean} True if the network stream is readable, false otherwise.
   */
  get readable(): boolean {
    return this.socket.readable;
  }

  /**
   * Disposes of the network stream by closing the underlying socket.
   */
  dispose(): void {
    /**
     * Event emitted when the network stream is disposed.
     * @event NetworkStream#dispose
     */
    this.socket.end();
  }
}
