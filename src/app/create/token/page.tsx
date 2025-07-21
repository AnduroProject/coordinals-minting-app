
"use client";

import React, { useContext, useRef, useState } from "react";
import Banner from "@/components/section/banner";
import Header from "@/components/layout/header";
import Input from "@/components/ui/input";
import ButtonLg from "@/components/ui/buttonLg";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
import { tokenData, TokenInfo } from "@/types";
import {  mintToken } from "@/utils/mint";
import Layout from "@/components/layout/layout";
import {
  ASSETTYPE,
  FEERATE,
  RECEIVER_ADDRESS,
  tokenContractAddress,
  
} from "@/lib/constants";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";
import { useConnector } from "anduro-wallet-connector-react";
import { ethers } from "ethers"
import { tokenAbi } from "@/utils/tokenAbi";
import { CloseCircle, Copy } from "iconsax-react";
import { convertToSubstring } from "@/lib/utils";
import { contractInfo, tokenTransferInfo } from "@/lib/service/fetcher";
import axios from "axios";


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
    decimal,
    setDecimal,
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
  const [toaddress, setToaddress] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [txid, setTxid] = useState<string>("");
  const [imgSrc, setImgSrc] = useState('');
  const [csrfToken, setCsrfToken] = useState(null);
  const fetchCalled = useRef(false);
  interface FormInputData {
    headline: string;
    ticker: string;
    imageUrl: string;
    supply: number
  }

  React.useEffect(() => {
    reset()
    setToaddress(localStorage.getItem("address") || "")
  }, [walletState]);

  // React.useEffect(() => {
  //   if (networkType === "Coordinate") {
  //     setDecimal(8);
  //   } else if (networkType === "Alys") {
  //     setDecimal(18);
  //   }
  // }, [networkType]);
  
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

  React.useEffect(() => {

  }, [networkType]);

  React.useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("/api/auth");
        setCsrfToken(response.data.authToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };

    // if (!fetchCalled.current && csrfToken === null) {
    //   fetchCalled.current = true; 
    //   fetchCsrfToken();
    // }
    if (networkType !== "") {
      fetchCsrfToken();
    }
  }, [networkType]);


  React.useEffect(() => {
    if(networkType === "Alys"){
    contractInfo(tokenContractAddress, tokenAbi)
    .then((contractDetails) => {
     // console.log("Contract details fetched ", contractDetails);
      const Data: TokenInfo = {
              name: contractDetails.data.name,
              symbol: contractDetails.data.symbol,
              total_supply: contractDetails.data.balance,
              //ethers.parseUnits(contractDetails.data.balance.toString(),contractDetails.decimals),

            //  total_supply: ethers.formatEther(contractDetails.data.balance),
              decimal : contractDetails.data.decimals,
            };
            setTokenData(Data)
    })
    .catch((error) => {
      console.error("Error fetching contract details:", error);
    });
  }
  }, [tokenData?.total_supply,csrfToken]);


  const handleDelete = (): void => {
    setImageUrl("")
    setImgSrc('');
    setShowImage(false)
    setErrorMessage('');
  }

  const handleImageError = () => {
    setImgSrc('/default_asset_image.png');
    setShowImage(false);
    //setErrorMessage('Please provide a valid image URL.');
  };

  const handleTokenDecimalChange = (value: any) => {
    if (!/^\d+$/.test(value) && value.toString().trim() !== "") {
      return
    }
    setDecimal(value.trim())
  }

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
  
    let supply_range = 21 * 1e14 // 2100000000000000
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
      if (decimal <= 0 || decimal >= 9) {
        return { isValid: false, 
          error: "The token decimal should be greater than 0 and less than 9." }
      }
      
    }
  
    // if (networkType === "Alys") {
    //   if (decimal < 0 || decimal >= 19) {
    //     return { isValid: false, 
    //       error: "The token decimal should be greater than 0 and less than 19." }
    //   }
    // }
    if (supply <= 0) {
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
    const numericSupply = Number(supply);
   

    if (
      isNaN(numericSupply) ||
      !Number.isInteger(numericSupply)
    
    ) {
      return {
        isValid: false,
        error: "Supply must be an integer between 1 and 100",
      };
    }

    if (supply * 10 ** decimal > supply_range && networkType === "Coordinate")
    {  
      let supplyLimit = supply_range
      supplyLimit = supply_range / 10 ** decimal
      return {
        isValid: false,
        error:  "Given that supply is out of range, supply should be less than or equal to"
           +  Number(supplyLimit),
      }
    } 

  
  

    
    //Number(tokenData?.total_supply));

    if ((supply *10 ** tokenData?.decimal > Number(tokenData?.total_supply) && networkType === "Alys") ||
      (supply > 100 && networkType === "Alys")) 
      {
      return {
        isValid: false,
        error: supply > 100
          ? "Supply must be less than or equal to 100"
          :"Provided supply is higher than available"
          // : "Available supply" + Number(tokenData?.total_supply)
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
      precision:decimal
    };


    try {
      if (networkType === "Alys") {
     
        const tokenTranferDetails = await tokenTransferInfo(toaddress,supply)
        

        try {
          if (tokenTranferDetails.data) {
            setTxid(tokenTranferDetails.data.hash)
            setTxUrl("http://testnet.alyscan.io/tx/" + tokenTranferDetails.data.hash)
            setError("")
            setStep(1);
            setIsLoading(false);
          } else {
            setError("Transaction Failed")
            //toast.error(error)
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
          }); 
          //console.log("🚀 ~ sendTransactionresult ~ res:", result);

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
            setTxUrl("https://testnet.coordiscan.io/tx/"+ result.result)
            setStep(1);
            setIsLoading(false);
          }

        }
      }
    } catch (error: any) {
     // console.log("🚀 ~ handleSubmit ~ error:", error);
      if (error.message.includes('Insufficient funds')) {
        const err = 'Insufficient funds for this transaction';
        setError(err)
      } else {
        setError("Transaction Failed");
        //toast.error(error.message || "An error occurred");
        setIsLoading(false);
      }

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

                    {(networkType === "Coordinate" || networkType === "") && (<>
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
                      <Input
                        title="Decimal"
                        text="Decimal"
                        value={decimal}
                        onChange={(event: any) => handleTokenDecimalChange(event.target.value)}
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
                        title="Token image url"
                        text="Token image url"
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
                                //display: showImage ? 'block' : 'none',
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
                    </>
                    )}
                    {networkType === "Alys" &&
                      <>
                        {tokenData &&
                          <p className="text-profileTitle  text-white text-neutral20 font-bold">
                            Name :  {tokenData?.name}
                          </p>}
                        <Input
                          title="Supply"
                          text="Token supply"
                          value={supply}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSupply(value === "" ? 1 : parseInt(value, 10));

                          }}
                          type="number" />
                          {/* <Input
                        title="Decimal"
                        text="Decimal"
                        value={decimal}
                        onChange={(event: any) => handleTokenDecimalChange(event.target.value)}
                      /> */}
                      </>
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
                    src={imgSrc}
                    alt="background"
                    width={0}
                    height={160}
                    sizes="100%"
                    className="w-[280px] h-[280px] object-cover rounded-3xl"

                  />
                }
                <div className="flex flex-row gap-6">
                  {networkType === "Coordinate" &&
                    <div className="flex flex-col gap-3">
                      <><p className="text-xl text-neutral50 font-bold">
                        Name :  {headline}
                      </p><p className="text-xl text-neutral50 font-bold">
                          Symbol : {ticker}
                        </p>
                        <p className="text-xl text-neutral50 font-bold">
                          Supply :  {supply}
                        </p></>
                      <><p className="text-neutral100 text-xl flex flex-row items-center justify-center font-bold">
                        Tx Id : {convertToSubstring(txid, 6, 4)}
                        <button
                          onClick={handleCopy}
                          className={`text-brand p-1 hover:bg-gray-100 rounded ${isCopied ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                          disabled={isCopied}
                          aria-label="Copy transaction link"
                        >
                          <Copy size="16" />
                        </button>
                      </p></>
                    </div>
}
{networkType === "Alys" &&
                    <div className="flex flex-row gap-3">
                      <><div className="h-16 w-16 rounded-full flex items-center justify-center font-bold 
                      text-neutral50 border-neutral50 border">
                        <p className="text-2xl text-neutral50 font-bold">
                          {tokenData?.name.charAt(0).toUpperCase()}
                        </p>
                      </div>
                    
                        <div>  {tokenData && 
                          <p className="text-xl text-neutral50 font-bold leading-7 mb-1.5">
                          Symbol :  {tokenData?.symbol}
                        </p>}
                          <p className="text-xl text-neutral50 font-bold leading-7 mb-1.5">
                            Supply : {supply}
                          </p>
                          <p className="text-neutral100 text-xl flex flex-row font-bold">
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
                    </div>
                  }

                </div>
              </div>
              <div className="flex flex-row items-center justify-center">
                <div className="text-neutral100 text-xl flex flex-row items-center justify-center">
                  <a href={txUrl} target="_blank" className="text-brand">
                    {networkType === "Coordinate" && 
                      <p>View on Coordinate </p>
                    } 
                    {networkType === "Alys" &&
                      <p>View  on Alys</p>
                    }
                  </a>
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
