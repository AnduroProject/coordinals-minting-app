"use client";

import React, { useRef, useState } from "react";
import Header from "@/components/layout/header";
import Banner from "@/components/section/banner";
import ButtonLg from "@/components/ui/buttonLg";
import Input from "@/components/ui/input";
import ButtonOutline from "@/components/ui/buttonOutline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { mintToken } from "@/utils/mint";
import Layout from "@/components/layout/layout";
import {
  ASSETTYPE,
  FEERATE,
  RECEIVER_ADDRESS,

} from "@/lib/constants";
import { alysAssetData, tokenData } from "@/types";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";
import { useConnector } from "anduro-wallet-connector-react";
import { nftAbi } from "@/utils/nftAbi";
import { nftMintInfo, saveJsonData, storeTokenId, tokenId, } from "@/lib/service/fetcher";
import { CloseCircle, Copy } from "iconsax-react";
import { convertToSubstring } from "@/lib/utils";
import axios from "axios";

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
  const [toaddress, setToaddress] = useState<string>("");

  const [showImage, setShowImage] = React.useState(false)
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [txid, setTxid] = useState<string>("");
  const [imgSrc, setImgSrc] = useState('');
  const [csrfToken, setCsrfToken] = useState(null);
    const fetchCalled = useRef(false);

  interface FormInputData {
    headline: string;
    ticker: string;
    imageUrl: string;
  }
  const handleDelete = (): void => {
    setImageUrl("")
    setImgSrc('');
    setShowImage(false)
    setErrorMessage('');
  }

  const handleImageError = () => {
    setImgSrc('/default_asset_image.png');
    setShowImage(false);
  };
  const handleImageLoad = () => {
    setShowImage(true);
    setErrorMessage('');
  };
  React.useEffect(() => {
    reset()
    setToaddress(localStorage.getItem("address") || "")
  }, [walletState]);

  const handleCopy = () => {
    navigator.clipboard.writeText(txid).then(() => {
      setIsCopied(true);
      toast.success("Copied!");
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  React.useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("/api/auth");
        setCsrfToken(response.data.authToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };  
    if (networkType !== "") {
      fetchCsrfToken();
    }

    // if (!fetchCalled.current && csrfToken === null) {
    //   fetchCalled.current = true; 
    
    // }
  }, [networkType]);

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
    else {
      setnetworkType("")
            router.push("/")

    }

  }, [walletState]);



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
        const token = await tokenId()
        mintId = token.tokenId + 1
        const response = await saveJsonData(alysData, mintId);
        const nftMintDetails = await nftMintInfo(toaddress, mintId)

        try {
          if (nftMintDetails.data.hash) {
            // console.log("Transaction is successful!!!" + '\n'
            //   + "Transaction Hash:", nftMintDetails.data.hash + '\n'
            // )
            const mintingId = await storeTokenId(mintId)
            if (mintingId.data.error) {
              setError(mintingId.data.error)
              setStep(0);
              setIsLoading(false);
            }else{
              setTxid(nftMintDetails.data.hash)
              setTxUrl("http://testnet.alyscan.io/tx/" + nftMintDetails.data.hash)
              setError("")
              setStep(1);
              setIsLoading(false);
            }
          
          }

          else {
            setError("Transaction Failed")
            setStep(0);
            setIsLoading(false);

          }
        } catch (error: any) {
          setIsLoading(false)
          setError("Transaction Failed")
          //console.error("Error decoding data:", error);
        }
      }
      else {

        const transactionResult = await mintToken(data, FEERATE);
        //console.log("🚀 ~ transactionResult:", transactionResult);
        if (transactionResult) {
          const result = await signAndSendTransaction({
            hex: transactionResult,
            transactionType: "normal",

          }); 
          //console.log("🚀 ~ signAndSendTransaction  ~ res:", result);
         // console.log("🚀 ~   ~ res:", result.result);

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
            setTxid(result.result)
            setTxUrl("https://testnet.coordiscan.io/tx/" + result.result)
            setIsLoading(false);

          }
        }
      }

    } catch (error: any) {
      setError(error.message || "An error occurred");
      //toast.error(error.message || "An error occurred");
      return setIsLoading(false);
    }
  };


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
                    <p className="text-profileTitle text-white text-neutral20 font-bold">
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
                        setImgSrc(e.target.value);
                        setErrorMessage('');
                        setError("")
                      }}
                    />
                    <div className="mt-2.5">
                      {imageUrl && (
                        <div className="relative inline-block">

                          <img
                            src={imgSrc}
                            alt="Token Logo Preview"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              display: showImage ? 'block' : 'none',
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                          />
                          {showImage ? (
                            <button onClick={handleDelete} className="absolute -top-2.5 -right-2.5 bg-background rounded-full">
                              <CloseCircle size={30} color="#F8F9FA" />
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
                          reset();
                        }}
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
            <div className="w-full max-w-[800px] flex flex-col gap-10 px-4">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                {/* {networkType === "Coordinate" && */}
                <img
                  src={imgSrc}
                  //alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-contain	bg-white rounded-3xl"
                />
                {/* } */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-xl text-neutral50 font-bold">
                      Name:  {headline}
                    </p>
                    <p className="text-xl text-neutral50 font-bold">
                      Symbol : {ticker}
                    </p>
                    <p className="text-xl text-neutral50 font-bold">
                      Supply {1}
                    </p>
                    <p className="text-xl text-neutral100 font-bold">
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
                  </div>
                </div>
              </div>
              <div className="">
                <p className="text-neutral100 text-lg2">
                  <p className="text-neutral100 text-xl flex flex-row items-center justify-center">
                    <a href={txUrl} target="_blank" className="text-brand">
                      {networkType === "Coordinate" &&
                        <p>View on Coordinate </p>
 }  {networkType === "Alys" &&
                        <p>View  on Alys</p>
                      }                    </a>
                  </p>
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
