# Getting Started with StellarKit API

This guide walks you through setting up StellarKit API on your local machine and making your first API calls. No prior Stellar knowledge is required.

## Prerequisites

- **Node.js** version 18 or higher ([download](https://nodejs.org/))
- **npm** version 9 or higher (comes with Node.js)
- A terminal (macOS Terminal, Windows PowerShell, or Linux shell)

## 1. Clone the repository

```bash
git clone https://github.com/stellarkit-lab-devtools/stellarkit-api.git
cd stellarkit-api
```

## 2. Install dependencies

```bash
npm install
```

This installs Express, the Stellar SDK, and all other packages the API needs.

## 3. Configure environment variables

Copy the example environment file to create your own `.env`:

```bash
cp .env.example .env
```

Open `.env` in your editor. The defaults work out of the box for the Stellar **testnet** (a free sandbox network), so you don't need to change anything to get started:

```env
# Which Stellar network to use: "testnet" (free sandbox) or "mainnet" (real funds)
STELLAR_NETWORK=testnet

# Horizon server URL — leave blank to use the default for your chosen network
HORIZON_URL=

# Port the API server listens on
PORT=3000

# Development mode gives you detailed error messages
NODE_ENV=development

# Max requests per IP per 15-minute window
RATE_LIMIT_MAX=100

# How long to cache network-status and fee-estimate responses (milliseconds)
CACHE_TTL_MS=5000
```

> **Tip:** The testnet is perfect for learning. It uses free test XLM and doesn't require any accounts or keys to query.

## 4. Start the server

```bash
npm start
```

You should see output like:

```
StellarKit API running on port 3000
Network : testnet
Docs    : http://localhost:3000/
```

For development with auto-reload on file changes, use:

```bash
npm run dev
```

## 5. Make your first API calls

Open a new terminal window and try these three requests:

### Check the service health

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "StellarKit API",
    "version": "1.0.0",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "network": "testnet"
  }
}
```

### Get current network status

This returns the latest ledger information from the Stellar network, including fees and protocol version.

```bash
curl http://localhost:3000/network-status
```

Expected response:

```json
{
  "success": true,
  "data": {
    "network": "testnet",
    "horizonUrl": "https://horizon-testnet.stellar.org",
    "latestLedger": {
      "sequence": 1234567,
      "closedAt": "2024-01-01T12:00:00.000Z",
      "transactionCount": 5,
      "operationCount": 12,
      "totalCoins": "100000000000.0000000",
      "feePool": "1234.5678900"
    },
    "fees": {
      "baseFeeInStroops": 100,
      "baseFeeInXLM": "0.0000100",
      "basereserveInStroops": 5000000,
      "baseReserveInXLM": "0.5000000"
    },
    "protocol": {
      "version": 20
    }
  }
}
```

### Get a fee estimate

This tells you how much to pay in transaction fees at different priority levels.

```bash
curl http://localhost:3000/fee-estimate
```

Expected response:

```json
{
  "success": true,
  "data": {
    "note": "Fee estimates for a transaction with 1 operation(s)...",
    "operationCount": 1,
    "perOperation": {
      "economy": { "stroops": 100, "xlm": "0.0000100", "description": "Minimum — may be slow during congestion" },
      "standard": { "stroops": 200, "xlm": "0.0000200", "description": "Recommended for most transactions" },
      "priority": { "stroops": 500, "xlm": "0.0000500", "description": "Fast inclusion even during high network load" }
    }
  }
}
```

## Next steps

- Visit `http://localhost:3000/` in your browser to see all available endpoints.
- Look up a Stellar account: `curl http://localhost:3000/account/<public-key>` (use any testnet account address).
- Run the test suite: `npm test`
- Read the full [API Reference](../README.md#api-reference) in the README.
