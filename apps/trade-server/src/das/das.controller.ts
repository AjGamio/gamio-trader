import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  BuyInCommand,
  ClientCommand,
  EchoCommand,
  LoginCommand,
  LogoutCommand,
} from 'gamio/domain/das/commands';
import { DasService } from 'gamio/domain/das/das.service';
import { AppLoginDto } from 'gamio/domain';
import { POSRefreshCommand } from 'gamio/domain/das/commands/pos.refresh.command';
import { EnvConfig } from '../config/env.config';

@ApiTags('DAS')
@Controller('das')
export class DASController {
  private readonly logger: Logger;

  constructor(private readonly dasService: DasService) {
    this.logger = new Logger(this.constructor.name);
    this.dasService.setupTradeClient({
      username: EnvConfig.DAS.USERNAME,
      password: EnvConfig.DAS.PASSWORD,
      account: EnvConfig.DAS.ACCOUNT,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login to DAS server' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Login request accepted',
    type: String, // Define the expected response type
  })
  @ApiBody({
    description: 'User credentials for login',
    type: AppLoginDto, // Create a DTO class for the request body
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Login request accepted',
  })
  async login(@Body() credentials: AppLoginDto, @Res() res: Response) {
    const loginCommand = new LoginCommand(
      credentials.username,
      credentials.password,
      credentials.account,
    );
    this.logger.log(loginCommand.Name);
    this.dasService.enqueueCommand(loginCommand);
    this.dasService.enqueueCommand(ClientCommand.Instance);
    this.dasService.enqueueCommand(EchoCommand.Instance);
    this.dasService.enqueueCommand(BuyInCommand.Instance);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing ......' });
  }

  @Get('/clients')
  @ApiOperation({ summary: 'Get DAS clients' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Client request accepted',
  })
  async clients(@Res() res: Response) {
    const clientCommand = ClientCommand.Instance;
    this.logger.log(clientCommand.Name);
    this.dasService.enqueueCommand(clientCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing ......' });
  }

  @Get('/echo')
  @ApiOperation({ summary: 'Echo command' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Echo request accepted',
  })
  async echo(@Res() res: Response) {
    const echoCommand = EchoCommand.Instance;
    this.logger.log(echoCommand.Name);
    this.dasService.enqueueCommand(echoCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing ......' });
  }

  @Get('/buying-power')
  @ApiOperation({ summary: 'Get Buying Power' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Buying Power request accepted',
  })
  async buyingPower(@Res() res: Response) {
    const bpCommand = BuyInCommand.Instance;
    this.logger.log(bpCommand.Name);
    this.dasService.enqueueCommand(bpCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing ......' });
  }

  @Get('/pos-refresh')
  @ApiOperation({ summary: 'Refresh POS' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'POS refresh request accepted',
  })
  async posRefresh(@Res() res: Response) {
    const posRefreshCommand = POSRefreshCommand.Instance;
    this.logger.log(posRefreshCommand.Name);
    this.dasService.enqueueCommand(posRefreshCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing ......' });
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout from DAS server' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout request accepted',
  })
  closeConnection(@Res() res: Response) {
    const logoutCommand = LogoutCommand.Instance;
    this.dasService.enqueueCommand(logoutCommand);
    res.status(HttpStatus.OK).json({ message: 'Processed' });
  }
}
