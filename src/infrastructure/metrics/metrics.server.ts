import { type Server, createServer } from 'node:http';
import type { Registry } from 'prom-client';
import type { ILogger } from '../../domain/ports/logger.port.js';

export function createMetricsServer(registry: Registry, port: number, logger: ILogger): Server {
  const server = createServer(async (req, res) => {
    if (req.url === '/metrics' && req.method === 'GET') {
      res.setHeader('Content-Type', registry.contentType);
      res.end(await registry.metrics());
    } else if (req.url === '/health' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  server.listen(port, () => {
    logger.info(`Metrics server listening on port ${port}`);
  });

  return server;
}
