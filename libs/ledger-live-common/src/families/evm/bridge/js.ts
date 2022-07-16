import type { AccountBridge, CurrencyBridge } from "../../../types";
import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import { getTransactionStatus } from "../getTransactionStatus";
import type { Transaction as EvmTransaction } from "../types";
import { prepareTransaction } from "../prepareTransaction";
import { createTransaction } from "../createTransaction";
import { sync, scanAccounts } from "../synchronization";
// impor../prepareTransaction } from "../js-estimateMaxSpendable";
// import { getTransactionStatus } from "../js-getTransactionStatus";
// import { signOperation } from "../js-signOperation";
// import { broadcast } from "../js-broadcast";

const receive = makeAccountBridgeReceive();

const updateTransaction = (t, patch): EvmTransaction => {
  return { ...t, ...patch };
};

const preload = async (): Promise<Record<any, any>> => Promise.resolve({});

const hydrate = (): void => {};

const currencyBridge: CurrencyBridge = {
  preload,
  hydrate,
  scanAccounts,
};

const accountBridge: AccountBridge<EvmTransaction> = {
  createTransaction,
  updateTransaction,
  prepareTransaction,
  getTransactionStatus,
  sync,
  receive,
  signOperation: () => ({} as any),
  broadcast: async () => ({} as any),
  estimateMaxSpendable: async () => ({} as any),
};

export default {
  currencyBridge,
  accountBridge,
};
