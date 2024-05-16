import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Post,
  Query,
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
  ApiQuery,
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
import { SellTradeDto } from 'gamio/domain/das/common/sell-trade.dto';
import { MarketOrderCommand } from 'gamio/domain/das/commands/market.order.command';
import { generateNewOrderToken } from 'gamio/domain/das/common/trade.helper';
import { OrderAction, TimeInForce } from 'gamio/domain/das/enums';
import { Types } from 'mongoose';
import {
  BuySellType,
  TradeBotOrder,
  TradeStatus,
  TradeType,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { isNil, isArray } from 'lodash';
import { Position } from 'gamio/domain/trade-bot/positionEntity';

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
    this.dasService.posRefresh();
    // this.dasService.closeConnection();
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

  /**
   * sell trade.
   *
   * @param {SellTradeDto[]} sellTradeInput - Array of sell trade input objects.
   * @returns {string} - Success message.
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('sell-trades')
  @ApiOperation({ summary: 'Sell trade from DAS server' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Sell trade request accepted',
    type: String, // Define the expected response type
  })
  @ApiBody({
    description: 'Sell trade inputs',
    type: [SellTradeDto], // Create a Sell Trade DTO class for the request body
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Sell trades request accepted',
  })
  async sellTrades(
    @Body() sellTradeInputs: SellTradeDto[],
    @Res() res: Response,
  ): Promise<void> {
    if (isNil(sellTradeInputs) || !isArray(sellTradeInputs)) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'no data provided' });
    } else {
      sellTradeInputs.map(async (s: SellTradeDto) => {
        const tradeBotOderId = new Types.ObjectId();
        const tradeBotOrder = {
          _id: tradeBotOderId,
          type: TradeType.ORDER,
          bs: BuySellType.SELL,
          symbol: s.symbol,
          route: 'SMAT',
          numberOfShares: s.quantity,
          timeOfTrade: '',
          tradeNumber: '',
          botId: 'User Action',
          botName: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: TradeStatus.PENDING,
          message: '',
          rawCommand: '',
          token: generateNewOrderToken().toString(),
        };
        await this.dasService.addBotOrder(
          tradeBotOrder as unknown as TradeBotOrder,
        );
        this.dasService.enqueueCommand(
          new MarketOrderCommand(
            tradeBotOrder.token.toString(),
            OrderAction.Sell,
            s.symbol,
            'SMAT',
            s.quantity.toString(),
            TimeInForce.DayPlus,
          ),
        );
      });
      res.status(HttpStatus.ACCEPTED).json({ message: 'Processing' });
    }
  }

  /**
   * Get paginated and sorted positions.
   * @param page - Page number
   * @param limit - Number of items per page
   * @param orderBy - Field to sort by
   * @param orderDirection - Sort order (ASC or DESC)
   * @returns Paginated and sorted positions
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/pos')
  @ApiOperation({ summary: 'Get paginated and sorted positions' })
  @ApiResponse({
    status: 200,
    description: 'Paginated and sorted positions',
    type: Position,
    isArray: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated and sorted positions',
    type: Position,
    isArray: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['ASC', 'DESC'],
    type: String,
    description: 'Sort order (ASC or DESC)',
    example: 'DESC',
  })
  async findAllOrders(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('orderBy') orderBy: keyof Position = 'symb',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    records: Position[];
    total: number;
  }> {
    page = page === 0 ? 1 : page;
    const options = {
      skip: (page - 1) * limit,
      limit,
      sort: {
        [orderBy]: orderDirection === 'ASC' ? 1 : -1,
      },
    };

    return this.dasService.getPositions(options);
  }
}
