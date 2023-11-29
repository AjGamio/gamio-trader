// das.service.ts

import { Injectable } from '@nestjs/common';
import { TraderClient } from './client/trader-client';
import { ITcpCommand } from './interfaces/iCommand';

// ... Other imports

@Injectable()
export class DasService {
  private traderClient: TraderClient;

  constructor() {
    // Initialize TraderClient with appropriate parameters
    // this.initTradeClient();
  }

  public async initTradeClient(server: { address: string; port: number }) {
    this.traderClient = new TraderClient(server.address, server.port);
    await this.traderClient.connectAsync();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Subscribe to events from TraderClient
    this.traderClient.on('PriceInquiry', this.handlePriceInquiry.bind(this));
    this.traderClient.on('LoginResponse', this.handlePriceInquiry.bind(this));
    // Add similar lines for other events
  }

  private handlePriceInquiry(responseEvent: any) {
    // Handle PriceInquiry event
    console.log('Price Inquiry Event:', responseEvent);
    // Implement your logic here
  }

  // Add similar methods for other event handlers

  connectToServer() {
    this.traderClient.connectAsync();
  }

  sendDataToServer(command: ITcpCommand) {
    this.traderClient.sendCommandAsync(command);
  }

  closeConnection(force?: boolean) {
    this.traderClient.dispose(force);
  }
}
