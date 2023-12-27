import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvConfig } from './env.config';
import * as basicAuth from 'express-basic-auth';

export const setupSwagger = (app: INestApplication<any>) => {
  const options = new DocumentBuilder()
    .setTitle(EnvConfig.APP_NAME)
    .setDescription(
      `${EnvConfig.APP_NAME} [${EnvConfig.ENVIRONMENT}] API Description`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  app.use(
    (
      req: { url: string },
      res: { redirect: (arg0: number, arg1: string) => void },
      next: () => void,
    ) => {
      if (req.url === '/') {
        res.redirect(301, '/api-docs');
      } else {
        next();
      }
    },
  );
  app.use(
    ['/api-docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [EnvConfig.SWAGGER.USER]: EnvConfig.SWAGGER.PASSWORD,
      },
    }),
  );
  SwaggerModule.setup('api-docs', app, document);
};
