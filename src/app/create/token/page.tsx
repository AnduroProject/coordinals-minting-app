
"use client";

import React, { useContext, useState } from "react";
import Banner from "@/components/section/banner";
import Header from "@/components/layout/header";
import Input from "@/components/ui/input";
import ButtonLg from "@/components/ui/buttonLg";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
import { tokenData, TokenInfo } from "@/types";
import { getContractInfo, getProvider, mintToken } from "@/utils/mint";
import Layout from "@/components/layout/layout";
import {
  ASSETTYPE,
  FEERATE,
  RECEIVER_ADDRESS,
  tokenContractAddress,
  ownerAddress,
} from "@/lib/constants";
import Image from "next/image";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";
import { useConnector } from "anduro-wallet-connector-react";
import { ethers, Transaction } from "ethers"
import { tokenAbi } from "@/utils/tokenAbi";
import { CloseCircle, Copy } from "iconsax-react";
import { convertToSubstring } from "@/lib/utils";


const SingleToken = () => {
  const router = useRouter();

  const { signAndSendTransaction, walletState } =
    React.useContext<any>(useConnector);
  const {
    ticker,
    setTicker,
    headline,
    setHeadline,
    supply,
    setSupply,
    imageUrl,
    setImageUrl,
    setTxUrl,
    txUrl,
    reset,
  } = useFormState();

  // const [ticker, setTicker] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [networkType, setnetworkType] =
    React.useState<string>("")
  const [showImage, setShowImage] = React.useState(false)
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenData, setTokenData] = useState<TokenInfo | null>(null);
  const [alysaddress, setAlysaddress] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [txid, setTxid] = useState<string>("");


  interface FormInputData {
    headline: string;
    ticker: string;
    imageUrl: string;
    supply: number
  }

  React.useEffect(() => {
    reset()
    console.log("==addres", localStorage.getItem("address"))
    setAlysaddress(localStorage.getItem("address") || "")
  }, []);

  React.useEffect(() => {
    if (walletState.connectionState == "disconnected") {
      setError("Wallet is not connected.");
    }
    else {
      setError("");
    }
    const chainId = localStorage.getItem("chainId")
    const walletconnection = localStorage.getItem("isWalletConnected")
    if (walletconnection === "true") {
      if (chainId === "5") {
        setnetworkType("Coordinate")
      } else if (chainId === "6") {
        setnetworkType("Alys")

      }
    }
  }, [walletState]);


  React.useEffect(() => {
    // alysTokenInfo(tokenContractAddress)
    //   .then((tokenInfo) => {
    //     console.log("Token Info:", tokenInfo);
    //     console.log("Token Info supply:", tokenInfo.total_supply);
    //     const Data: TokenInfo = {
    //       //address: tokenInfo.address,
    //       name: tokenInfo.name,
    //       symbol: tokenInfo.symbol,
    //       total_supply: tokenInfo.total_supply,
    //     };
    //     setTokenData(Data)
    //   })

    //   .catch((error) => {
    //     console.error("Error fetching alys token info:", error);
    //   });

    getContractInfo(tokenContractAddress, tokenAbi)
      .then(contract => {
        const { contract: tokenContract } = contract;

        return Promise.all([
          tokenContract.balanceOf(ownerAddress),
          tokenContract.name(),
          tokenContract.symbol()
        ]);
      })
      .then(([balance, name, symbol]) => {
        console.log("===balance", balance.toString());
        console.log("===balance format", ethers.formatEther(balance));
        const Data: TokenInfo = {
          name: name,
          symbol: symbol,
          total_supply: ethers.formatEther(balance),
        };
        setTokenData(Data)
        console.log("===Token Name:", name);
        console.log("===Token Symbol:", symbol);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  }, [tokenData?.total_supply]);


  const handleDelete = (): void => {
    setImageUrl("")
    setShowImage(false)
    setErrorMessage('');
  }

  const handleImageError = () => {
    setShowImage(false);
    setErrorMessage('Please provide a valid image URL.');
  };
  const handleImageLoad = () => {
    setShowImage(true);
    setErrorMessage('');
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(txid).then(() => {
      setIsCopied(true);
      toast.success("Copied!");
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const validateForm = (inputData: FormInputData): { isValid: boolean; error?: string } => {
    const { headline, ticker, imageUrl, supply } = inputData;
    console.log("type oif no====", typeof (supply))
    console.log("==netwoektypw", networkType)

    if (networkType === "Coordinate") {

      if (headline.trim().length === 0) {
        return { isValid: false, error: "Headline is not provided." };
      }
      if (headline.trim().length > 50) {
        return { isValid: false, error: "Headline should be 50 characters long." };
      }
      if (ticker.trim().length === 0) {
        return { isValid: false, error: "Ticker is not provided." };
      }
      if (ticker.trim().length > 7) {
        return { isValid: false, error: "Ticker should be 7 characters long." };
      }
      if (/[^a-zA-Z]/.test(ticker)) {
        return {
          isValid: false,
          error: "Ticker  contains special characters, numbers, or spaces that are not allowed",
        }
      }
      if (imageUrl.trim() === "") {
        return { isValid: false, error: "Image is not provided." };
      }
    }

    if (supply <= 0) {
      console.log("supply====")
      return {
        isValid: false,
        error: "Provide valid supply",
      }

    }
    if (supply > 2100000000000000 && networkType === "Coordinate") {
      return {
        isValid: false,
        error: "Max supply is 2100000000000000",
      }
    }
    console.log("Token supply:", Number(tokenData?.total_supply));
    console.log("Token supplysupply:", supply);

    if (supply > Number(tokenData?.total_supply) && networkType === "Alys") {

      return {
        isValid: false,
        error: "Available supply " + Number(tokenData?.total_supply)
      }
    }


    if (errorMessage) {
      return { isValid: false };

    }
    return { isValid: true };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setError("");
    event.preventDefault();
    setIsLoading(true);


    const inputData: FormInputData = {
      headline,
      ticker,
      imageUrl,
      supply
    };


    const validationResult = validateForm(inputData);

    if (!validationResult.isValid) {
      setError(validationResult.error || "Provide valid data");
      setIsLoading(false);
      return;
    }
    else {
      setError("");
    }
    const opReturnValues = [
      {
        image_url: imageUrl,
      },
    ];

    const data: tokenData = {
      address: RECEIVER_ADDRESS,
      opReturnValues,
      assetType: ASSETTYPE.TOKEN,
      headline,
      ticker,
      supply,
    };


    try {
      if (networkType === "Alys") {

        console.log("====contractAddress", tokenContractAddress)
        const contractData = await getContractInfo(tokenContractAddress, tokenAbi)
        console.log("----alys.contractData", contractData)

        if (!contractData.gasPrice) {
          return
        }

        const gethex = await contractData.contract.transfer(
          alysaddress,
          ethers.parseEther(supply.toString()),
          {
            chainId: "212121",
            gasPrice: contractData.gasPrice,
            nonce: contractData.nonces,
          },
        )
        console.log("gethex ..----------.", gethex)

        try {
          if (gethex.hash) {
            setTxid(gethex.hash)
            setTxUrl("http://testnet.alyscan.io/address/" + gethex.hash + "/transactions")
            setError("")
            setStep(1);
            setIsLoading(false);
          } else {
            setError(error)
            toast.error(error)
            setStep(0);
            setIsLoading(false);

          }
        } catch (error) {
          console.error("Error decoding data:", error);
        }
      }
      else {
        // Call the mintToken function with the required data
        const transactionResult = await mintToken(data, FEERATE);
        if (transactionResult) {
          const result = await signAndSendTransaction({
            hex: transactionResult,
            transactionType: "normal",
          }); console.log("🚀 ~ sendTransactionresult ~ res:", result);

          if (result && result.error) {
            const errorMessage = typeof result.error === "string"
              ? result.error
              : result.error.result || "An error occurred";

            setError(errorMessage);
            toast.error(errorMessage);
            setStep(0);
            setIsLoading(false);

          } else {
            setError("")
            setTxid(result.result)
            setTxUrl("https://testnet.coordiscan.io/tx/" + result.result)
            setStep(1);
            setIsLoading(false);
          }

        }
      }
    } catch (error: any) {
      console.log("🚀 ~ handleSubmit ~ error:", error);

      //console.log("🚀 ~ handleSubmit ~ error:", JSON.stringify(error));
      setError(error.message);
      toast.error(error.message || "An error occurred");
      setIsLoading(false);
    }
  };

  const triggerRefresh = () => {
    setStep(0);
    reset();
    router.push("/create/token");
  };

  const getTitle = (step: any, networktype: any) => {
    if (step === 0) {
      if (networktype === "Coordinate") return "Create Token";
      if (networktype === "Alys") return "Transfer Token";

    }
    else if (step === 1) {
      if (networktype === "Coordinate") return "Token created successfully";
      if (networktype === "Alys") return "Token transfered successfully";
    }
    return ""
  };
  const stepperData = ["Upload", "Confirm"];

  return (
    <Layout>
      <div className="flex flex-col w-full h-full pb-[148px]">
        <div className="flex flex-col items-center gap-16 z-50">
          <Banner
            title={getTitle(step, networkType)}
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <form onSubmit={handleSubmit}>
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="flex flex-col w-full gap-8">
                  <p className="text-profileTitle  text-white text-neutral20 font-bold">
                    {networkType} Token
                  </p>
                  <div className="input_padd">
                    {/* <select className="px-5 py-3.5 bg-background border rounded-xl border-neutral50 text-lg2 placeholder-neutral200 text-neutral-50 w-full" onChange={(event) => setnetworkType(event.target.value)}>
                      <option value="coordinate">Coordinate</option>
                      <option value="alys">Alys</option>
                    </select> */}
                  </div>
                  <div className="w-full gap-6 flex flex-col">

                    {networkType === "Coordinate" &&
                      <>
                        <Input
                          title="Name"
                          text="Token name"
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                        />
                        <Input
                          title="Ticker"
                          text="Token ticker"
                          value={ticker}
                          onChange={(e) => {
                            setTicker(e.target.value)
                            setError("")
                          }}
                        />
                        {/* NaN erro */}
                        <Input
                          title="Supply"
                          text="Token supply"
                          value={supply}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSupply(value === "" ? 1 : parseInt(value, 10));

                          }}
                          type="number"
                        />
                        <Input
                          title="Token logo image url"
                          text="Token logo image url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setErrorMessage('');
                            setError("")
                          }}

                        />
                        <div className="mt-2.5">
                          {imageUrl && (
                            <div className="relative inline-block">

                              <img
                                src={imageUrl}
                                alt="Token Logo Preview"
                                style={{
                                  maxWidth: '200px',
                                  maxHeight: '200px',
                                  objectFit: 'contain',
                                  border: '1px solid #ccc',
                                  padding: '5px',
                                  display: showImage ? 'block' : 'none',
                                }}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                              />
                              {showImage ? (
                                <button onClick={handleDelete} className="absolute -top-1.5 -right-1.5 bg-background rounded-full">
                                  <CloseCircle size={16} color="#F8F9FA" />
                                </button>
                              ) : (
                                errorMessage && (
                                  <p className="text-red-500">{errorMessage}</p>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    }
                    {networkType === "Alys" &&
                      <><p className="text-profileTitle  text-white text-neutral20 font-bold">
                        {tokenData?.name}

                      </p><Input
                          title="Supply"
                          text="Token supply"
                          value={supply}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSupply(value === "" ? 1 : parseInt(value, 10));

                          }}
                          type="number" /></>
                    }
                  </div>
                </div>
                {/* <div className="flex flex-col gap-8 w-full">
                  <p className="text-profileTitle text-neutral50 font-bold">
                    Token logo (Optional)
                  </p>
                  {imageBase64 ? (
                    <UploadFile image={imageBase64} onDelete={handleDelete} />
                  ) : (
                    <UploadFile
                      text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                      handleImageUpload={handleImageUpload}
                    />
                  )}
                </div> */}
                {
                  walletState.connectionState == "connected" ?
                    <div className="flex flex-row gap-8 justify-between w-full">
                      <ButtonOutline
                        title="Back"
                        onClick={() => {
                          router.push("/")
                          reset();
                        }
                        }
                      />
                      <ButtonLg
                        type="submit"
                        isSelected={true}
                        isLoading={isLoading}
                      // disabled={isLoading}
                      >
                        {isLoading ? "...loading" : "Continue"}
                      </ButtonLg>
                    </div> : null}
              </div>
              {error && <div className="text-red-500">{error}</div>}
            </form>
          )}
          {step == 1 && (
            <div className="w-full max-w-[800px] flex flex-col gap-10 px-4">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                {networkType === "Coordinate" &&
                  <img
                    src={imageUrl}
                    alt="background"
                    width={0}
                    height={160}
                    sizes="100%"
                    className="w-[280px] h-[280px] object-cover rounded-3xl"
                  />
                }
                <div className="flex flex-row gap-6">
                  <div className="flex flex-row gap-3">
                    {networkType === "Coordinate" ?
                      <p className="text-3xl text-neutral50 font-bold">
                        {ticker}
                      </p> :
                      <><div className="h-16 w-16 rounded-full flex items-center justify-center font-bold 
                      text-neutral50 border-neutral50 border">
                        <p className="text-2xl text-neutral50 font-bold">
                          {tokenData?.name.charAt(0).toUpperCase()}
                        </p>
                      </div>
                        <div><p className="text-3xl text-neutral50 font-bold leading-7 mb-1.5">
                          {supply} {tokenData?.symbol}
                        </p>
                          <p className="text-neutral100 text-xl flex flex-row items-center justify-center">
                            Tx Id : {convertToSubstring(txid, 6, 4)}
                            <button
                              onClick={handleCopy}
                              className={`text-brand p-1 hover:bg-gray-100 rounded ${isCopied ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                }`}
                              disabled={isCopied}
                              aria-label="Copy transaction link"
                            >
                              <Copy size="16" />
                            </button>
                          </p>
                        </div></>
                    }
                    {networkType === "Coordinate" &&
                      <p className="text-xl text-neutral100 font-medium">
                        Total supply: {supply}
                      </p>
                    }
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center">
                <p className="text-neutral100 text-xl flex flex-row items-center justify-center">
                  <a href={txUrl} target="_blank" className="text-brand">
                    {networkType === "Coordinate" ? (
                      <p>View on Coordinate :</p>
                    ) : (
                      <p>View  on Alys</p>
                    )}
                  </a>
                </p>
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  onClick={() => router.push("/")}
                />
                <ButtonLg
                  type="submit"
                  isSelected={true}
                  isLoading={isLoading}
                  disabled={isLoading}
                  onClick={() => triggerRefresh()}
                // onClick={() => router.reload()}
                >
                  Create
                </ButtonLg>
              </div>

            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SingleToken;
