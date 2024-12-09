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
  const { networkState, walletState, connect, disconnect, networkInfo } =
    useContext<any>(useConnector);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = React.useState<string>("false")
  const [isOpenNetworkPopup , setIsOpenNetworkPopup] = React.useState<boolean>(false)

  const handleDisconnectionAction = async () => {
    const result = await disconnect();
    console.log("*******Disconnect Result", result);
    if (result.status === true) {
      setWalletAddress("");
      localStorage.removeItem("isWalletConnected")

      setIsConnecting(false)
      toast.success(`Wallet  disconnected`);

    }
  };
  const handleNetworkInfo = async () => {
    const result = await networkInfo()
    console.log("*******INITIALIZE RESULT", result)

    if (result.status === true) {
      localStorage.setItem("isWalletConnected", "true")
      setIsWalletConnected("true")
    } else {
      localStorage.removeItem("isWalletConnected")
      setIsWalletConnected("false")
    }
  }

  React.useEffect(() => {
    console.log("Connector Network Information", networkState);
    console.log("Connector Wallet Information", walletState);
    const walletconnection = localStorage.getItem("isWalletConnected")
    console.log("======walletconnection ", walletconnection)

    if (walletState.connectionState == "disconnected" && walletconnection === "true") {
      setWalletAddress("");
      localStorage.removeItem("isWalletConnected")
      handleNetworkInfo()
    } else if (walletState.connectionState == "connected") {
      setWalletAddress(walletState.accountPublicKey);
    }
  }, [walletState, networkState]);

  const openNetworkPopup = async () => {
    try {
      setIsOpenNetworkPopup(true)    
    } catch (error) {
      toast.error(`Error when connecting wallet`);
      setIsConnecting(false);
      setWalletAddress("");
      console.log(error);
    }
  };

  const handleLogin = async (chainId: number) => {
    setIsOpenNetworkPopup(false)
    try {
      console.log("======wallet url", WALLET_URL)
      const response = await connect({
        chainId: chainId,
        walletURL: WALLET_URL,
      });
      console.log("======wallet url 22", WALLET_URL)

      console.log("🚀 ~ handleLogin ~ response:", response);
      if (response.status == true) {
        console.log(
          "🚀 ~ handleLogin ~ response.result.accountPublicKey:",
          response.result.accountPublicKey,
        );

        const walletAddress = response.result.accountPublicKey;
        localStorage.setItem("connectedAddress", JSON.stringify(walletAddress));
        localStorage.setItem("xpubkey", response.result.xpubKey);
        localStorage.setItem("isWalletConnected", "true")
        

        setWalletAddress(walletAddress);
        setIsConnecting(true);
        toast.success(`Successfully connected`);
        // }
      } else {
        setIsConnecting(false);
        toast.error(`Canceled`);
        setWalletAddress("");

      }
    } catch (error) {
      toast.error(`Error when connecting wallet`);
      setIsConnecting(false);
      setWalletAddress("");
      console.log(error);
    }
  };

  const handleLogout = async () => {
    await handleDisconnectionAction();
    //  window.localStorage.removeItem("userProfile");
    router.push("/");
  };

  return (
    <div className="md:container xl:container">
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
                  onClick={() => openNetworkPopup()}
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

      <div className={`"fixed top-0 left-0 w-full h-full bg-overlayRgb flex justify-center items-center z-50" ${!isOpenNetworkPopup ? "hidden" : ""}`}>
       <div className="bg-white rounded-lg max-w-2xl w-full relative">
        <div className="grid grid-cols-12">
         <div className="col-span-4">
          <div className="p-5 bg-neutral100 rounded-l-lg">
           <Link href={"/"}>
              <Image src={"/Logo.svg"} alt="coordinals" width={160} height={40} />
            </Link>
           <h4 className="my-3">Connect chains</h4>
           <p className="text-sm mb-3">Connecting your network is like "logging in to Web3. Select your network from the options to get started.</p>
           <Link className="text-sm text-neutral700" href={"/"}>I don't have a network</Link>
          </div> 
         </div>
         <div className="col-span-8">
          <div className="border-b border-gray-400 flex flex-row justify-between items-center px-2">
           <h5>Available Chains</h5>
           <button className="bg-transparent border-none text-2xl">&times;</button>
          </div>
          <div className="grid grid-cols-12 gap-2 mt-4 px-2">
           <div className="col-span-6" onClick={() => handleLogin(5)}>
            <div className="border border-gray-400 p-2 rounded-lg flex flex-row items-center">
             <div className="border border-gray-400 p-1.5 rounded-lg">
              <Image
                src={"/cbtc.svg"}
                alt="background"
                width={20}
                height={20}
                sizes="100%"
                className="object-cover w-5 h-5"
              />
             </div>
             <p className="pl-2 text-base">Coordinate</p>
            </div>
           </div>
           <div className="col-span-6" onClick={() => handleLogin(6)}>
            <div className="border border-gray-400 p-2 rounded-lg flex flex-row items-center">
             <div className="border border-gray-400 p-1.5 rounded-lg">
              <Image
                src={"/alys.svg"}
                alt="background"
                width={20}
                height={20}
                sizes="100%"
                className="object-cover w-5 h-5 rounded-full"
              />
             </div>
             <p className="pl-2 text-base">Alys</p>
            </div>
           </div>
          </div>
         </div> 
        </div>
      </div>
     </div>
    </div>
    

  );
}