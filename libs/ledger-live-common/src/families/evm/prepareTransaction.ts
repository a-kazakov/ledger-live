import { Account } from "../../types";
import { Transaction as EvmTransaction } from "./types";

export const prepareTransaction = async (
  a: Account,
  t: EvmTransaction
): Promise<EvmTransaction> => Promise.resolve(t);
