import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DASController } from './das.controller';
import { DasEventModule } from '../das-event/das-event.module';
import { SchedulerModule } from 'gamio/domain/scheduler/scheduler.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { EnvConfig } from 'gamio/domain/config/env.config';

/**
 * Module for the DAS (Direct Access Service) functionality.
 */
@Module({
  imports: [
    // Register microservices client for DAS_SERVICE
    ClientsModule.register([
      {
        name: 'DAS_SERVICE',
        transport: Transport.TCP,
        options: {
          port: EnvConfig.PORT, // Change this port as needed
        },
      },
    ]),
    JwtModule.register({
      secret: EnvConfig.JWT_SECRET,
      signOptions: { expiresIn: '1d' }, // Adjust the expiration as needed
    }),
    DasEventModule,
    SchedulerModule,
    AuthModule,
  ],
  providers: [], // No additional providers for now
  controllers: [DASController], // Include the DASController in the module
})
export class DasModule {}
