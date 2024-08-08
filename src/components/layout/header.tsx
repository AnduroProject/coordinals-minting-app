"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import HeaderItem from "../ui/headerItem";
import { WALLET_URL } from "@/lib/constants";
import { useConnector } from "anduro-wallet-connector-react";
import { toast } from "sonner";

const routesData = [
  {
    title: "Create",
    pageUrl: "/create",
  },
];
export default function Header() {
  const router = useRouter();
  const { networkState, walletState, connect, disconnect } =
    useContext<any>(useConnector);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  const handleDisconnectionAction = async () => {
    const result = await disconnect();
    console.log("*******Disconnect Result", result);
  };
  React.useEffect(() => {
    console.log("Connector Network Information", networkState);
    console.log("Connector Wallet Information", walletState);
  }, [walletState, networkState]);

  useEffect(() => {
    const connectWalletOnLoad = async () => {
      try {
        if (window) {
          const walletAddress = localStorage.getItem("connectedAddress");
          if (walletAddress) {
            // if (walletState.connectionState == "disconnected") {
            //   handleLogin();
            // }
            setWalletAddress(walletAddress);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    connectWalletOnLoad();
  }, [walletState]);

  const handleLogin = async () => {
    try {
      setIsConnecting(true);
      const response = await connect({
        chainId: 4,
        walletURL: WALLET_URL,
      });
      console.log("🚀 ~ handleLogin ~ response:", response);
      if (response.status == true) {
        console.log(
          "🚀 ~ handleLogin ~ response.result.accountPublicKey:",
          response.result.accountPublicKey,
        );

        const walletAddress = response.result.accountPublicKey;

        localStorage.setItem("connectedAddress", JSON.stringify(walletAddress));
        setWalletAddress(walletAddress);

        setIsConnecting(false);
        toast.success(`Successfully connected`);
        // }
      } else {
        setIsConnecting(false);
        toast.error(`Canceled`);
      }
    } catch (error) {
      toast.error(`Error when connecting wallet`);
      setIsConnecting(false);
      console.log(error);
    }
  };

  const handleLogout = async () => {
    setWalletAddress("");
    await handleDisconnectionAction();
    window.localStorage.removeItem("userProfile");
    router.push("/");
  };

  return (
    <div className="h-[72px] w-full flex justify-center bg-neutral500 bg-opacity-[50%] mt-5 rounded-3xl">
      <div className="flex flex-row justify-between items-center max-w-[1216px] w-full">
        <div className="flex flex-row justify-between items-center w-full pl-6 pr-4 h-full">
          <Link href={"/"}>
            <Image src={"/Logo.svg"} alt="coordinals" width={222} height={40} />
          </Link>
          <div className="flex flex-row overflow-hidden items-center gap-4">
            <div className="flex flex-row gap-2 text-neutral00">
              {routesData.map((item, index) => (
                <HeaderItem
                  key={index}
                  title={item.title}
                  handleNav={() => router.push(item.pageUrl)}
                />
              ))}
            </div>
            {walletAddress === "" ? (
              <Button
                variant={"outline"}
                size={"lg"}
                onClick={() => handleLogin()}
                disabled={isConnecting}
              >
                {isConnecting ? "Loading..." : "Connect Wallet"}
              </Button>
            ) : (
              <Button
                variant={"outline"}
                size={"lg"}
                onClick={() => handleLogout()}
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
