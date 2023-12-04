import { NestFactory } from '@nestjs/core';
import { TraderClientModule } from './trader-client.module';

async function bootstrap() {
  const app = await NestFactory.create(TraderClientModule);
  await app.listen(3000);
}
bootstrap();
