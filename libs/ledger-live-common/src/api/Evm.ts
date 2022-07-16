import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { CryptoCurrency } from "@ledgerhq/cryptoassets";
import { Transaction as EvmTransaction } from "../families/evm/types";
import { liveTxToEthersTx } from "../families/evm/transaction";

type AsyncApiFunction = (api: ethers.providers.JsonRpcProvider) => Promise<any>;

/**
 * Connects to RPC Node
 */
async function withApi(
  currency: CryptoCurrency,
  execute: AsyncApiFunction
): Promise<any> {
  if (!currency?.rpc) {
    throw new Error("Currency doesn't have an RPC node provided");
  }

  const provider = new ethers.providers.JsonRpcProvider(currency.rpc);
  return await execute(provider);
}

type GetAccountFn = (
  currency: CryptoCurrency,
  addr: string
) => Promise<{ blockHeight: number; balance: BigNumber; nonce: number }>;

/**
 * Get account balances and nonce
 */
export const getAccount: GetAccountFn = async (currency, addr) =>
  withApi(currency, async (api) => {
    console.warn("RPC wesh", currency.rpc);
    try {
      const [balance, nonce, blockHeight] = await Promise.all([
        getBalance(currency, addr),
        getTransactionCount(currency, addr),
        api.getBlockNumber(),
      ]);

      return {
        blockHeight,
        balance: new BigNumber(balance.toString()),
        nonce,
      };
    } catch (e) {
      console.error(e);
    }
  });

export const getTransaction = (
  currency: CryptoCurrency,
  hash: string
): Promise<ethers.providers.TransactionResponse> =>
  withApi(currency, (api) => {
    return api.getTransaction(hash);
  });

export const getBalance = (
  currency: CryptoCurrency,
  addr: string
): Promise<BigNumber> =>
  withApi(currency, async (api) => {
    try {
      const balance = await api.getBalance(addr);
      return new BigNumber(balance.toString());
    } catch (e) {
      return new BigNumber(0);
    }
  });

export const getTransactionCount = (
  currency: CryptoCurrency,
  addr: string
): Promise<number> =>
  withApi(currency, async (api) => {
    try {
      return await api.getTransactionCount(addr);
    } catch (e) {
      return 0;
    }
  });

export const getGasEstimation = (
  currency: CryptoCurrency,
  transaction: EvmTransaction
): Promise<BigNumber> =>
  withApi(currency, async (api) => {
    try {
      const ethersTransaction = liveTxToEthersTx(
        transaction
      ) as ethers.providers.TransactionRequest;
      const gasEtimation = await api.estimateGas(ethersTransaction);

      return new BigNumber(gasEtimation.toString());
    } catch (e) {
      return new BigNumber(21000);
    }
  });

// /**
//  * Returns true if account is the signer
//  */
// function isSender(transaction: Transaction, addr: string): boolean {
//   return transaction.from === addr;
// }

// /**
//  * Map transaction to an Operation Type
//  */
// function getOperationType(
//   transaction: EvmTransaction,
//   addr: string
// ): OperationType {
//   return isSender(transaction, addr) ? "OUT" : "IN";
// }

// /**
//  * Map transaction to a correct Operation Value (affecting account balance)
//  */
// function getOperationValue(
//   transaction: EvmTransaction,
//   addr: string
// ): BigNumber {
//   return isSender(transaction, addr)
//     ? transaction.amount.plus(0)
//     : transaction.amount.plus(0);
// }

// /**
//  * Extract extra from transaction if any
//  */
// function getOperationExtra(): any {
//   return {
//     // additionalField: transaction.additionalField,
//   };
// }

// /**
//  * Map the MyCoin history transaction to a Ledger Live Operation
//  */
// function transactionToOperation(
//   accountId: string,
//   addr: string,
//   transaction: EvmTransaction
// ): any {
//   const type = getOperationType(transaction, addr);

//   return {
//     // id: transaction.hash,
//     // accountId,
//     // fee: BigNumber(transaction.fees || 0),
//     // value: getOperationValue(transaction, addr),
//     type,
//     // // This is where you retrieve the hash of the transaction
//     hash: transaction.hash,
//     // blockHash: null,
//     // blockHeight: transaction.blockNumber,
//     // date: new Date(transaction.timestamp),
//     // extra: getOperationExtra(transaction),
//     // senders: [transaction.sender],
//     // recipients: transaction.recipient ? [transaction.recipient] : [],
//     // transactionSequenceNumber: isSender(transaction, addr)
//     //   ? transaction.nonce
//     //   : undefined,
//     // hasFailed: !transaction.success,
//   };
// }
