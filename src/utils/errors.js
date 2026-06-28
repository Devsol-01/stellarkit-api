/**
 * Creates a structured AccountNotFound error for Horizon 404 responses.
 *
 * @param {string} accountId - Stellar public key that was not found
 * @param {string} network - Network name ("testnet" or "mainnet")
 * @returns {Error}
 */
function makeAccountNotFoundError(accountId, network) {
  const err = new Error(
    `Account ${accountId} was not found on the Stellar ${network} network.`
  );
  err.isAccountNotFound = true;
  err.accountId = accountId;
  err.network = network;
  err.status = 404;
  return err;
}

/**
 * Creates a structured ClaimableBalanceNotFound error for Horizon 404 responses.
 *
 * @param {string} balanceId - Claimable balance ID that was not found
 * @param {string} network - Network name ("testnet" or "mainnet")
 * @returns {Error}
 */
function makeClaimableBalanceNotFoundError(balanceId, network) {
  const err = new Error(
    `Claimable balance ${balanceId} was not found on the Stellar ${network} network.`
  );
  err.isClaimableBalanceNotFound = true;
  err.balanceId = balanceId;
  err.network = network;
  err.status = 404;
  return err;
}

module.exports = { makeAccountNotFoundError, makeClaimableBalanceNotFoundError };
