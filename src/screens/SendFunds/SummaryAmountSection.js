/* @flow */
import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";
import type { Account } from "@ledgerhq/live-common/lib/types";
import SummaryRow from "./SummaryRow";
import CurrencyUnitValue from "../../components/CurrencyUnitValue";
import CounterValue from "../../components/CounterValue";
import LText from "../../components/LText";

import colors from "../../colors";

type Props = {
  account: Account,
  amount: *,
};
export default class SummaryAmountSection extends PureComponent<Props> {
  render() {
    const { account, amount } = this.props;
    return (
      <SummaryRow title="Amount">
        <View style={styles.amountContainer}>
          <LText style={styles.valueText}>
            <CurrencyUnitValue unit={account.unit} value={amount} />
          </LText>
          <LText style={styles.counterValueText}>
            (
            <CounterValue value={amount} currency={account.currency} showCode />
            )
          </LText>
        </View>
      </SummaryRow>
    );
  }
}
const styles = StyleSheet.create({
  amountContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  valueText: {
    fontSize: 16,
  },
  counterValueText: {
    fontSize: 12,
    color: colors.grey,
  },
});
