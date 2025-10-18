import { createApp, port } from './app';
import { prisma } from './lib/prisma';

const app = createApp();

const server = app.listen(port, () => {
  console.log(`Noah API listening on port ${port}`);
});

const shutdown = async () => {
  console.log('Shutting down API...');
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
