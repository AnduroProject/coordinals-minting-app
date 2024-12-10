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
import {  getContractInfo, getProvider, mintToken } from "@/utils/mint";
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
} from "@/lib/constants";
import { alysAssetData, tokenData } from "@/types";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";
import { useConnector } from "anduro-wallet-connector-react";
import { ethers, Transaction } from "ethers"
import { nftAbi } from "@/utils/nftAbi";
import path from "path";
import { nftInstance, saveJsonData } from "@/lib/service/fetcher";
import axios from "axios";
import { CloseCircle } from "iconsax-react";

const stepperData = ["Upload", "Confirm"];
const SingleCollectible = () => {
  const router = useRouter();
  const [networkType, setnetworkType] =
    React.useState<string>("")
  const {walletState, signAndSendTransaction,mintAlysAsset } =
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

    if(chainId === "5"){
      setnetworkType("Coordiante")
    }else if (chainId === "6"){
      setnetworkType("Alys")

    }
  }, [walletState]);

  React.useEffect(() => {
    console.log("network type.", networkType);

  }, [networkType]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    let mintId;
    // if (!imageBase64) {
    //   setError("Image is not provided.");
    //   setIsLoading(false);
    //   return;
    // }

    if (!headline) {
      setError("headline is not provided.");
      setIsLoading(false);
      return;
    }
    if (ticker.length > 7) {
      setError("Invalid ticker. Need to be no longer than 7 character long");
      setIsLoading(false);
      return;
    }

    const opReturnValues = [
      {
        image_data: imageUrl,
        //mime: imageMime,
      },
    ];

    const data: tokenData = {
      address: RECEIVER_ADDRESS,
      opReturnValues,
      assetType: ASSETTYPE.NFTONCHAIN,
      headline,
      ticker,
      supply: 1,
    };

    const alysData: alysAssetData = {
      headline,
      ticker,
      imageUrl,

    };
    try {

      // Call the mintToken function with the required data
      if (networkType === "Alys") {
console.log("network type,",networkType)
        console.log("====contractAddress", )

        const contractInstance = await nftInstance(nftContractAddress);
        console.log("====contractInstance", contractInstance)

        let tokenId = 0;
        if (contractInstance != null && Array.isArray(contractInstance.items) && contractInstance.items.length > 0) {
          tokenId = parseInt(contractInstance.items[0].id, 10);
        }
        mintId = tokenId + 1;
        console.log("====tokenId", tokenId)
        console.log("====mintId", mintId)
        const response = await saveJsonData(alysData, mintId || 0);
        console.log("response====", response.message);
        const contractData= await getContractInfo(alysaddress,nftContractAddress,nftAbi)

        // const provider = getProvider(alysRPCUrl)
        // console.log("---provider", provider)
        // const signer = new ethers.Wallet(privateKey, provider)
        // console.log("signer",signer)
        // const nonces = await provider.getTransactionCount(signer.address, "pending")
        // console.log("----nonces", nonces)
        // const contract = new ethers.Contract(nftContractAddress, nftAbi, signer);
        // console.log("----contract", contract)

        // const gasPrice = (await provider.getFeeData()).gasPrice
        // console.log("----gasPrice", gasPrice)

      //  console.log("----alys.contractData", contractData)

        if (!contractData.gasPrice) {
          return
        }
        console.log("url contruct", appBaseUrl + 'api/metaUri/' + mintId)
        const estimateTxFee = contractData.gasPrice * BigInt(30000);
        console.log("----estimateTxFee", estimateTxFee)
        console.log("====mintId 22", mintId)       
         console.log("====alysaddress 22", alysaddress)


        const gethex = await contractData.contract.safeMint.populateTransaction(
          alysaddress,
          mintId,
          appBaseUrl + 'api/metaUri/' + mintId,

          {
            gasPrice: contractData.gasPrice,
            nonce: contractData.nonces
          })
        
          console.log("gethex ..----------.", gethex)
          const inputData =
            [
              gethex.data, gethex.gasPrice?.toString(), gethex.nonce, gethex.to

            ];      
          const abiTypes = ["string" , "string", "uint256", "string"];
          try {
            const txHex = ethers.AbiCoder.defaultAbiCoder().encode(abiTypes, inputData);
            console.log("encoded :", txHex);
            const result = await mintAlysAsset({
              hex: txHex,
         
            }); 
            console.log("🚀 ~ mintAlysAsset ~ res:", result);
            console.log(" tx hash ..----------.", result.result.hash)

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
    reset();
    router.push("/create/collectible");
  };

  return (
    <Layout>
      <div className="flex flex-col w-full h-full bg-background items-center pb-[148px]">
        <div className="w-full flex flex-col items-center gap-16 z-50">
          <Banner
            title={
              step == 0
                ? "Create single Collectible"
                : "Your Collectible is successfully created!"
            }
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
                      onChange={(e) => setTicker(e.target.value)}
                    />
                  
                      <Input
                        title="Image url"
                        text="Image url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setErrorMessage(''); 
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
                    onClick={() => router.push("/")}
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
            <div className="w-[800px] flex flex-col gap-16">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                <img
                  src={imageUrl}
                  //alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-cover rounded-3xl"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-3xl text-neutral50 font-bold">
                      ${ticker}
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

export default SingleCollectible;
