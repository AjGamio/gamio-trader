export interface LoginDto {
  username: string;
  password: string;
  account: string;
}

// AppLoginDto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  ValidationError,
  validateSync,
} from 'class-validator';

export class AppLoginDto implements LoginDto {
  @ApiProperty({
    description: 'User username',
    example: 'AB1123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]{2}\d{4}$/, {
    message: 'Username should be in the format AB1123',
  })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'secretpassword',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255, {
    message: 'Password should be between 1 and 255 characters',
  })
  password: string;

  @ApiProperty({
    description: 'User account',
    example: 'AB1123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]{2}\d{4}$/, {
    message: 'Account should be in the format AB1123',
  })
  account: string;

  constructor(data: AppLoginDto) {
    const errors = validateSync(this, { validationError: { target: false } });
    if (errors.length > 0) {
      const formattedErrors = errors.map((error: ValidationError) => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property} - ${constraints}`;
      });
      throw new Error(`Validation failed: ${formattedErrors.join('; ')}`);
    }

    Object.assign(this, data);
  }
}
