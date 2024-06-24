import * as dotenv from 'dotenv';
import { Environment } from '../das/enums/environment';

dotenv.config({});

export const EnvConfig = {
  POLYGON_API_KEY: process.env.POLYGON_API_KEY,
  MONGO_DB_URL: process.env.MONGO_DB_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS.split(','),
  ENABLE_DEBUG: process.env.ENABLE_DEBUG === 'true',
  PORT: Number(process.env.PORT ?? 30004),
  SOCKET_PORT: Number(process.env.SOCKET_PORT ?? 30005),
  SECRET_KEY: process.env.SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  ENCRYPTION: {
    KEY: process.env.ENCRYPTION_KEY,
    VI: process.env.ENCRYPTION_VI,
  },
  APP_NAME: process.env.APP_NAME ?? 'Trading Project',
  ENVIRONMENT: Environment[process.env.NODE_ENV],
  TICKER_ORDER_QUEUE_LIMIT: Number(process.env.TICKER_ORDER_QUEUE_LIMIT) ?? 10,
  DAS: {
    USERNAME: process.env.DAS_API_UN,
    PASSWORD: process.env.DAS_API_PW,
    ACCOUNT: process.env.DAS_API_ACCT,
    SERVER: {
      ADDRESS: process.env.DAS_SERVER_ADDRESS,
      PORT: Number(process.env.DAS_SERVER_PORT),
    },
  },
  SWAGGER: {
    USER: process.env.SWAGGER_USER,
    PASSWORD: process.env.SWAGGER_USER_PASSWORD,
  },
  MAX_LISTENERS_COUNT: Number(process.env.MAX_LISTENERS_COUNT) ?? 15,
  SCHEDULER: {
    CRON: {
      MARKET_CAP: process.env.MARKET_CAP_SCHEDULER_CRON ?? '0 */10 * * * *',
      BOT_TRADE: process.env.BOT_TRADE_SCHEDULER_CRON ?? '0 */15 * * * *',
      DATA_REFRESH: process.env.DATA_REFRESH_SCHEDULER_CRON ?? '0 */20 * * * *',
    },
  },
};
