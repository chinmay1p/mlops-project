const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register, prefix: 'finguard_backend_' });

// HTTP request count
const httpRequestCounter = new client.Counter({
  name: 'finguard_http_requests_total',
  help: 'Total HTTP requests received by backend',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'finguard_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Transactions count by status & smurfing
const transactionsProcessed = new client.Counter({
  name: 'finguard_transactions_total',
  help: 'Total transactions processed by FinGuard',
  labelNames: ['status', 'is_smurfing'],
  registers: [register],
});

// Transaction amount distribution
const transactionAmount = new client.Histogram({
  name: 'finguard_transaction_amount_usd',
  help: 'Distribution of transaction amounts in USD',
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

module.exports = {
  register,
  httpRequestCounter,
  httpRequestDuration,
  transactionsProcessed,
  transactionAmount,
};
