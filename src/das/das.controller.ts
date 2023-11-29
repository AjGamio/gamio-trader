import { Controller, Get } from '@nestjs/common';
import {
  BuyInCommand,
  ClientCommand,
  EchoCommand,
  LoginCommand,
  LogoutCommand,
  OrderServerStatusCommand,
} from 'gamio/domain/das/commands';
import { DasService } from 'gamio/domain/das/das.service';

@Controller('das')
export class DASController {
  constructor(private readonly dasService: DasService) {
    this.dasService.initTradeClient({ address: '15.206.151.29', port: 9800 });
  }

  @Get('login')
  sendTestData() {
    const loginCommand = new LoginCommand('CB3512', 'JanQ44bb', 'TR3512');
    this.dasService.sendDataToServer(loginCommand);
    this.dasService.sendDataToServer(ClientCommand.Instance);
    this.dasService.sendDataToServer(EchoCommand.Instance);
    this.dasService.sendDataToServer(BuyInCommand.Instance);
    this.dasService.sendDataToServer(OrderServerStatusCommand.Instance);
    this.dasService.closeConnection();
    return 'Data sent to the server';
  }

  @Get('logout')
  closeConnection() {
    this.dasService.sendDataToServer(LogoutCommand.Instance);
    // this.dasService.closeConnection(true);
    return 'Connection closed';
  }
}
