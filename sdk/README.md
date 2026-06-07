# StellarKit JavaScript Client

A lightweight, class-based JavaScript client for the StellarKit API. Integrate Stellar blockchain data into your apps without writing raw fetch calls.

## Installation

Download `stellarkit-client.js` and include it in your project:

```javascript
const StellarKitClient = require('./sdk/stellarkit-client');
```

For browser usage:
```html
<script src="sdk/stellarkit-client.js"></script>
```

## Getting Started

Initialize the client with your API base URL and an optional API key.

```javascript
const client = new StellarKitClient({
  baseUrl: 'http://localhost:3000', // or your production URL
  apiKey: 'your-api-key'            // optional
});
```

## Usage Examples

### Network & Fees

```javascript
// Get current network status
const status = await client.getNetworkStatus();
console.log(`Latest Ledger: ${status.latestLedger.sequence}`);

// Get recommended fees for a transaction with 3 operations
const fees = await client.getFeeEstimate(3);
console.log(`Recommended Standard Fee: ${fees.totalFee.standard.stroops} stroops`);

// Check if there is a fee surge
const surge = await client.getFeeSurgeStatus();
if (surge.isSurging) {
  console.log('Warning: Fee surge in progress');
}
```

### Account Details

```javascript
const accountId = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';

// Get full account info
const account = await client.getAccount(accountId);
console.log(`XLM Balance: ${account.xlm.balance}`);

// Get account age and activity
const inactivity = await client.getAccountInactivity(accountId);
console.log(`Account status: ${inactivity.status}`);

// Check if account can receive USDC
const canReceive = await client.getAccountCanReceive(
  accountId, 
  'USDC', 
  'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
);
if (!canReceive.canReceive) {
  console.log(`Reason: ${canReceive.reasons.join(', ')}`);
}
```

### Assets & DEX

```javascript
// Get asset statistics
const asset = await client.getAsset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN');
console.log(`Total Supply: ${asset.amount}`);

// Calculate DEX spread for XLM/USDC
const spread = await client.getDexSpread(
  'XLM:native', 
  'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
);
console.log(`Bid-Ask Spread: ${spread.spreadPercent}%`);

// Find effective exchange rate for 100 XLM to USDC
const price = await client.getDexPrice(
  'XLM:native', 
  'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  100
);
console.log(`You will receive: ${price.buyAmount} USDC`);
```

### Utilities

```javascript
// Validate a public key locally
const validation = await client.validateAccount('GAAZI4...');
if (!validation.isValid) {
  console.error(`Invalid key: ${validation.reason}`);
}

// Fund a testnet account
await client.fundAccount('GAAZI4...');
```

## Error Handling

The client throws descriptive errors for non-200 responses.

```javascript
try {
  await client.getAccount('INVALID_KEY');
} catch (error) {
  console.error(`Error ${error.status}: ${error.message} (${error.type})`);
}
```

## Methods Reference

Every endpoint in the StellarKit API has a corresponding method. All methods return a `Promise` that resolves to the `data` field of the API response.

| Category | Method | Description |
| --- | --- | --- |
| **Network** | `getNetworkStatus()` | Latest ledger, fees, and protocol info |
| | `getNetworkLedgerTiming()` | Analyze network ledger close time consistency |
| **Fees** | `getFeeEstimate(ops)` | Fee tiers for transaction submission |
| | `getFeeSurgeStatus()` | Identify current fee surge periods |
| | `getFeeTrends()` | Analyze fee trends across last 50 ledgers |
| **Account** | `getAccount(id)` | Full account details, balances, signers |
| | `getAccountBalances(id)` | Native XLM and asset balances |
| | `getAccountSequence(id)` | Current sequence number |
| | `getAccountInactivity(id)` | Detect account inactivity (dormancy) |
| | `getAccountCanReceive(id, code, issuer)` | Check if account can receive an asset |
| | `getAccountSummary(id)` | Consolidated account, tx, and offer summary |
| | `getAccountTrustlines(id)` | Trustlines with resolved TOML metadata |
| | `getAccountPoolPositions(id)` | Share values in all liquidity pools |
| | `searchAccountTransactions(id, memo)` | Search transactions by memo content |
| **DEX** | `getDexSpread(sell, buy)` | Calculate bid-ask spread for a pair |
| | `getDexPrice(sell, buy, amt)` | Best effective exchange rate |
| | `getDexDepth(sell, buy)` | Full order book depth analysis |
| **Liquidity Pools** | `getPoolProfitability(id)` | Annualized fee income estimate |
| | `getPoolReserveRatio(id)` | Current reserve ratio and drift |
| **Utils** | `fundAccount(id)` | Fund testnet account via Friendbot |
| | `validateAccount(id)` | Validate public key format locally |
| | `decodeXdr(xdr)` | Decode transaction XDR to JSON |

... and many more. See `sdk/stellarkit-client.js` for the full list and JSDoc documentation.
