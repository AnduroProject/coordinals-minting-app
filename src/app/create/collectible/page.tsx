"use client";

import React, { useState } from "react";
import Header from "@/components/layout/header";
import Banner from "@/components/section/banner";
import ButtonLg from "@/components/ui/buttonLg";
import UploadFile from "@/components/section/uploadFile";
import Input from "@/components/ui/input";
import ButtonOutline from "@/components/ui/buttonOutline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getContractInfo, getProvider, mintToken } from "@/utils/mint";
import UploadCardFit from "@/components/atom/cards/uploadCardFit";
import Layout from "@/components/layout/layout";
import {
  ASSETTYPE,
  FEERATE,
  RECEIVER_ADDRESS,
  MOCK_MENOMIC,
  appBaseUrl,
  privateKey,
  nftContractAddress,
  alysRPCUrl,
  tokenContractAddress,
} from "@/lib/constants";
import { alysAssetData, tokenData } from "@/types";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";
import { useConnector } from "anduro-wallet-connector-react";
import { ethers, keccak256, toUtf8Bytes, Transaction } from "ethers"
import { nftAbi } from "@/utils/nftAbi";
import path from "path";
import { nftInstance, saveJsonData, storeTokenInfo, tokenInfo, } from "@/lib/service/fetcher";
import axios from "axios";
import { CloseCircle } from "iconsax-react";
import { getAlysTokenInfo } from "@/utils/libs";

