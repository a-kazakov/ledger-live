import BigNumber from "bignumber.js";
import {
  NotEnoughGas,
  FeeNotLoaded,
  FeeRequired,
  InvalidAddress,
  ETHAddressNonEIP,
  // GasLessThanEstimate,
} from "@ledgerhq/errors";
import { Transaction as EvmTransaction } from "./types";
import { Account } from "../../types";
import { ethers } from "ethers";

type ValidatedTransactionFields = "recipient" | "gasLimit" | "gasPrice";
type ValidationIssues = Partial<Record<ValidatedTransactionFields, Error>>;

type getTransactionStatusFn = (
  account: Account,
  tx: EvmTransaction
) => Promise<{
  errors: ValidationIssues;
  warnings: ValidationIssues;
  estimatedFees: BigNumber;
  amount: BigNumber;
  totalSpent: BigNumber;
}>;

const DEFAULT_GAS_LIMIT = new BigNumber(21000);
const ethAddressRegEx = /^(0x)?[0-9a-fA-F]{40}$/;

const validateRecipient = (
  account: Account,
  tx: EvmTransaction
): Array<ValidationIssues> => {
  const errors: ValidationIssues = {};
  const warnings: ValidationIssues = {};

  if (tx.recipient) {
    // Check if recipient is a valid eth address or not
    if (
      !ethers.utils.isAddress(tx.recipient) ||
      !tx.recipient.match(ethAddressRegEx)
    ) {
      errors.recipient = new InvalidAddress("", {
        currency: account.currency,
      });
    } else {
      // Check if address is respecting EIP-55
      try {
        const recipientChecksumed = ethers.utils.getAddress(tx.recipient);
        if (tx.recipient !== recipientChecksumed) {
          throw new Error();
        }
      } catch (e) {
        warnings.recipient = new ETHAddressNonEIP();
      }
    }
  }

  return [errors, warnings];
};

const validateGas = (
  account: Account,
  tx: EvmTransaction,
  gasLimit: BigNumber,
  estimatedFees: BigNumber
): Array<ValidationIssues> => {
  const errors: ValidationIssues = {};
  const warnings: ValidationIssues = {};

  if (!tx.gasPrice) {
    errors.gasPrice = new FeeNotLoaded();
  } else if (gasLimit.eq(0)) {
    errors.gasLimit = new FeeRequired();
  } else if (!errors.recipient) {
    if (estimatedFees.gt(account.balance)) {
      errors.gasPrice = new NotEnoughGas();
    }
  }

  // if (t.estimatedGasLimit && gasLimit.lt(t.estimatedGasLimit)) {
  //   warnings.gasLimit = new GasLessThanEstimate();
  // }

  return [errors, warnings];
};

export const getTransactionStatus: getTransactionStatusFn = (account, tx) => {
  const gasLimit = tx.gasLimit || DEFAULT_GAS_LIMIT;
  /** @TODO Change for EIP1559 */
  const estimatedFees = (tx.gasPrice || new BigNumber(0)).times(gasLimit);

  // Recipient related errors and warnings
  const [recipientErr, recipientWarn] = validateRecipient(account, tx);
  // Gas related errors and warnings
  const [gasErr, gasWarn] = validateGas(account, tx, gasLimit, estimatedFees);

  const errors: ValidationIssues = {
    ...recipientErr,
    ...gasErr,
  };
  const warnings: ValidationIssues = {
    ...recipientWarn,
    ...gasWarn,
  };

  return Promise.resolve({
    errors,
    warnings,
    estimatedFees,
    amount: tx.amount,
    totalSpent: tx.amount.plus(estimatedFees),
  });
};

export default getTransactionStatus;
