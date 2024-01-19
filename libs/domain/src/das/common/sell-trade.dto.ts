// src/trades/dto/trade-input.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

/**
 * Data Transfer Object for sell trade input.
 *
 * @class
 */
export class SellTradeDto {
  /**
   * Symbol of the trade.
   *
   * @type {string}
   */
  @ApiProperty()
  @IsString()
  symbol: string;

  /**
   * Type of the trade.
   *
   * @type {number}
   */
  @ApiProperty()
  @IsNumber()
  type: number;

  /**
   * Quantity of the trade.
   *
   * @type {number}
   */
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}
