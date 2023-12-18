import * as dotenv from 'dotenv';
import { Environment } from 'gamio/domain/das/enums/environment';

dotenv.config({});

export const EnvConfig = {
  POLYGON_API_KEY: process.env.POLYGON_API_KEY,
  MONGO_DB_URL: process.env.MONGO_DB_URL,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  ENABLE_DEBUG: process.env.ENABLE_DEBUG,
  PORT: Number(process.env.PORT) ?? 30004,
  SOCKET_PORT: process.env.SOCKET_PORT ?? 30005,
  SECRET_KEY: process.env.SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
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
};
