import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const port = env.PORT_API;

app.listen(port, () => {
  logger.info(`API server running on http://localhost:${port}`);
});
