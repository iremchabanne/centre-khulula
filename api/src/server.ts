// The entry point: builds the application and opens the port.

import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';
import { connectRedis } from './redis';

// Redis first, then the port. Sessions live in Redis, so a server that
// accepted requests without it would fail every login with a confusing error.
await connectRedis();

const app = createApp();

app.listen(config.port, () => {
  logger.info('API started', { port: config.port, environment: config.environment });
});
