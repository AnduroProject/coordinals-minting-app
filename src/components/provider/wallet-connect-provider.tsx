"use client";

import { UseConnectorProvider } from "anduro-wallet-connector-react";
import { WALLET_URL } from "@/lib/constants";
// import { WALLETURL } from "../config/config";

UseConnectorProvider;
export default function WalletConnecProvider(props: any) {
  return (
    <>
      <UseConnectorProvider walletURL={WALLET_URL}>
        {props.children}
      </UseConnectorProvider>
    </>
  );
}
