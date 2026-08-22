// The entry point: builds the application and opens the port.

import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';

const app = createApp();

app.listen(config.port, () => {
  logger.info('API started', { port: config.port, environment: config.environment });
});
