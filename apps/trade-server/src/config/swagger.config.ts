import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvConfig } from './env.config';

export const setupSwagger = (app: INestApplication<any>) => {
  const options = new DocumentBuilder()
    .setTitle(EnvConfig.APP_NAME)
    .setDescription(
      `${EnvConfig.APP_NAME} [${EnvConfig.ENVIRONMENT}] API Description`,
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
};