const stepperData = ["Upload", "Confirm"];
const SingleCollectible = () => {
  const router = useRouter();
  const [networkType, setnetworkType] =
    React.useState<string>("")
  const { walletState, signAndSendTransaction, mintAlysAsset } =
    React.useContext<any>(useConnector);

  const {
    ticker,
    setTicker,
    headline,
    setHeadline,
    imageBase64,
    setImageBase64,
    imageMime,
    setImageMime,
    imageUrl,
    setImageUrl,
    setTxUrl,
    txUrl,
    reset,
  } = useFormState();

  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const alysaddress = localStorage.getItem("address") || "";

  const [showImage, setShowImage] = React.useState(false)
  const [errorMessage, setErrorMessage] = useState('');

  interface FormInputData {
    headline: string;
    ticker: string;
    imageUrl: string;
  }
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
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 1024 * 512
      if (file.size > maxSizeInBytes) {
        setError("Image size should not exceed 512 kB.");
        setIsLoading(false);
        return;
      }
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        const mime = base64
          .split(",")[0]
          .split(":")[1]
          .split(";")[0]
          .split("/")[1];
        setImageBase64(base64);
        setImageMime(mime);
      };

      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    console.log("network type.", networkType);
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
    console.log("network type.", networkType);

  }, [networkType]);


  const validateForm = (inputData: FormInputData): { isValid: boolean; error?: string } => {
    const { headline, ticker, imageUrl } = inputData;

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
    if (errorMessage) {
      return { isValid: false };

    }

    return { isValid: true };
  };


  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    let mintId;
    const inputData: FormInputData = {
      headline,
      ticker,
      imageUrl,
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
        //mime: imageMime,
      },
    ];
    const data: tokenData = {
      address: RECEIVER_ADDRESS,
      opReturnValues,
      assetType: ASSETTYPE.NFTOFFCHAIN,
      headline,
      ticker,
      supply: 1,
    };

    const alysData: alysAssetData = {
      name: headline,
      symbol: ticker,
      image: imageUrl,
      supply: 1,

    };
    try {

      // Call the mintToken function with the required data
      if (networkType === "Alys") {
        console.log("network type,", networkType)
        console.log("====contractAddress",)
    
        const token = await tokenInfo()
        console.log("====token", token)

        mintId = token.data[0].token_id + 1

        console.log("====mintId", mintId)
        console.log("====alysData", alysData)

        const response = await saveJsonData(alysData, mintId);
        console.log("response====", response.message);
        const contractData = await getContractInfo(nftContractAddress, nftAbi)

        if (!contractData.gasPrice) {
          return
        }
        // const estimateTxFee = contractData.gasPrice * BigInt(30000);
        // console.log("----estimateTxFee", estimateTxFee)
        console.log("====mintId 22", mintId)
        console.log("====alysaddress 22", alysaddress)


        const gethex = await contractData.contract.safeMint.populateTransaction(
          alysaddress,
          mintId,
          //appBaseUrl + 'api/metaUri/' + mintId,
          "https://mara-sidechain-tesnet-coordinate.s3.amazonaws.com/nft/" + mintId + ".json",
          {
            gasPrice: contractData.gasPrice,
            nonce: contractData.nonces
          })
    

        console.log("gethex ..----------.", gethex)
        // console.log(
        //   "populatetransaction 2 ..----------alys token hex----------.",
        //   newtx.unsignedSerialized,
        // )
        // const inputData =
        //   [
        //     gethex.data, gethex.gasPrice?.toString(), gethex.nonce, gethex.to

        //   ];
        // const abiTypes = ["string", "string", "uint256", "string"];
        try {
          // const txHex = ethers.AbiCoder.defaultAbiCoder().encode(abiTypes, inputData);
          // console.log("encoded :", txHex);
          // const result = await mintAlysAsset({
          //   hex: newtx.unsignedSerialized,

          // });
          const signedTxn = await contractData.signer.sendTransaction(gethex);
          console.log("signedTxn ..----------.", signedTxn)
          //const receipt = await signedTxn.wait();
         if(signedTxn){
          console.log("Transaction is successful!!!" + '\n'
          + "Transaction Hash:", (await signedTxn).hash + '\n' 
        )
          storeTokenInfo(mintId,alysData)
      
            setError("")
            setStep(1);
            setIsLoading(false);
         }

          else {
            setError(error)
            toast.error(error)
            setStep(0);
            setIsLoading(false);

          }
        } catch (error:any) {
          setIsLoading(false)
          setError("Transaction not processed")

          console.error("Error decoding data:", error);
        }
      }
      else {

        const transactionResult = await mintToken(data, FEERATE);
        console.log("🚀 ~ transactionResult:", transactionResult);
        if (transactionResult) {
          const result = await signAndSendTransaction({
            hex: transactionResult,
            transactionType: "normal",

          }); console.log("🚀 ~ signAndSendTransaction  ~ res:", result);

          if (result && result.error) {
            const errorMessage = typeof result.error === "string"
              ? result.error
              : result.error.result || "An error occurred";
            setError(errorMessage)
            toast.error(errorMessage)
            setStep(0);
            setIsLoading(false);
          } else {
            setError("")
            setStep(1);
            setIsLoading(false);

          }
        }
      }
      // if (transactionResult && transactionResult.error == false) {
      //   setError(transactionResult.message || "An error occurred"); // Set the error state
      //   toast.error(transactionResult.message || "An error occurred");
      //   setIsLoading(false);
      // } else if (transactionResult) {
      //   setError("");
      //   setResponse(transactionResult);
      //   setIsLoading(false);
      //   setTxUrl(
      //     `https://testnet.coordiscan.io/tx/${transactionResult.result}`,
      //   );
      //   setStep(1);
      // }

      //setStep(1);
    } catch (error: any) {
      setError(error.message || "An error occurred");
      toast.error(error.message || "An error occurred");
      return setIsLoading(false);
    }
  };

  // const handleDelete = () => {
  //   setImageBase64("");
  // };

  const triggerRefresh = () => {
    setStep(0);
    //reset();
    router.push("/create/collectible");
    reset();

  };

  const getTitle = (step: any, networktype: any) => {
    if (step === 0) {
      if (networktype === "Coordinate" || networktype === "Alys") return "Create Collectible";

    }
    else if (step === 1) {
      if (networktype === "Coordinate" || networktype === "Alys") return "Collectible created successfully";

    }
    return ""
  };
  return (
    <Layout>
      <div className="flex flex-col w-full h-full bg-background items-center pb-[148px]">
        <div className="w-full flex flex-col items-center gap-16 z-50">
          <Banner
            title={getTitle(step, networkType)}
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <form onSubmit={handleSubmit}>
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="flex flex-col gap-8 w-full">
                  {/* <p className="text-profileTitle text-neutral50 font-bold">
                    Details 
                  </p> */}
                  <div className="input_padd">
                    <p className="text-profileTitle text-neutral20 font-bold">
                      {networkType} Collectible
                    </p>
                    {/* <select className="px-5 py-3.5 bg-background border rounded-xl border-neutral50 text-lg2 placeholder-neutral200 text-neutral-50 w-full" onChange={(event) => setnetworkType(event.target.value)}>
                      <option value="coordinate">Coordinate</option>
                      <option value="alys">Alys</option>
                    </select> */}
                  </div>
                  <div className="flex flex-col gap-6 w-full">
                    <Input
                      title="Name"
                      text="Collectable name"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}

                    />

                    <Input
                      title="Ticker"
                      text="Collectable ticker"
                      value={ticker}
                      onChange={(e) => {
                        setTicker(e.target.value)
                        setError("")
                      }}

                    />

                    <Input
                      title="Image url"
                      text="Image url"
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
                  </div>
                </div>
                {/* {networkType === "coordinate" &&
                  <div className="w-full gap-8 flex flex-col">
                    <p className="text-profileTitle text-neutral50 font-bold">
                      Upload your Collectible
                    </p>
                    {imageBase64 ? (
                      <UploadCardFit
                        image={imageBase64}
                        onDelete={handleDelete}
                      />
                    ) : (
                      <UploadFile
                        text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                        handleImageUpload={handleImageUpload}
                      />
                    )}
                  </div>
                } */}
                {
                  walletState.connectionState == "connected" ?
                    <div className="w-full flex flex-row gap-8">
                      <ButtonOutline
                        title="Back"
                        onClick={() => {
                          router.push("/")
                          reset();}}
                      />
                      <ButtonLg
                        type="submit"
                        isSelected={true}
                        isLoading={isLoading}
                        disabled={isLoading}
                      >
                        {isLoading ? "...loading" : "Continue"}
                      </ButtonLg>
                    </div> : null}
              </div>
              <div className="text-red-500">{error}</div>
            </form>
          )}
          {step == 1 && (
            <div className="w-full max-w-[800px] flex flex-col gap-16 px-4">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                {/* {networkType === "Coordinate" && */}
                <img
                  src={imageUrl}
                  //alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-cover rounded-3xl"
                />
                {/* } */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-3xl text-neutral50 font-bold">
                      {headline}
                    </p>
                    <p className="text-3xl text-neutral50 font-bold">
                      {ticker}
                    </p>
                    <p className="text-xl text-neutral100 font-medium">
                      Total supply: {1}
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
                  onClick={() => triggerRefresh()}
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

export default SingleCollectible;
