import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  BuyInCommand,
  ClientCommand,
  EchoCommand,
} from 'gamio/domain/das/commands';
import { DasService } from 'gamio/domain/das/das.service';
import { AppLoginDto } from 'gamio/domain';
import { POSRefreshCommand } from 'gamio/domain/das/commands/pos.refresh.command';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';
import { AuthService } from '../auth/auth.service';

@ApiTags('Das')
@Controller('das')
export class DASController {
  private readonly logger: Logger;

  constructor(
    private readonly dasService: DasService,
    private authService: AuthService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * @summary Login to DAS server
   * @param {AppLoginDto} credentials - User credentials for login
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
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
  async login(
    @Body() credentials: AppLoginDto,
    @Res() res: Response,
  ): Promise<void> {
    const { access_token } = await this.authService.signIn(credentials);
    this.dasService.enqueueCommand(POSRefreshCommand.Instance);
    this.dasService.enqueueCommand(ClientCommand.Instance);
    this.dasService.enqueueCommand(EchoCommand.Instance);
    this.dasService.enqueueCommand(BuyInCommand.Instance);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Ok', access_token });
  }

  /**
   * @summary Get DAS clients
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/clients')
  @ApiOperation({ summary: 'Get DAS clients' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Client request accepted',
  })
  async clients(@Res() res: Response): Promise<void> {
    const clientCommand = ClientCommand.Instance;
    this.logger.log(clientCommand.Name);
    this.dasService.enqueueCommand(clientCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing' });
  }

  /**
   * @summary Echo command
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/echo')
  @ApiOperation({ summary: 'Echo command' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Echo request accepted',
  })
  async echo(@Res() res: Response): Promise<void> {
    const echoCommand = EchoCommand.Instance;
    this.logger.log(echoCommand.Name);
    this.dasService.enqueueCommand(echoCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing' });
  }

  /**
   * @summary Get Buying Power
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/buying-power')
  @ApiOperation({ summary: 'Get Buying Power' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Buying Power request accepted',
  })
  async buyingPower(@Res() res: Response): Promise<void> {
    const bpCommand = BuyInCommand.Instance;
    this.logger.log(bpCommand.Name);
    this.dasService.enqueueCommand(bpCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing' });
  }

  /**
   * @summary Refresh POS
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/pos-refresh')
  @ApiOperation({ summary: 'Refresh POS' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'POS refresh request accepted',
  })
  async posRefresh(@Res() res: Response): Promise<void> {
    const posRefreshCommand = POSRefreshCommand.Instance;
    this.logger.log(posRefreshCommand.Name);
    this.dasService.enqueueCommand(posRefreshCommand);
    this.dasService.closeConnection();
    res.status(HttpStatus.ACCEPTED).json({ message: 'Processing' });
  }

  /**
   * @summary Logout from DAS server
   * @param {Response} res - Express response object
   * @returns {void}
   */
  @Get('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from DAS server' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout request accepted',
  })
  closeConnection(@Res() res: Response): void {
    res.status(HttpStatus.OK).json({ message: 'Processed' });
  }
}
