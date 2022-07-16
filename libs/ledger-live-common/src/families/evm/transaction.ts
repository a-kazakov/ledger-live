import type {
  Transaction as EvmTransaction,
  TransactionRaw as EvmTransactionRaw,
} from "./types";
import { BigNumber } from "bignumber.js";
import {
  fromTransactionCommonRaw,
  toTransactionCommonRaw,
} from "../../transaction/common";
import type { Account } from "../../types";
import { getAccountUnit } from "../../account";
import { formatCurrencyUnit } from "../../currencies";
import { ethers } from "ethers";

export const formatTransaction = (
  { mode, amount, recipient, useAllAmount }: EvmTransaction,
  account: Account
): string =>
  `
${mode.toUpperCase()} ${
    useAllAmount
      ? "MAX"
      : amount.isZero()
      ? ""
      : " " +
        formatCurrencyUnit(getAccountUnit(account), amount, {
          showCode: true,
          disableRounding: true,
        })
  }${recipient ? `\nTO ${recipient}` : ""}`;

export const fromTransactionRaw = (
  rawTx: EvmTransactionRaw
): EvmTransaction => {
  const common = fromTransactionCommonRaw(rawTx);
  const tx: Partial<EvmTransaction> = {
    ...common,
    family: rawTx.family,
    mode: rawTx.mode,
    chainId: rawTx.chainId,
    nonce: rawTx.nonce,
    gasLimit: new BigNumber(rawTx.gasLimit),
  };

  if (rawTx.data) {
    tx.data = Buffer.from(rawTx.data);
  }

  if (rawTx.value) {
    tx.value = new BigNumber(rawTx.value);
  }

  if (rawTx.type) {
    tx.type = new BigNumber(rawTx.type);
  }

  if (rawTx.gasPrice) {
    tx.gasPrice = new BigNumber(rawTx.gasPrice);
  }

  if (rawTx.maxFeePerGas) {
    tx.maxFeePerGas = new BigNumber(rawTx.maxFeePerGas);
  }

  if (rawTx.maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = new BigNumber(rawTx.maxPriorityFeePerGas);
  }

  return tx as EvmTransaction;
};

export const toTransactionRaw = (tx: EvmTransaction): EvmTransactionRaw => {
  const common = toTransactionCommonRaw(tx);
  const txRaw: Partial<EvmTransactionRaw> = {
    ...common,
    family: tx.family,
    mode: tx.mode,
    chainId: tx.chainId,
    nonce: tx.nonce,
    gasLimit: tx.gasLimit.toFixed(),
  };

  if (tx.type) {
    txRaw.type = tx.type.toFixed();
  }

  if (tx.data) {
    txRaw.data = Buffer.from(tx.data).toString("hex");
  }

  if (tx.gasPrice) {
    txRaw.gasPrice = tx.gasPrice?.toFixed();
  }

  if (tx.maxFeePerGas) {
    txRaw.maxFeePerGas = tx.maxFeePerGas?.toFixed();
  }

  if (tx.maxPriorityFeePerGas) {
    txRaw.maxPriorityFeePerGas = tx.maxPriorityFeePerGas?.toFixed();
  }

  return txRaw as EvmTransactionRaw;
};

export const liveTxToEthersTx = (tx: EvmTransaction): ethers.Transaction => {
  return {
    to: tx.recipient,
    value: ethers.BigNumber.from(tx.value?.toFixed() || 0),
    data: `0x${tx.data?.toString("hex")}`,
    gasLimit: ethers.BigNumber.from(tx.gasLimit?.toFixed() || 0),
    nonce: tx.nonce,
    chainId: tx.chainId,
    gasPrice: ethers.BigNumber.from(tx.gasPrice?.toFixed() || 0),
    maxFeePerGas: ethers.BigNumber.from(tx.maxFeePerGas?.toFixed() || 0),
    maxPriorityFeePerGas: ethers.BigNumber.from(
      tx.maxPriorityFeePerGas?.toFixed() || 0
    ),
    type: tx.type?.toNumber() ?? 0,
  };
};

export default { formatTransaction, fromTransactionRaw, toTransactionRaw };
