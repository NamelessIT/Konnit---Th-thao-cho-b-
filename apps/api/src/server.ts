import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { releaseExpiredHolds } from './modules/orders/orders.service';

const port = env.PORT_API;

app.listen(port, () => {
  logger.info(`API server running on http://localhost:${port}`);
});

// Quét đơn pending hết hạn giữ chỗ mỗi 60s → nhả vé về kho (không cần traffic).
setInterval(() => {
  releaseExpiredHolds().catch((err) => logger.error(err, 'releaseExpiredHolds failed'));
}, 60_000).unref();