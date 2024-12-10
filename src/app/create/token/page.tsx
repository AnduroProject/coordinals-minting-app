
"use client";

import React, { useContext, useState } from "react";
import Banner from "@/components/section/banner";
import Header from "@/components/layout/header";
import Input from "@/components/ui/input";
import ButtonLg from "@/components/ui/buttonLg";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
import { tokenData } from "@/types";
import { getContractInfo, getProvider, mintToken } from "@/utils/mint";
import Layout from "@/components/layout/layout";
import {
  ASSETTYPE,
  FEERATE,
  RECEIVER_ADDRESS,
  MOCK_MENOMIC,
  tokenContractAddress,
  privateKey,
} from "@/lib/constants";
import Image from "next/image";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";
import { useConnector } from "anduro-wallet-connector-react";
import { ethers, Transaction } from "ethers"
import { tokenAbi } from "@/utils/tokenAbi";
import { CloseCircle } from "iconsax-react";

const SingleToken = () => {
  const router = useRouter();

  const { signAndSendTransaction, walletState, signAlysTransaction } =
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
  const [connect, setConnect] = useState<boolean>(false);
  const [networkType, setnetworkType] =
    React.useState<string>("")
  const [showImage, setShowImage] = React.useState(false)
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (walletState.connectionState == "disconnected") {
      setError("Wallet is not connected.");
    }
    else {
      setError("");
    }
    const chainId = localStorage.getItem("chainId")

    if (chainId === "5") {
      setnetworkType("Coordiante")
    } else if (chainId === "6") {
      setnetworkType("Alys")

    }
  }, [walletState]);


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
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setError("");
    event.preventDefault();
    setIsLoading(true);

    // if (!imageUrl) {
    //   setIsLoading(false);
    //   setError("Image not provided.");
    //   return;
    // }

    // if (!headline) {
    //   setError("headline not provided.");
    //   setIsLoading(false);
    //   return;
    // }

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

    if (supply == 0) {
      setError("Supply can not be 0.");
      setIsLoading(false);
      return;
    }

    if (!supply) {
      setError("Supply can not be empty");
      setIsLoading(false);
      return;
    }

    if (supply == 2100000000000000) {
      setError("Max amount of supply is 2100000000000000");
      setIsLoading(false);
      return;
    }

    // if (data.ticker.length > 7) {
    //   setIsLoading(false);
    //   setError("Invalid ticker. Need to be no longer than 7 character long");
    //   return;
    // }
    try {
      if (networkType === "Alys") {

        console.log("====contractAddress", tokenContractAddress)
        const alysaddress = localStorage.getItem("address") || "";
        const contractData = await getContractInfo(alysaddress, tokenContractAddress, tokenAbi)

        // const provider = getProvider(chromaBookApi)
        // console.log("---provider", provider)
        // const signer = new ethers.Wallet(privateKey, provider)
        // const nonces = await provider.getTransactionCount(alysaddress, "pending")
        // console.log("----nonces", nonces)
        // const contract = new ethers.Contract(tokenContractAddress, tokenAbi, signer);
        // console.log("----contract", contract)

        // const gasPrice = (await provider.getFeeData()).gasPrice
        // console.log("----gasPrice", gasPrice)

        console.log("----alys.contractData", contractData)

        if (!contractData.gasPrice) {
          return
        }
        const gethex = await contractData.contract.transfer.populateTransaction(
          alysaddress,
          tokenContractAddress,
          {
            chainId: "212121",
            gasPrice: contractData.gasPrice,
            nonce: contractData.nonces,
          },
        )
        const newtx = new Transaction()
        newtx.to = alysaddress
        newtx.data = gethex.data
        newtx.value = ethers.parseEther(supply.toString())
        console.log(
          "populatetransaction 2 ..----------alys token hex----------.",
          newtx.unsignedSerialized,
        )
        try {
          const result = await signAlysTransaction({
            hex: newtx.unsignedSerialized,

          });
          console.log("🚀 ~ signAlysTransaction ~ res:", result);
          console.log(" tx hash ..----------.", result.result.txid)

          if (result) {
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
        //console.log("🚀 ~ handleSubmit ~ res:", transactionResult);
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
            setStep(1);
            setIsLoading(false);
          }

        }
      }
    } catch (error: any) {
      console.log("🚀 ~ handleSubmit ~ error:", JSON.stringify(error));
      setError(error.message);
      toast.error(error.message || "An error occurred");
      setIsLoading(false);
    }
  };

  const triggerRefresh = () => {
    setStep(0);
    //reset();
    router.push("/create/token");
  };

  const stepperData = ["Upload", "Confirm"];

  return (
    <Layout>
      <div className="flex flex-col w-full h-full pb-[148px]">
        <div className="flex flex-col items-center gap-16 z-50">
          <Banner
            title="Create token"
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <form onSubmit={handleSubmit}>
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="flex flex-col w-full gap-8">
                  <p className="text-profileTitle text-neutral20 font-bold">
                    {networkType} Token
                  </p>
                  <div className="input_padd">
                    {/* <select className="px-5 py-3.5 bg-background border rounded-xl border-neutral50 text-lg2 placeholder-neutral200 text-neutral-50 w-full" onChange={(event) => setnetworkType(event.target.value)}>
                      <option value="coordinate">Coordinate</option>
                      <option value="alys">Alys</option>
                    </select> */}
                  </div>
                  <div className="w-full gap-6 flex flex-col">

                    {networkType === "Coordiante" &&
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
                          onChange={(e) => setTicker(e.target.value)}
                        />
                        {/* NaN erro */}
                        <Input
                          title="Supply"
                          text="Token supply"
                          value={supply}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSupply(value === "" ? 0 : parseInt(value, 10));
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
                          }}

                        />
                        {imageUrl && (
                          <div style={{ marginTop: '10px' }}>

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
                          </div>
                        )}
                        {showImage ? (
                          <button onClick={handleDelete} style={{ marginTop: '10px' }}>
                            <CloseCircle size={16} color="#F8F9FA" />
                          </button>
                        ) : (
                          errorMessage && (
                            <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
                          )
                        )}
                      </>
                    }
                    {networkType === "Alys" &&
                      <Input
                        title="Supply"
                        text="Token supply"
                        value={supply}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSupply(value === "" ? 0 : parseInt(value, 10));
                        }}
                        type="number"
                      />
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
                        onClick={() => router.push("/")}
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
            <div className="w-[800px] flex flex-col gap-16">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                <img
                  src={imageUrl}
                  alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-cover rounded-3xl"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    {networkType === "Coordiante" &&
                      <p className="text-3xl text-neutral50 font-bold">
                        ${ticker}
                      </p>
                    }
                    <p className="text-xl text-neutral100 font-medium">
                      Total supply: {supply}
                    </p>

                  </div>
                  <p className="text-neutral100 text-lg2">
                    <a href={txUrl} target="_blank" className="text-blue-600">
                      {txUrl}
                    </a>
                  </p>
                </div>
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
                  Create again
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
