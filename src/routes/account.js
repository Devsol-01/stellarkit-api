const express = require("express");
const router = express.Router();
const { server } = require("../config/stellar");
const { success } = require("../utils/response");
const { validateAccountId } = require("../utils/validators");
const { getAssetMetadataFromToml } = require("../utils/tomlResolver");

/**
 * GET /account/:id
 * Returns full account details including XLM balance, all asset balances,
 * signers, thresholds, flags, and sequence number.
 *
 * @param {string} id - Stellar account public key (G...)
 *
 * @example
 * GET /account/GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    validateAccountId(id);

    const account = await server.loadAccount(id);

    // Separate native XLM from other assets
    const xlmBalance = account.balances.find((b) => b.asset_type === "native");
    const tokenBalances = account.balances
      .filter((b) => b.asset_type !== "native")
      .map((b) => ({
        assetCode: b.asset_code,
        assetIssuer: b.asset_issuer,
        assetType: b.asset_type,
        balance: b.balance,
        limit: b.limit,
        buyingLiabilities: b.buying_liabilities,
        sellingLiabilities: b.selling_liabilities,
        isAuthorized: b.is_authorized,
        isClawbackEnabled: b.is_clawback_enabled,
      }));

    // Minimum balance calculation
    // Min balance = (2 + subentries) * base_reserve
    // We use 0.5 XLM as the current base reserve
    const baseReserve = 0.5;
    const minBalance = (2 + account.subentry_count) * baseReserve;

    return success(res, {
      accountId: account.id,
      sequence: account.sequence,
      subentryCount: account.subentry_count,
      xlm: {
        balance: xlmBalance ? xlmBalance.balance : "0.0000000",
        buyingLiabilities: xlmBalance ? xlmBalance.buying_liabilities : "0",
        sellingLiabilities: xlmBalance ? xlmBalance.selling_liabilities : "0",
        minimumBalance: minBalance.toFixed(7),
        spendableBalance: xlmBalance
          ? Math.max(0, parseFloat(xlmBalance.balance) - minBalance).toFixed(7)
          : "0.0000000",
      },
      assets: tokenBalances,
      assetCount: tokenBalances.length,
      signers: account.signers.map((s) => ({
        key: s.key,
        type: s.type,
        weight: s.weight,
      })),
      thresholds: account.thresholds,
      flags: account.flags,
      homeDomain: account.home_domain || null,
      lastModifiedLedger: account.last_modified_ledger,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/summary", async (req, res, next) => {
  try {
    const { id } = req.params;
    validateAccountId(id);

    const [
      accountResult,
      txResult,
      offersResult,
      claimableResult,
    ] = await Promise.allSettled([
      server.loadAccount(id),
      server.transactions().forAccount(id).limit(10).order("desc").call(),
      server.offers().forAccount(id).limit(50).call(),
      server.claimableBalances().forAccount(id).limit(50).call(),
    ]);

    return success(res, {
      account:
        accountResult.status === "fulfilled"
          ? accountResult.value
          : null,

      recentTransactions:
        txResult.status === "fulfilled"
          ? txResult.value.records
          : [],

      openOffers:
        offersResult.status === "fulfilled"
          ? offersResult.value.records
          : [],

      claimableBalances:
        claimableResult.status === "fulfilled"
          ? claimableResult.value.records
          : [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /account/:id/trustlines
 * Returns all trustlines for an account with asset metadata resolved from issuer's stellar.toml.
 *
 * For each asset (non-native balance):
 * - Resolves issuer home_domain
 * - Fetches stellar.toml from the issuer's domain
 * - Extracts name, description, and image for the asset if available
 * - Gracefully handles missing or unreachable TOML files
 *
 * @param {string} id - Stellar account public key (G...)
 *
 * @example
 * GET /account/GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN/trustlines
 */
router.get("/:id/trustlines", async (req, res, next) => {
  try {
    const { id } = req.params;
    validateAccountId(id);

    const account = await server.loadAccount(id);

    // Get all trustlines (non-native balances)
    const trustlines = account.balances
      .filter((b) => b.asset_type !== "native")
      .map((b) => ({
        assetCode: b.asset_code,
        assetIssuer: b.asset_issuer,
        assetType: b.asset_type,
        balance: b.balance,
        limit: b.limit,
        buyingLiabilities: b.buying_liabilities,
        sellingLiabilities: b.selling_liabilities,
        isAuthorized: b.is_authorized,
        isClawbackEnabled: b.is_clawback_enabled,
      }));

    // Fetch issuer info and TOML metadata for each trustline
    const trustlinesWithMetadata = await Promise.all(
      trustlines.map(async (trustline) => {
        let issuerInfo = null;
        let tomlMetadata = null;

        try {
          const issuerAccount = await server.loadAccount(trustline.assetIssuer);
          issuerInfo = {
            homeDomain: issuerAccount.home_domain || null,
            flags: issuerAccount.flags,
            thresholds: issuerAccount.thresholds,
          };

          // If issuer has a home_domain, fetch TOML metadata
          if (issuerAccount.home_domain) {
            tomlMetadata = await getAssetMetadataFromToml(
              issuerAccount.home_domain,
              trustline.assetCode
            );
          }
        } catch (_) {
          // Issuer account info and TOML are optional; continue if unreachable
        }

        return {
          ...trustline,
          issuer: issuerInfo,
          metadata: tomlMetadata,
        };
      })
    );

    return success(res, {
      accountId: account.id,
      trustlineCount: trustlinesWithMetadata.length,
      trustlines: trustlinesWithMetadata,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
